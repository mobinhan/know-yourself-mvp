# Step 1 API Reconciliation Review — 2026-10-10

## Executive conclusion

The older `feature/live-api-v1` branch contains useful deterministic API and interpretation work, but it is **not a safe drop-in integration** for the current `feature/persistent-continuity-retrieval` branch. The two branches are materially divergent, and the older API has different runtime and data-flow assumptions. Keep the current branch as the integration base; port only individually reviewed, tested components if needed.

No branch was merged, no deployment was made, and no Lovable credits were used.

## What the older API branch provides

Source reviewed:
- `api/index.py` — Python HTTP handler with `/v1/*` routes for birthplace/timezone lookup, chart creation, transit calculations, contextual questions, and gate/channel/centre catalogues.
- `api/interpretation_provider.py` — server-side OpenAI Responses API adapter, evidence selection, source-linked records and a truthful `provider_not_configured` status.
- `engine/ephemeris.py` and `engine/temporal_ephemeris.py` — Swiss Ephemeris-based deterministic natal and temporal calculations.
- `engine/test_v1_api.py` — golden chart, transit separation, provider-unconfigured, mocked provider/evidence filtering and rate-limit tests.

This is real source implementation and useful reference material. It is not proof of a deployed or reachable API.

## Compatibility assessment

| Area | Older `feature/live-api-v1` | Current `feature/persistent-continuity-retrieval` | Assessment |
|---|---|---|---|
| Deterministic chart engine | Python + Swiss Ephemeris; calculates foundation per request from birth input | Canonical/evidence contracts and engine work, plus Supabase persistence foundations | Reuse only after golden-chart parity tests and explicit engine ownership decision |
| API route family | Implements frontend's `/v1/*` endpoints in a Python `BaseHTTPRequestHandler` | No matching `/v1/*` service found in this branch; Supabase `user-data-api` is a separate authenticated route family | Route/runtime gap remains; hosting target for Python handler is not established |
| AI provider | Python OpenAI Responses API; defaults to `gpt-5-mini`; server environment variable | Deno/Supabase shared OpenAI Chat Completions adapter; defaults to `gpt-4.1-mini` | Two competing adapters. Do not keep both active paths by accident; compare and select one implementation after tests |
| User context | Guest-first/stateless charts; provider input contains question, chart and selected knowledge. No verified integration to current consent-governed persistent memories | Authenticated user-data API and continuity/context modules; explicit consent and RLS boundaries | Older API does not satisfy Layer 2 persistence/consent integration by itself |
| Canonical chart ownership | Recalculates from request-supplied birth fields; guest artifacts are browser-local/stateless | Data model distinguishes trusted chart artifacts from client-writable user context | Need server-side ownership/evidence resolution; do not trust client-submitted chart facts as canonical |
| 3framework | Prompt labels Layer 1/2/3 and uses source evidence; API also has a separate `interpretation_critic.py` file | Explicit three-layer boundary and 3FO packet builder; no extra active critic layer permitted | Do not port or activate a separate critic/reasoning layer in the approved 3framework path |
| Security / rate limits | Public handler sets permissive CORS; lightweight per-warm-instance rate limit reads forwarded IP headers; no verified user-authenticated chart ownership in the route handler | Supabase user-data API requires a valid bearer token and user-scoped queries/RLS | Old API requires security redesign before production use |
| Runtime | Python HTTP handler; `requirements.txt` contains `pyswisseph` and `timezonefinder` | Supabase Edge Functions are Deno; Python API hosting is not configured/verified here | Runtime choice is the main technical integration constraint |
| Deployment and secrets | `api/.env.example` documents `OPENAI_API_KEY`; no real key in repo | Supabase shared provider code expects a server-side key when invoked | No provider secret or live endpoint configuration was verified; do not claim live AI |

## Architectural implications

1. **Do not merge the old branch.** GitHub compare reports `feature/live-api-v1` is 161 commits ahead and 42 behind `feature/persistent-continuity-retrieval`. Its diff includes many engine, knowledge, frontend, and workflow changes, not just an isolated API.
2. **Do not copy the entire old API into Supabase.** Its Python Swiss Ephemeris dependencies cannot simply be assumed to run inside a Deno Edge Function.
3. **Preserve Swiss Ephemeris.** It is explicitly retained in the project decisions. Any runtime migration must demonstrate chart parity against golden fixtures, including the confirmed six-channel chart fixture, before replacing or wrapping the calculation engine.
4. **Use the current Supabase continuity/security foundation.** The live answer path must resolve trusted canonical chart evidence on the server, load Layer 2 context only according to the user's stored consent and access permissions, and call the model provider server-side. The browser must not be allowed to submit authoritative chart facts or arbitrary context and have them trusted.
5. **Keep ChatGPT/model synthesis in Layer 3.** The 3FO may assemble and validate inputs, but is not a fourth layer. Do not introduce a separate active critic as another reasoning layer.
6. **Keep Live/Demo/Disconnected status truthful.** A mock provider test or source file is not a live endpoint; live status requires configured runtime, reachable endpoint, and end-to-end tests.

## Safe implementation path

### Completed in this audit
- Located the older API implementation and supporting provider/engine tests.
- Compared its architecture and runtime assumptions with the current branch's provider, Supabase user-data API, and 3FO prototype.
- Recorded the incompatibilities and no-merge recommendation.

### Next engineering sequence
1. **Establish runtime feasibility without committing to a platform prematurely.** Inventory the current Supabase project/function configuration and determine whether the existing deterministic Python engine is available through an already-approved trusted runtime. Do not create a new service or choose a new hosting provider without need.
2. **Run/verify current branch CI.** Verify the latest relevant workflow after provider test additions; don't rely on an older green run.
3. **Create an API integration contract test matrix** covering golden chart parity, transit/natal separation, consented context, canonical evidence IDs, missing-key behavior, provider errors, auth/ownership, and mobile frontend response compatibility.
4. **Choose the smallest viable bridge** only after runtime feasibility is known: either invoke an already-approved Python runtime securely or build a narrowly scoped trusted calculation boundary compatible with the chosen backend. Preserve Swiss Ephemeris and avoid duplicate engines.
5. Implement the authenticated answer endpoint and connect the current frontend only after the endpoint and contract tests pass.
6. Verify end-to-end on a safe preview/test environment before discussing merge/deployment.

## Current status

- API source exists on a divergent branch: **verified**.
- Current active branch has a matching deployed `/v1/*` service: **not verified**.
- Old API branch is safe to merge wholesale: **no; not recommended**.
- Production OpenAI key/configuration: **not verified**.
- Live 3framework answer path end-to-end: **not verified**.
- Merge/deployment/Lovable project/credit spend: **none performed**.
