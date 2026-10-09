-- Know Yourself production persistence foundation v1.
-- User-owned data is isolated by auth.uid(); canonical mechanics and licensed knowledge are server-managed.
create extension if not exists pgcrypto;

create table if not exists public.ky_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ky_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  personalization_enabled boolean not null default false,
  personal_context_enabled boolean not null default false,
  language text not null default 'en' check (language in ('en','vi','nl','ms')),
  knowledge_level text not null default 'intermediate' check (knowledge_level in ('introductory','intermediate','advanced')),
  tone text not null default 'conversational' check (tone in ('concise','conversational','reflective','technical','supportive')),
  language_confirmed boolean not null default false,
  knowledge_level_confirmed boolean not null default false,
  tone_confirmed boolean not null default false,
  preferences_version integer not null default 1 check (preferences_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ky_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'My Chart' check (length(label) between 1 and 120),
  birth_date date,
  birth_time time,
  birth_timezone text,
  birth_location_label text,
  engine_name text not null,
  engine_version text not null,
  canonical_chart jsonb not null,
  chart_fingerprint text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  unique (user_id, chart_fingerprint)
);
create unique index if not exists ky_charts_one_primary_per_user
  on public.ky_charts(user_id) where is_primary;

create table if not exists public.ky_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chart_id uuid,
  title text,
  status text not null default 'active' check (status in ('active','archived','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, chart_id) references public.ky_charts(user_id, id) on delete set null
);

create table if not exists public.ky_conversation_turns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null,
  sequence_number integer not null check (sequence_number > 0),
  role text not null check (role in ('user','assistant','system')),
  question text,
  answer text,
  factual_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(factual_basis) = 'array'),
  knowledge_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(knowledge_basis) = 'array'),
  relationship_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(relationship_basis) = 'array'),
  critic_result jsonb,
  reasoning_model text,
  prompt_version text,
  created_at timestamptz not null default now(),
  unique (conversation_id, sequence_number),
  unique (user_id, id),
  foreign key (user_id, conversation_id) references public.ky_conversations(user_id, id) on delete cascade
);

create table if not exists public.ky_user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('preference','goal','personal_context','communication_style')),
  value text not null check (length(trim(value)) between 1 and 2000),
  origin text not null check (origin in ('explicit','inferred')),
  status text not null default 'proposed' check (status in ('proposed','active','superseded','deleted')),
  confidence numeric(4,3) not null default 1.000 check (confidence between 0 and 1),
  user_consent boolean not null default false,
  user_confirmed boolean not null default false,
  source_turn_id uuid,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, id),
  check (origin <> 'inferred' or confidence >= 0.800),
  check (status <> 'active' or (user_consent and user_confirmed)),
  check (origin <> 'explicit' or status not in ('active','proposed') or user_confirmed),
  check (origin <> 'inferred' or status <> 'active' or user_confirmed)
);

create table if not exists public.ky_saved_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chart_id uuid,
  conversation_turn_id uuid,
  title text not null check (length(trim(title)) between 1 and 200),
  content text not null,
  factual_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(factual_basis) = 'array'),
  knowledge_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(knowledge_basis) = 'array'),
  relationship_basis jsonb not null default '[]'::jsonb check (jsonb_typeof(relationship_basis) = 'array'),
  created_at timestamptz not null default now(),
  foreign key (user_id, chart_id) references public.ky_charts(user_id, id) on delete set null,
  foreign key (user_id, conversation_turn_id) references public.ky_conversation_turns(user_id, id) on delete set null
);

create table if not exists public.ky_transit_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chart_id uuid not null,
  snapshot_at timestamptz not null,
  engine_version text not null,
  transit_artifact jsonb not null,
  created_at timestamptz not null default now(),
  foreign key (user_id, chart_id) references public.ky_charts(user_id, id) on delete cascade
);

