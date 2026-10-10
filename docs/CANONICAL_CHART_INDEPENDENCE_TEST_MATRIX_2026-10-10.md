# Know Yourself — Canonical Chart Independence & API Acceptance Matrix

Date: 2026-10-10
Branch: `feature/persistent-continuity-retrieval`

## Architecture decision

The Canonical Chart must be independently usable without the 3framework. It is a standalone deterministic capability and source of truth, not a feature owned by the interpretation orchestrator.

- **Standalone use:** calculate, validate, retrieve, serialize, and inspect a chart without calling an AI model or requiring Layer 2 user context.
- **3framework use:** Layer 3 may consume the canonical chart artifact and its evidence IDs, together with consented Layer 2 context, to produce an interpretation.
- **No reverse dependency:** the chart engine must not depend on ChatGPT, an OpenAI API key, prompts, saved memories, or the 3framework orchestrator.
- **Same canonical output:** standalone callers and 3framework callers must use the same versioned calculation contract and produce the same canonical chart for the same validated birth inputs, calculation settings, and engine version.
- **Separation of concerns:** natal chart facts and temporary transit activations are represented separately. Interpretation must not rewrite chart mechanics.
- **Portable interface:** expose a stable versioned request/response contract so the canonical engine can be used by the app, a future independent API/CLI, tests, or another approved consumer without duplicating calculations.
- **Runtime remains unresolved:** Python Swiss Ephemeris implementation exists on `feature/live-api-v1`; a supported, approved runtime and safe integration path have not yet been verified. Do not deploy, select a new host, or port the old branch wholesale as part of this decision.

## Acceptance test matrix

| ID | Area | Test / assertion | Status |
|---|---|---|---|
| CC-01 | Standalone independence | Canonical chart calculation succeeds with no AI key, no user context, and no orchestrator initialized | Required; not yet verified end-to-end |
| CC-02 | Determinism | Same validated inputs + engine/settings version produce identical canonical artifact | Existing engine tests are relevant; verify full current CI |
| CC-03 | Golden chart | 15 Apr 1982, Baarn, Netherlands, 07:38 fixture matches independently reviewed golden artifact, including channels 3–60, 11–56, 28–38, 32–54, 34–57, 42–53 | Fixture target; revalidate on chosen integration path |
| CC-04 | Natal/transit separation | Natal activations remain immutable; transit activations are timestamped overlays and cannot silently redefine natal channels/centres | Existing temporal tests are relevant; verify full current CI |
| CC-05 | Evidence provenance | Every chart-derived claim can point to canonical fields / stable evidence identifiers and engine version; unsupported claims are not fabricated | Contract/test work required |
| CC-06 | 3framework optionality | Layer 1 tests pass when Layer 2 and Layer 3 are absent or disabled | Required; not yet verified end-to-end |
| CC-07 | Context consent | Only user-authorized, appropriately scoped Layer 2 context is supplied to reasoning; no context is required for chart calculation | Required |
| CC-08 | Ownership and auth | Saved charts and personal context are scoped to authenticated owner; public/guest chart calculation cannot access another user's records | Required before production |
| CC-09 | Provider absence | Missing API key returns an explicit provider-not-configured state; chart calculation still works | Old branch has a test target; verify against current integration |
| CC-10 | Provider failure | Timeout, rate limit, malformed provider response, and upstream error fail safely without altering canonical chart output | Required |
| CC-11 | Frontend compatibility | Versioned API response satisfies existing frontend needs for birthplace search/timezone, chart create/read, foundation, today/transit, Ask context, and gate/channel knowledge routes | Required; no active deployed `/v1/*` implementation verified |
| CC-12 | Contract/versioning | Input validation, timezone resolution, engine version, calculation settings, response schema, and error codes are explicit and versioned | Required |
| CC-13 | No extra framework layer | No separate critic/model is introduced as another architecture layer; ChatGPT remains the live reasoning layer above canonical evidence and adaptive context | Architecture constraint |
| CC-14 | Security | Authenticated saved-data routes verify JWT and ownership; secrets stay server-side; CORS/rate limiting are production-appropriate and not trusted solely to forwarded client IP headers | Required before production |
| CC-15 | Regression | Golden chart, boundary/timezone, natal/transit, evidence, auth, provider errors, and frontend contract tests run in CI on the intended integration branch | CI status currently inconclusive |

## Integration rule

Do not replace the existing frontend's `sendAsk()` behavior until an implemented and tested answer endpoint satisfies the frontend contract. Do not treat the existence of source code on `feature/live-api-v1` as proof that it is deployed. The old Python API branch is a reference implementation, not a production runtime decision.

## Next safe steps

1. Identify any existing approved Python runtime/service configuration from repository and connected project evidence; do not use Vercel or create a new service.
2. Verify current CI status through read-only GitHub Actions inspection.
3. Review the canonical engine API and golden fixture across branch divergence; selectively port only after contract and runtime are established.
4. Keep all changes on a development branch and unmerged. No deployment, Lovable project creation, or credit use.
