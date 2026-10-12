-- Candidate atomic reservation function for the server-only chat credit ledger.
-- Apply only after security review and authenticated integration tests.
-- The API service must call this with its service-role credential only after it has
-- independently verified the user's bearer token. Never expose execute to client roles.
create or replace function public.reserve_ky_chat_credit(
  p_user_id uuid,
  p_request_id uuid,
  p_capability text
)
returns table (
  allowed boolean,
  reason text,
  credits_used integer,
  daily_limit integer,
  reset_at timestamptz,
  replayed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_reset timestamptz := ((now() at time zone 'utc')::date + 1)::timestamp at time zone 'utc';
  v_plan text := 'free';
  v_status text := 'active';
  v_expires timestamptz;
  v_grace timestamptz;
  v_is_premium boolean := false;
  v_limit integer := 3;
  v_used integer := 0;
  v_existing public.ky_chat_credit_usage%rowtype;
begin
  if p_user_id is null or p_request_id is null or p_capability is null then
    return query select false, 'invalid_request', 0, 0, v_reset, false;
    return;
  end if;

  -- Only AI chat operations consume credits. Unknown operations fail closed.
  if p_capability in ('guide.basic_overview', 'guide.basic_question') then
    v_limit := 3;
  elsif p_capability in (
    'guide.open_question', 'explore.advanced_sources', 'transits.advanced_analysis',
    'lifecycles.full', 'insights.history', 'insights.pattern_recognition',
    'connection.comparison', 'phs.detailed_interpretation'
  ) then
    v_limit := 30;
  else
    return query select false, 'capability_not_credit_eligible', 0, 0, v_reset, false;
    return;
  end if;

  -- Serialize each user's reservation decisions to prevent last-credit races.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || v_today::text, 0));

  select u.* into v_existing
  from public.ky_chat_credit_usage u
  where u.user_id = p_user_id and u.request_id = p_request_id;

  if found then
    if v_existing.capability <> p_capability then
      return query select false, 'idempotency_key_conflict', 0, v_limit, v_reset, true;
      return;
    end if;
    select count(*)::integer into v_used
    from public.ky_chat_credit_usage u
    where u.user_id = p_user_id and u.usage_date = v_today
      and u.outcome in ('reserved', 'consumed');
    return query select true, 'duplicate_request_no_new_charge', v_used, v_limit, v_reset, true;
    return;
  end if;

  select e.plan, e.status, e.expires_at, e.grace_until
    into v_plan, v_status, v_expires, v_grace
  from public.ky_entitlements e
  where e.user_id = p_user_id;

  if not found then
    v_plan := 'free';
    v_status := 'active';
    v_expires := null;
    v_grace := null;
  end if;

  v_is_premium :=
    v_plan = 'premium'
    and (
      (v_status in ('active', 'trialing') and (v_expires is null or v_expires > now()))
      or (v_status = 'grace' and v_grace is not null and v_grace > now())
    );

  if p_capability not in ('guide.basic_overview', 'guide.basic_question') and not v_is_premium then
    return query select false, 'premium_required', 0, v_limit, v_reset, false;
    return;
  end if;

  if v_is_premium then
    v_limit := 30;
  else
    v_limit := 3;
  end if;

  select count(*)::integer into v_used
  from public.ky_chat_credit_usage u
  where u.user_id = p_user_id and u.usage_date = v_today
    and u.outcome in ('reserved', 'consumed');

  if v_used >= v_limit then
    return query select false, 'daily_credit_limit_reached', v_used, v_limit, v_reset, false;
    return;
  end if;

  insert into public.ky_chat_credit_usage
    (user_id, request_id, usage_date, capability, outcome, policy_version)
  values
    (p_user_id, p_request_id, v_today, p_capability, 'reserved', 1);

  v_used := v_used + 1;
  return query select true, 'credit_reserved', v_used, v_limit, v_reset, false;
exception
  when unique_violation then
    -- A concurrent retry can only happen if a caller bypasses the per-user lock;
    -- never turn a duplicate key into an additional reservation.
    return query select false, 'idempotency_conflict_retry', 0, 0, v_reset, true;
end;
$$;

revoke all on function public.reserve_ky_chat_credit(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_ky_chat_credit(uuid, uuid, text) to service_role;

comment on function public.reserve_ky_chat_credit(uuid, uuid, text) is
  'Server-only atomic daily credit reservation. Caller must not invoke AI on replayed=true and must finalize/void reservation idempotently.';
