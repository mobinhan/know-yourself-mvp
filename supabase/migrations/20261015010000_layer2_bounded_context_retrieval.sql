-- Know Yourself Layer 2 bounded-context support.
-- Additive only: reuse existing ky_conversations, ky_conversation_turns,
-- ky_user_memories and ky_saved_insights tables. Do not create duplicate history tables.

alter table public.ky_conversations
  add column if not exists context_summary text,
  add column if not exists summary_through_sequence integer not null default 0,
  add column if not exists summary_version integer not null default 1,
  add column if not exists summarized_at timestamptz;

alter table public.ky_conversations
  drop constraint if exists ky_conversations_summary_length_check;
alter table public.ky_conversations
  add constraint ky_conversations_summary_length_check
  check (context_summary is null or length(context_summary) <= 6000);

alter table public.ky_conversations
  drop constraint if exists ky_conversations_summary_sequence_check;
alter table public.ky_conversations
  add constraint ky_conversations_summary_sequence_check
  check (summary_through_sequence >= 0);

alter table public.ky_conversations
  drop constraint if exists ky_conversations_summary_version_check;
alter table public.ky_conversations
  add constraint ky_conversations_summary_version_check
  check (summary_version > 0);

-- Retrieval indexes. Existing history remains intact; the runtime must still
-- apply explicit row limits and token budgets.
create index if not exists ky_turns_recent_context_idx
  on public.ky_conversation_turns(user_id, conversation_id, sequence_number desc);

create index if not exists ky_memories_retrieval_idx
  on public.ky_user_memories(user_id, category, updated_at desc)
  where status = 'active' and user_consent and user_confirmed;

create index if not exists ky_insights_chart_retrieval_idx
  on public.ky_saved_insights(user_id, chart_id, created_at desc);

-- A summary is a trusted-backend artifact. Authenticated clients may continue
-- to edit normal conversation metadata but cannot forge or overwrite summaries.
create or replace function public.ky_guard_conversation_summary_write()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if (select auth.uid()) is not null and (
    new.context_summary is distinct from old.context_summary
    or new.summary_through_sequence is distinct from old.summary_through_sequence
    or new.summary_version is distinct from old.summary_version
    or new.summarized_at is distinct from old.summarized_at
  ) then
    raise exception 'conversation_summary_is_server_managed'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists ky_guard_conversation_summary_write_trigger
  on public.ky_conversations;
create trigger ky_guard_conversation_summary_write_trigger
before update on public.ky_conversations
for each row execute function public.ky_guard_conversation_summary_write();

-- Trusted summary persistence boundary. The LLM summary is generated outside SQL;
-- this RPC only persists a candidate from a trusted server credential. Coverage
-- must be monotonic and cannot claim turns that do not exist.
create or replace function public.ky_save_conversation_summary(
  p_conversation_id uuid,
  p_summary text,
  p_through_sequence integer,
  p_summary_version integer default 1
)
returns table (
  conversation_id uuid,
  summary_through_sequence integer,
  summary_version integer,
  summarized_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid;
  v_max_sequence integer;
  v_existing_sequence integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'trusted_summary_writer_required' using errcode = '42501';
  end if;
  if p_summary is null or length(trim(p_summary)) = 0 or length(p_summary) > 6000 then
    raise exception 'invalid_summary' using errcode = '22023';
  end if;
  if p_through_sequence is null or p_through_sequence < 1 then
    raise exception 'invalid_summary_coverage' using errcode = '22023';
  end if;
  if p_summary_version is null or p_summary_version < 1 then
    raise exception 'invalid_summary_version' using errcode = '22023';
  end if;

  select c.user_id, c.summary_through_sequence
    into v_user_id, v_existing_sequence
    from public.ky_conversations c
   where c.id = p_conversation_id
   for update;
  if not found then
    raise exception 'conversation_not_found' using errcode = 'P0002';
  end if;

  select coalesce(max(t.sequence_number), 0)
    into v_max_sequence
    from public.ky_conversation_turns t
   where t.conversation_id = p_conversation_id
     and t.user_id = v_user_id;

  if p_through_sequence > v_max_sequence then
    raise exception 'summary_coverage_exceeds_existing_turns' using errcode = '22023';
  end if;
  if p_through_sequence < v_existing_sequence then
    raise exception 'summary_coverage_cannot_move_backwards' using errcode = '22023';
  end if;

  update public.ky_conversations c
     set context_summary = trim(p_summary),
         summary_through_sequence = p_through_sequence,
         summary_version = p_summary_version,
         summarized_at = now(),
         updated_at = now()
   where c.id = p_conversation_id;

  return query select c.id, c.summary_through_sequence, c.summary_version, c.summarized_at
    from public.ky_conversations c where c.id = p_conversation_id;
end;
$$;

revoke all on function public.ky_save_conversation_summary(uuid, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ky_save_conversation_summary(uuid, text, integer, integer) to service_role;
