-- Same entitlement schema as the framework branch. This migration must be applied
-- through the approved Supabase migration process before Premium routes are enabled.
create table if not exists public.ky_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'trialing', 'grace', 'expired', 'canceled', 'unknown')),
  expires_at timestamptz,
  grace_until timestamptz,
  source text not null default 'manual' check (source in ('manual', 'stripe', 'app_store', 'play_store', 'promotion')),
  external_customer_id text,
  external_subscription_id text,
  policy_version integer not null default 1 check (policy_version > 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint ky_entitlements_grace_requires_deadline check (status <> 'grace' or grace_until is not null)
);
alter table public.ky_entitlements enable row level security;
drop policy if exists "Users can read their own entitlement" on public.ky_entitlements;
create policy "Users can read their own entitlement" on public.ky_entitlements
  for select to authenticated using (auth.uid() = user_id);
revoke all on public.ky_entitlements from anon, authenticated;
grant select on public.ky_entitlements to authenticated;
grant all on public.ky_entitlements to service_role;
comment on table public.ky_entitlements is
  'Server-managed entitlement source of truth. Client roles are read-only; never trust client-supplied plan claims.';
