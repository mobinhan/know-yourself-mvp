# Know Yourself persistence backend

## Deployment state

- Supabase project has an applied PostgreSQL schema foundation tracked in `migrations/`.
- Edge Function `user-data-api` is deployed with JWT verification enabled.
- It forwards the caller's access token through a user-scoped Supabase client; row access is constrained by RLS.
- The function does not use a service-role/secret key.
- Canonical chart artifacts, AI-generated assistant turns, saved AI insights, transit calculations, and knowledge records are not client-writable. They must be written by a trusted deterministic/critic-validated server path.

## Authenticated endpoints

Base URL: `{SUPABASE_URL}/functions/v1/user-data-api`

All calls require `Authorization: Bearer <Supabase access token>`.

- `GET /profile`; `PUT /profile` — get/update the user's display name.
- `GET /preferences`; `PUT /preferences` — get/update language, explanation depth, tone, and explicit consent flags. Partial updates preserve other stored settings.
- `GET /charts`; `GET /charts/:id` — list/view the user's saved chart metadata. The canonical artifact is not returned by this endpoint.
- `PATCH /charts/:id` — update only chart label or primary-chart flag.
- `DELETE /charts/:id` — delete the user's chart; database foreign keys preserve valid conversation/insight references where appropriate and cascade dependent transit snapshots.
- `GET /conversations`; `POST /conversations` — list/create conversations. An optional `chart_id` must refer to the caller's own chart.
- `GET /conversations/:id`; `PATCH /conversations/:id`; `DELETE /conversations/:id` — read/update/archive/delete an owned conversation.
- `GET /conversations/:id/turns`; `POST /conversations/:id/turns` — read turns and append a user question. Sequence allocation is serialized by the `ky_append_user_turn` database function.
- `GET /saved-insights`; `DELETE /saved-insights/:id` — read/delete saved AI insights. Client-side creation is intentionally disabled until a critic-validated server answer path exists.
- `GET /transit-snapshots`; `DELETE /transit-snapshots/:id` — read/delete saved transit snapshots. Client-side creation is disabled until the trusted deterministic engine endpoint is integrated.
- `GET /memories`; `POST /memories`; `PATCH /memories/:id`; `DELETE /memories/:id`; `DELETE /memories` — inspect, create, update/confirm, delete one, or reset all user memories. Creation requires per-record consent and a source turn; inferred memories require confidence >= 0.8.

## Security and truth boundaries

- User-owned tables have RLS policies bound to `auth.uid()`.
- Raw knowledge/source/review/audit tables are inaccessible to `anon` and `authenticated`; they are reserved for trusted backend workflows.
- Client inserts are blocked for canonical chart artifacts, saved AI insights and transit snapshots.
- Clients can append only user-role turns with no assistant answer or evidence basis. Assistant turns must be produced by a trusted server-side reasoning/critic flow.
- Memory categories are allowlisted; chart truth, source knowledge and system instructions cannot be represented as user memory.
- Deleting a source conversation turn cascades to memories derived from it, preserving provenance integrity.
- Guest chart calculation is not yet persisted by this authenticated API. A trusted deterministic-engine endpoint must be integrated before chart creation can be enabled here.
- A live LLM provider and critic-backed assistant-answer endpoint are not yet deployed. This API persists user context and user questions, not AI-generated interpretations.

## Verification

- `supabase/test_user_data_api.mjs` checks source-level security contracts.
- CI runs that contract test and Deno type-checks the Edge Function.
- Supabase migrations and deployed function version must be inspected separately; CI does not claim authenticated end-to-end requests have been exercised without a real test account/token.

## Live reasoning integration status

- `functions/_shared/openai-reasoning-provider.ts` is a server-side provider adapter prototype. Its contract test uses a mocked fetch and does not call the OpenAI API or incur model usage.
- The adapter is not yet exposed as an endpoint and is not connected to the frontend. It must only be called by a trusted server path after chart ownership, canonical evidence provenance, and user-context consent have been resolved server-side.
- No `OPENAI_API_KEY` is stored in the repository. A live deployment requires configuring the key as a server-side secret, selecting/confirming the model, implementing trusted input assembly, and performing authenticated end-to-end verification. Do not claim live reasoning until those gates pass.
