# Know Yourself Step 1 — Canonical Engine Parity Check

Date: 2026-10-10
Working branch: `feature/persistent-continuity-retrieval`

## Verified findings

1. The deterministic engine file `engine/ephemeris.py` has the same Git blob SHA (`a37c387c66ca4aff7fca5e173c38931b63fc8404`) on both `feature/live-api-v1` and `feature/persistent-continuity-retrieval`. The canonical calculation implementation is already present in the current working branch; it does not need to be copied from the divergent legacy API branch.
2. The legacy branch's `engine/test_v1_api.py` contains a golden API fixture for 15 April 1982, 07:38, Europe/Amsterdam. It asserts Generator, Sacral authority, profile 5/1, and the six expected channels: 3–60, 11–56, 28–38, 32–54, 34–57, 42–53. This is useful as an acceptance target, but the test has not been run in this audit.
3. The current branch has `engine/golden-chart.json` and `engine/test_golden.py`, so the existing deterministic golden-chart suite should be the first verification path before porting API code.
4. The current branch's GitHub Actions workflow `.github/workflows/step1-engine.yml` runs Python ephemeris tests and JavaScript contract/security tests on pushes to `engine/**`, `supabase/**`, and the workflow itself. However, the available GitHub workflow-runs connector returned an empty list for the current checkpoint commit and is documented to filter to PR-triggered runs. This is inconclusive, not a passing result.
5. The deployed Supabase `user-data-api` is the authenticated persistence boundary. It is not the chart engine or the frontend's `/v1/*` calculation/answer API.
6. The Python API on `feature/live-api-v1` remains unverified as deployed and has not been approved for a particular runtime. No runtime selection or deployment is made here.

## Step 1 correction

Do not port or duplicate `engine/ephemeris.py`. Keep it as the single canonical calculation source. The next integration work should expose that engine through a versioned, independently callable interface only after a supported runtime and contract are established.

The API boundary must:
- accept validated calculation inputs and explicit timezone/calculation settings;
- return a versioned canonical artifact with engine provenance;
- work without an AI key, saved user context, or the 3framework;
- keep natal chart facts separate from time-specific transit overlays;
- let the 3framework consume the same canonical artifact without recalculating or modifying chart truth;
- protect authenticated saved-chart and Layer 2 data by owner and consent;
- provide truthful errors when an optional interpretation provider is unavailable.

## Acceptance tests before marking Step 1 complete

- Run current-branch Python golden chart, channel catalog, timezone/boundary, and temporal/transit suites.
- Reconcile the API golden test with the current golden artifact; any disagreement in type, authority, profile, gates/channels, incarnation cross, or node-line conventions must be resolved explicitly rather than silently accepted.
- Add an API contract test proving canonical calculation succeeds with the AI provider absent.
- Verify natal chart output is unchanged by enabling/disabling Layer 2 and Layer 3.
- Verify frontend response shapes for all expected `/v1/*` routes.
- Review authentication, chart ownership, request validation, CORS, rate limiting, and secret handling before exposing the endpoint.

## Decision boundary

The architecture is settled: standalone Canonical Chart plus the 3framework as an optional consumer. The remaining blocker is implementation/runtime integration, not an architectural decision. No merge, deployment, new service, Lovable project, or credit spend occurred.