-- Server-managed, provenance-aware knowledge registry. Never client-writable.
create table if not exists public.ky_knowledge_sources (
  id text primary key,
  title text not null,
  source_url text,
  source_tier text not null check (source_tier in ('P1','P2','P3','external','community','user_supplied')),
  rights_status text not null check (rights_status in ('allowed','paraphrase_only','licensed','restricted','unknown')),
  review_cadence text not null default 'quarterly',
  last_reviewed_at timestamptz,
  next_review_due_at timestamptz,
  status text not null default 'active' check (status in ('active','review_due','restricted','retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ky_knowledge_records (
  id text primary key,
  source_id text not null references public.ky_knowledge_sources(id) on delete restrict,
  record_type text not null,
  concept_keys text[] not null default '{}',
  claim text not null,
  concise_paraphrase text,
  provenance jsonb not null default '{}'::jsonb,
  validation_status text not null default 'legacy_review_required'
    check (validation_status in ('legacy_review_required','pending','validated','conflicted','rejected','superseded')),
  lifecycle_status text not null default 'active'
    check (lifecycle_status in ('active','staged','superseded','retired')),
  licensing_notes text,
  conflict_group text,
  version integer not null default 1 check (version > 0),
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ky_knowledge_relationships (
  id text primary key,
  from_record_id text not null references public.ky_knowledge_records(id) on delete restrict,
  to_record_id text not null references public.ky_knowledge_records(id) on delete restrict,
  relationship_type text not null,
  validation_status text not null default 'pending'
    check (validation_status in ('pending','validated','conflicted','rejected','retired')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_record_id <> to_record_id)
);

create table if not exists public.ky_knowledge_record_dependencies (
  record_id text not null references public.ky_knowledge_records(id) on delete cascade,
  depends_on_record_id text not null references public.ky_knowledge_records(id) on delete restrict,
  dependency_type text not null default 'supports',
  created_at timestamptz not null default now(),
  primary key (record_id, depends_on_record_id),
  check (record_id <> depends_on_record_id)
);

create table if not exists public.ky_knowledge_reviews (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.ky_knowledge_sources(id) on delete restrict,
  record_id text references public.ky_knowledge_records(id) on delete restrict,
  review_type text not null check (review_type in ('quarterly_source_check','record_validation','conflict_review','rights_review','dependency_impact')),
  status text not null default 'queued' check (status in ('queued','in_progress','approved','rejected','blocked')),
  findings jsonb not null default '{}'::jsonb,
  reviewer text,
  reviewed_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  check (source_id is not null or record_id is not null)
);

create table if not exists public.ky_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ky_conversations_user_updated_idx on public.ky_conversations(user_id, updated_at desc);
create index if not exists ky_turns_conversation_sequence_idx on public.ky_conversation_turns(conversation_id, sequence_number desc);
create index if not exists ky_memories_user_status_idx on public.ky_user_memories(user_id, status, category);
create index if not exists ky_insights_user_created_idx on public.ky_saved_insights(user_id, created_at desc);
create index if not exists ky_snapshots_user_time_idx on public.ky_transit_snapshots(user_id, snapshot_at desc);
create index if not exists ky_knowledge_records_status_idx on public.ky_knowledge_records(validation_status, lifecycle_status);
create index if not exists ky_knowledge_records_concepts_idx on public.ky_knowledge_records using gin(concept_keys);
create index if not exists ky_knowledge_reviews_queue_idx on public.ky_knowledge_reviews(status, due_at);

alter table public.ky_profiles enable row level security;
alter table public.ky_user_preferences enable row level security;
alter table public.ky_charts enable row level security;
alter table public.ky_conversations enable row level security;
alter table public.ky_conversation_turns enable row level security;
alter table public.ky_user_memories enable row level security;
alter table public.ky_saved_insights enable row level security;
alter table public.ky_transit_snapshots enable row level security;
alter table public.ky_knowledge_sources enable row level security;
alter table public.ky_knowledge_records enable row level security;
alter table public.ky_knowledge_relationships enable row level security;
alter table public.ky_knowledge_record_dependencies enable row level security;
alter table public.ky_knowledge_reviews enable row level security;
alter table public.ky_audit_events enable row level security;

drop policy if exists ky_profiles_owner_all on public.ky_profiles;
create policy ky_profiles_owner_all on public.ky_profiles for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_preferences_owner_all on public.ky_user_preferences;
create policy ky_preferences_owner_all on public.ky_user_preferences for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_charts_owner_all on public.ky_charts;
create policy ky_charts_owner_all on public.ky_charts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_conversations_owner_all on public.ky_conversations;
create policy ky_conversations_owner_all on public.ky_conversations for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_turns_owner_all on public.ky_conversation_turns;
create policy ky_turns_owner_all on public.ky_conversation_turns for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_memories_owner_all on public.ky_user_memories;
create policy ky_memories_owner_all on public.ky_user_memories for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_insights_owner_all on public.ky_saved_insights;
create policy ky_insights_owner_all on public.ky_saved_insights for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists ky_snapshots_owner_all on public.ky_transit_snapshots;
create policy ky_snapshots_owner_all on public.ky_transit_snapshots for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.ky_knowledge_sources, public.ky_knowledge_records,
  public.ky_knowledge_relationships, public.ky_knowledge_record_dependencies,
  public.ky_knowledge_reviews, public.ky_audit_events from anon, authenticated;
grant all on public.ky_knowledge_sources, public.ky_knowledge_records,
  public.ky_knowledge_relationships, public.ky_knowledge_record_dependencies,
  public.ky_knowledge_reviews, public.ky_audit_events to service_role;

grant select, insert, update, delete on public.ky_profiles, public.ky_user_preferences,
  public.ky_charts, public.ky_conversations, public.ky_conversation_turns,
  public.ky_user_memories, public.ky_saved_insights, public.ky_transit_snapshots to authenticated;
revoke all on public.ky_profiles, public.ky_user_preferences, public.ky_charts,
  public.ky_conversations, public.ky_conversation_turns, public.ky_user_memories,
  public.ky_saved_insights, public.ky_transit_snapshots from anon;
grant usage, select on sequence public.ky_audit_events_id_seq to service_role;
