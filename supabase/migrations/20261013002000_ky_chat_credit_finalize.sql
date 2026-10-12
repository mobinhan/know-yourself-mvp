-- Idempotent finalization/voiding for a reserved chat credit.
-- Only the trusted API service may call this after the provider outcome is known.
create or replace function public.finalize_ky_chat_credit(
  p_user_id uuid,
  p_request_id uuid,
  p_outcome text
)
returns table (updated boolean, outcome text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current text;
begin
  if p_user_id is null or p_request_id is null or p_outcome not in ('consumed', 'voided') then
    return query select false, 'invalid_request';
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || (now() at time zone 'utc')::date::text, 0));

  select u.outcome into v_current
  from public.ky_chat_credit_usage u
  where u.user_id = p_user_id and u.request_id = p_request_id
  for update;

  if not found then
    return query select false, 'reservation_not_found';
    return;
  end if;

  if v_current = p_outcome then
    return query select false, v_current;
    return;
  end if;

  if v_current <> 'reserved' then
    return query select false, v_current;
    return;
  end if;

  update public.ky_chat_credit_usage
  set outcome = p_outcome, updated_at = now()
  where user_id = p_user_id and request_id = p_request_id;

  return query select true, p_outcome;
end;
$$;

revoke all on function public.finalize_ky_chat_credit(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.finalize_ky_chat_credit(uuid, uuid, text) to service_role;

comment on function public.finalize_ky_chat_credit(uuid, uuid, text) is
  'Server-only idempotent finalization. Provider success consumes the reservation; provider failure voids it. A finalized reservation cannot be changed.';
