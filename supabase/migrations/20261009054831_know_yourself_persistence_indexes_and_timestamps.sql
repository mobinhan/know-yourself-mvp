-- Add indexes for foreign keys and keep updated_at consistent across mutable records.
create index if not exists ky_turns_user_conversation_idx on public.ky_conversation_turns(user_id, conversation_id);
create index if not exists ky_conversations_user_chart_idx on public.ky_conversations(user_id, chart_id);
create index if not exists ky_knowledge_dependencies_target_idx on public.ky_knowledge_record_dependencies(depends_on_record_id);
create index if not exists ky_knowledge_records_source_idx on public.ky_knowledge_records(source_id);
create index if not exists ky_knowledge_relationships_from_idx on public.ky_knowledge_relationships(from_record_id);
create index if not exists ky_knowledge_relationships_to_idx on public.ky_knowledge_relationships(to_record_id);
create index if not exists ky_knowledge_reviews_record_idx on public.ky_knowledge_reviews(record_id);
create index if not exists ky_knowledge_reviews_source_idx on public.ky_knowledge_reviews(source_id);
create index if not exists ky_saved_insights_user_chart_idx on public.ky_saved_insights(user_id, chart_id);
create index if not exists ky_saved_insights_user_turn_idx on public.ky_saved_insights(user_id, conversation_turn_id);
create index if not exists ky_snapshots_user_chart_idx on public.ky_transit_snapshots(user_id, chart_id);
create index if not exists ky_memories_user_source_turn_idx on public.ky_user_memories(user_id, source_turn_id);

create or replace function public.ky_set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ky_profiles_set_updated_at on public.ky_profiles;
create trigger ky_profiles_set_updated_at before update on public.ky_profiles
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_preferences_set_updated_at on public.ky_user_preferences;
create trigger ky_preferences_set_updated_at before update on public.ky_user_preferences
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_charts_set_updated_at on public.ky_charts;
create trigger ky_charts_set_updated_at before update on public.ky_charts
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_conversations_set_updated_at on public.ky_conversations;
create trigger ky_conversations_set_updated_at before update on public.ky_conversations
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_memories_set_updated_at on public.ky_user_memories;
create trigger ky_memories_set_updated_at before update on public.ky_user_memories
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_knowledge_sources_set_updated_at on public.ky_knowledge_sources;
create trigger ky_knowledge_sources_set_updated_at before update on public.ky_knowledge_sources
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_knowledge_records_set_updated_at on public.ky_knowledge_records;
create trigger ky_knowledge_records_set_updated_at before update on public.ky_knowledge_records
for each row execute function public.ky_set_updated_at();
drop trigger if exists ky_knowledge_relationships_set_updated_at on public.ky_knowledge_relationships;
create trigger ky_knowledge_relationships_set_updated_at before update on public.ky_knowledge_relationships
for each row execute function public.ky_set_updated_at();
