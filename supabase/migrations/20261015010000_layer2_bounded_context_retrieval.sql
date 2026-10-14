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
