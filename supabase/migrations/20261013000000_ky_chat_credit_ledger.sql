-- Candidate daily-credit ledger. Do not apply to a live database until reviewed.
-- Limits are server policy; callers cannot pass a user ID or a credit limit.
create table if not exists public.ky_chat_credit_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  usage_date date not null,
  capability text not null,
  outcome text not null default 'reserved' check (outcome in ('reserved', 'consumed', 'voided')),
  policy_version integer not null default 1 check (policy_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

create index if not exists ky_chat_credit_usage_daily_idx
  on public.ky_chat_credit_usage (user_id, usage_date)
  where outcome in ('reserved', 'consumed');

alter table public.ky_chat_credit_usage enable row level security;
revoke all on public.ky_chat_credit_usage from anon, authenticated;
grant all on public.ky_chat_credit_usage to service_role;

comment on table public.ky_chat_credit_usage is
  'Server-only idempotent chat-credit ledger. The application must atomically reserve, finalize, and void usage; client roles have no direct access.';

-- This migration intentionally does not expose a client-callable RPC. The final
-- reservation function must derive auth.uid() and entitlement on the server,
-- serialize per-user/day reservations, and atomically enforce 3 Free / 30 Premium.
-- Do not enable chat-credit billing or claim enforcement until that function and
-- the authenticated route integration have been reviewed and tested.
