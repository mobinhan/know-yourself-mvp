-- Correct composite foreign-key deletion behavior and document backend-only RLS boundary.
alter table public.ky_conversations
  drop constraint if exists ky_conversations_user_id_chart_id_fkey;
alter table public.ky_conversations
  add constraint ky_conversations_user_id_chart_id_fkey
  foreign key (user_id, chart_id) references public.ky_charts(user_id, id)
  on delete set null (chart_id);

alter table public.ky_saved_insights
  drop constraint if exists ky_saved_insights_user_id_chart_id_fkey;
alter table public.ky_saved_insights
  add constraint ky_saved_insights_user_id_chart_id_fkey
  foreign key (user_id, chart_id) references public.ky_charts(user_id, id)
  on delete set null (chart_id);

alter table public.ky_saved_insights
  drop constraint if exists ky_saved_insights_user_id_conversation_turn_id_fkey;
alter table public.ky_saved_insights
  add constraint ky_saved_insights_user_id_conversation_turn_id_fkey
  foreign key (user_id, conversation_turn_id) references public.ky_conversation_turns(user_id, id)
  on delete set null (conversation_turn_id);

alter table public.ky_user_memories
  add constraint ky_user_memories_source_turn_fkey
  foreign key (user_id, source_turn_id) references public.ky_conversation_turns(user_id, id)
  on delete set null (source_turn_id);

drop policy if exists ky_knowledge_sources_deny_clients on public.ky_knowledge_sources;
create policy ky_knowledge_sources_deny_clients on public.ky_knowledge_sources
  for all to anon, authenticated using (false) with check (false);
drop policy if exists ky_knowledge_records_deny_clients on public.ky_knowledge_records;
create policy ky_knowledge_records_deny_clients on public.ky_knowledge_records
  for all to anon, authenticated using (false) with check (false);
drop policy if exists ky_knowledge_relationships_deny_clients on public.ky_knowledge_relationships;
create policy ky_knowledge_relationships_deny_clients on public.ky_knowledge_relationships
  for all to anon, authenticated using (false) with check (false);
drop policy if exists ky_knowledge_dependencies_deny_clients on public.ky_knowledge_record_dependencies;
create policy ky_knowledge_dependencies_deny_clients on public.ky_knowledge_record_dependencies
  for all to anon, authenticated using (false) with check (false);
drop policy if exists ky_knowledge_reviews_deny_clients on public.ky_knowledge_reviews;
create policy ky_knowledge_reviews_deny_clients on public.ky_knowledge_reviews
  for all to anon, authenticated using (false) with check (false);
drop policy if exists ky_audit_events_deny_clients on public.ky_audit_events;
create policy ky_audit_events_deny_clients on public.ky_audit_events
  for all to anon, authenticated using (false) with check (false);
