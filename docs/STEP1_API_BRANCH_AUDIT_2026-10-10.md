# Step 1 API Branch Audit — 2026-10-10

## Result: API implementation exists, but on a separate divergent branch

The previous conclusion that no `/v1/*` API implementation exists anywhere in the repository was too broad. A read-only audit found a substantial implementation on `feature/live-api-v1`.

### Verified repository facts

- Repository: `mobinhan/know-yourself-mvp`
- Branches present during this audit: `main`, `fix/my-chart-inline-handler`, `feature/correction-safeguards`, `feature/live-api-v1`, `feature/persistent-continuity-retrieval`, and `temp-unused-branch`.
- `feature/live-api-v1` contains `api/index.py` (blob `f46ac8ccad53b89e5cb1cf9bf119186dee4a2564`) with a Python request handler implementing the frontend's `/v1/*` route family, including:
  - birthplace search and timezone lookup;
  - deterministic chart creation;
  - stateless guest-chart handling;
  - transit/today calculation and interpretation;
  - contextual question answering;
  - gate/channel/centre catalogue routes.
- The same branch contains `api/interpretation_provider.py` (blob `2aded5a77f570899de2d574a65dad71331a44198`), a server-side OpenAI Responses API adapter. It defaults to `gpt-5-mini`, disables response storage, avoids sending direct birth-data fields, filters returned evidence IDs, and fails closed when `OPENAI_API_KEY` is absent.
- `api/.env.example` documents the server-side key/model environment variables; no real key is stored there.
- `engine/test_v1_api.py` includes deterministic golden-chart tests, transit/natal separation, missing-provider fail-closed behavior, mocked provider request/evidence-filter tests, and a simple in-process AI request-limit test.
- The route handler is written as a Python `BaseHTTPRequestHandler` with `handler` entry point. This establishes source implementation, **not** a verified deployed runtime or an active live endpoint.
- The branch README says the V22 frontend expects these API routes. The branch's prior Vercel config has been removed; do not use Vercel.

### Important branch divergence

Comparing `main` with `feature/live-api-v1` reports the branches have diverged: `feature/live-api-v1` is 161 commits ahead and 2 behind the comparison base. The comparison includes `api/index.py`, `api/interpretation_provider.py`, API tests, and other work that is not proven present on the current `feature/persistent-continuity-retrieval` branch. The current active feature branch does not contain `api/index.py` at the tested path (GitHub returned 404).

Therefore:
- Do not continue saying the API source is absent from the entire repository.
- Do not assume the old API branch is safe to merge or deploy. It is divergent and must be reviewed against current deterministic engine, Supabase security/persistence, continuity, and the confirmed 3framework.
- Do not wire the active frontend to it or copy it wholesale before reviewing its differences and hosting assumptions.
- No API endpoint availability, production OpenAI configuration, or live reasoning response has been verified by this audit.

### Architecture alignment / safety observations

- The API branch's interpretation provider is an actual server-side model adapter in source, unlike the mock-only provider currently present in the active branch. However, the API's request handler recalculates chart foundation from browser-supplied birth data for each request and does not establish authenticated ownership or load consented persistent Layer 2 context. Its comments describe guest charts as stateless/local-storage-based.
- The API branch's AI rate limiter is in-memory and keyed by forwarded IP headers; it is not a substitute for platform-level limits or authenticated per-user controls.
- The active branch's Supabase `user-data-api` is a separate authenticated persistence API and does not implement the frontend's `/v1/*` route family.
- These are integration boundaries to resolve; they do not justify adding a fourth/fifth framework layer. Preserve the three layers and 3FO as cross-cutting coordination only.

### Next safe action

Perform a focused, read-only comparison of `feature/live-api-v1` API files and tests against the current active branch's deterministic engine, OpenAI provider prototype, Supabase user-data API, and continuity/evidence contracts. Establish which pieces can be reconciled safely into the active branch without deployment-platform assumptions. Verify the relevant workflow tests on the current branch before making integration changes. Do not merge, deploy, create a Lovable project, spend credits, or use Vercel.
