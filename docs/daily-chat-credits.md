# Daily Chat Credits — Product and Enforcement Contract

**Status:** candidate design on a draft branch; not live, not deployed, and not connected to billing.

## Product decision to test

- Free: unlimited deterministic natal chart facts and basic chart navigation; 3 Basic Guide AI credits per UTC day.
- Premium: advanced website capabilities plus 30 AI chat credits per UTC day.
- Premium website entitlement and chat-credit balance are separate controls. A Premium user who has exhausted chat credits retains Premium website access; advanced AI responses wait until reset or a separately approved credit purchase.
- These values are initial experiment defaults, not final commercial pricing.
- Basic chart facts never consume AI credits.
- A credit is consumed only for an accepted AI generation attempt after authentication, capability authorization, input validation and rate checks. Provider failures should be refunded/compensated by an idempotent server-side ledger operation; never rely on the client to restore credits.
- Daily reset is 00:00 UTC for v1 and must be displayed clearly in the UI.

## Capability boundary

Do not turn the existing Premium open-question route into a free route. Provide a distinct server-owned Basic Guide operation with a constrained, approved Basic knowledge tier and prompt contract. The route itself chooses `guide.basic_question`; client-supplied `plan`, `tier`, or `capability` values are ignored.

Initial explicit allowlist:
- `chart.basic_facts`: Free, unlimited, deterministic.
- `guide.basic_overview`: Free, no credit if deterministic; AI-generated Basic answer consumes 1 Free chat credit.
- `guide.basic_question`: Free only through a dedicated Basic endpoint, restricted to approved foundational L1 knowledge and the Basic answer contract; consumes 1 Free chat credit.
- `transits.basic_overlay`: Free, deterministic mechanics only; no credit.
- `guide.open_question`, advanced sources, detailed PHS, detailed life cycles, advanced transit synthesis, pattern recognition and chart comparison: Premium capability. Advanced AI generation consumes 1 Premium chat credit.

An unknown or unclassified operation fails closed to Premium. The server must not use a client-provided label to downgrade a Premium request. Follow-up questions that request deeper/personalized synthesis must route to Premium even if the conversation began with a Basic answer.

## Credit accounting requirements

1. The server derives the authenticated user from a verified Supabase JWT; never accept a user ID or credit limit from the client.
2. The server resolves the current entitlement and selects the daily limit (Free 3, active Premium 30) from server policy.
3. The ledger records a unique request/idempotency key and UTC usage date. Concurrent requests must not overspend the daily allowance; the check-and-consume operation must be atomic in PostgreSQL.
4. A repeated idempotency key must not charge twice or invoke the model twice. Return/replay the already stored result when available; do not regenerate on retry.
5. Check the credit balance before any restricted evidence retrieval or model invocation. Premium authorization is still required independently of credits.
6. If the AI provider fails after a reservation, perform a server-side idempotent refund/void. Client disconnects must not create a free generation loophole.
7. Return remaining credits and reset timestamp from the server. UI values are display-only and never authoritative.
8. Add per-user abuse controls in addition to daily credits; a daily allowance is not a replacement for rate limiting.
9. Log policy version, capability, request ID, usage date, outcome and model cost metadata without logging sensitive prompt content unnecessarily.
10. Billing/webhook events update `ky_entitlements`; credit code must not trust local storage or client subscription flags.

## Required acceptance tests

- Free gets 3 Basic AI credits/day; fourth request is blocked before model invocation.
- Premium gets 30 AI credits/day; 31st request is blocked before model invocation.
- Deterministic chart facts and basic transit mechanics remain usable without credits.
- Free cannot use Basic credits for detailed Chiron/Saturn Return interpretation, PHS interpretation, advanced transit synthesis or other Premium capabilities.
- Client spoofing of `plan=premium`, `tier=basic`, or capability labels cannot change server classification.
- Concurrent requests at the last available credit result in at most one successful consumption.
- Duplicate idempotency keys do not charge twice or generate twice.
- Provider failure refunds/voids a reservation exactly once.
- Entitlement lookup failure fails closed for Premium; it must not silently grant Premium credits.
- Expired/canceled Premium reverts to Free limits and capabilities according to the entitlement policy.
- Credit count and reset time are server-generated.
- Authenticated end-to-end tests exercise the selected live API route before release.

## Release gates

This design is not production-ready until the dedicated Basic endpoint, server-owned capability classification, atomic ledger, refund/idempotency path, authenticated E2E tests, entitlement provisioning, and UI states are implemented and verified. No migration application, merge, deployment, billing integration or paid-credit purchase is authorized by this document.


## Candidate API implementation checkpoint (2026-10-12)

- Added `POST /v1/charts/{id}/questions/basic` as a separate Basic Guide route.
- Server-side classifier only accepts narrow chart lookups/definitions; life-cycle, detailed/personal synthesis, PHS, comparison and other flagged advanced asks route to Premium.
- Route reserves a credit through the server-only Supabase RPC before AI generation, calls the provider with `knowledge_tier="basic"`, then finalizes the reservation; provider/rate failures attempt to void it.
- The existing `POST /v1/charts/{id}/questions/context` remains Premium by default and ignores client-supplied tier/capability claims.
- Added regression tests for a basic lookup, advanced Chiron Return rejection, client-supplied Premium claim rejection, and reservation/finalization ordering.
- GitHub Actions route-guard test run 38235763513 passed on code commit `0e08c368799cb38732c3b6388088edc5e6b56e0a`.

### Known limitations — not a release

- Candidate SQL functions have not been run against PostgreSQL/Supabase; SQL behaviour, grants, advisory-lock concurrency and migration ordering remain unverified.
- The credit endpoint requires an authenticated Supabase user; guest users can still use deterministic chart mechanics but do not receive account-based AI credits.
- This route does not yet persist/replay completed AI responses for an idempotency-key retry; duplicate requests fail closed rather than generating or charging again.
- If finalization fails after a provider response, the endpoint withholds the answer, but recovery of a stuck reservation needs database-level integration tests and an operational reconciliation path.
- The classifier is intentionally conservative and rule-based. It is not a general semantic classifier; unrecognized questions should use the Premium open-question route.
- No live authenticated E2E, actual user-facing credit counter/reset UI, billing provisioning, migration, merge or deployment has been completed.


## Existing connected backend inspection (read-only, 2026-10-12)

The currently connected Supabase project was inspected without writing to it:

- Project `djtpqqjenmcsrdcguttk` is active/healthy.
- Its applied migration list contains five existing Know Yourself persistence migrations (2026-10-09). It does not list the candidate `ky_entitlements` or chat-credit migrations.
- The current public schema includes the existing KY persistence tables (profiles, preferences, charts, conversations/turns, memories, insights, transit snapshots, and knowledge records). No `ky_entitlements` or `ky_chat_credit_usage` table is present in the live schema.
- The deployed `user-data-api` Edge Function is active at version 5 and handles authenticated user data/persistence. Its inspected source has no AI question-generation route, entitlement enforcement, or credit accounting.
- Therefore the candidate Python `/v1/charts/{id}/questions/basic` route is not currently connected to the existing deployed Supabase Edge Function or confirmed live AI route. The candidate work cannot affect the running app yet.

This inspection was read-only. No migration, function deployment, billing change, or live data write was performed.

## Immediate integration decision

Before wiring the UI, identify and validate the actual AI-generation endpoint used by the running Lovable interface. The persistence Edge Function is not itself the AI backend. Do not add a second competing chat backend or connect the UI to the candidate Python route until its deployment target and environment are established. Preserve the existing user-data API and guest chart flow.
