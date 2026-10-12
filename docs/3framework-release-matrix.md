# 3framework Release / Regression Matrix

**Status:** audit baseline; release is **NOT READY**. This matrix distinguishes source inspection, isolated automated tests, candidate-route tests, and live end-to-end evidence. A test is not PASS merely because code or an acceptance criterion exists.

**Repository:** `mobinhan/know-yourself-mvp`  
**Audit branch:** `audit/3framework-release-matrix`  
**Architecture:** exactly three layers — (1) Canonical Chart + Immutable Evidence, (2) Adaptive User Context, (3) ChatGPT live reasoning. The 3Framework Orchestrator is cross-cutting, not a fourth layer.

## Status definitions

- **PASS** — executed against the stated commit/version, expected and observed results recorded, with evidence.
- **FAIL** — an executed check failed or source inspection confirms a required behavior is absent.
- **BLOCKED** — cannot be validated until a dependency, integration, source, or environment is available.
- **NOT RUN** — no execution evidence found in this audit.
- Unit/contract tests do not prove a live deployed system works.

## Highest-priority release blockers

| Priority | Area | Current status | Evidence / reason | Required closure |
|---|---|---|---|---|
| P0 | Premium entitlement on actual production route | **BLOCKED** | Draft PR #7 adds policy helpers but its own description says no protected route wiring, live migration, or provisioning. Draft PR #8 contains candidate API route guards on `feature/live-api-v1`, not `main`. | Select actual app/API route; wire trusted auth + server entitlement before restricted retrieval/model call; apply migration through approved process; provision entitlements; authenticated E2E denial/allow tests. |
| P0 | CI health of latest Premium API candidate | **HISTORICAL FAIL; CURRENT HEAD CHECK REQUIRED** | Workflow run #38225061277 (run #491, commit `73b0f5703007516d333e07356f91f8752a6dc416`) failed one Python test; JavaScript contract validation passed. This SHA predates PR #8 head `4d12e567ee82452c5a37038f6ce35e4c5eb0a7ec`, where the regression test was changed to request Premium explicitly. PR #8's description reports a later route-guard run #38225069136 passed, but the current head's full status must be checked directly. | Job log inspected: 1 failure, 26 passed. Failing test was `engine/test_v1_api.py::test_interpretation_provider_uses_responses_api_and_filters_evidence`; actual `knowledge_basis` was `[]`, expected `[EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001]`. The failed commit called the provider with its default `knowledge_tier="basic"`, which intentionally excludes external curated records. The test fixture now explicitly requests Premium in the advanced evidence case, while the missing-key test keeps its default tier. Latest correction: `33a6ce6bea8a0ac18890fcbbd3382f1790fda81e`; full engine CI remains in progress. This is a test-fixture correction, not evidence that live entitlement is secure. Fix and rerun. |
| P0 | Golden Chart / temporal calculation trust | **BLOCKED** | Main contains deterministic tests and chart artifacts, but no fresh all-tests run was executed during this audit. The separate lunar-node audit still had 6/24 gate/line mismatches against Swiss TRUE_NODE in the latest saved checkpoint; production convention is not validated. | Re-run canonical chart suite; resolve node convention/remaining mismatch against trusted reference; do not promote audit approximation without validation. |
| P0 | Live three-layer integration | **BLOCKED** | Source and unit tests cover evidence, adaptation, memory governance, conversation context, and reasoning contracts; no verified live trace proves a single deployed response used canonical evidence plus authorized context through open reasoning. | Capture an authenticated E2E trace with request, canonical evidence, consent-filtered context, reasoning input/output, and regression assertions. |
| P1 | Warm, personal answer quality on main | **FAIL / NOT IN MAIN** | Draft PR #9 proposes answer-composer changes after Golden Chart #2 response was too short/generic. PR #9 is open/draft/unmerged; inspected main `engine/answer-composer.js` is still the existing implementation. Prior CI success does not prove the PR head or deployed behavior. | Review PR #9, run tests at exact head, add regression cases for “what is my Sun gate?”, “what is it saying?”, follow-ups, relevant chart connections, uncertainty, and concise-vs-deep intent. Merge only after review/CI and explicit release decision. |
| P1 | PHS detailed interpretation Premium boundary | **BLOCKED** | Product rule and PHS-1…PHS-7 acceptance tests are documented, but there is no verified production route enforcement or source-backed PHS mapping validation. | Validate deterministic mapping/provenance; then run Free denial and Premium allow tests through the actual server route. Preserve canonical substructure for audit while presenting useful human-readable labels. |
| P1 | Saturn Return timing / life-cycle interpretation | **BLOCKED** | Earlier answer supplied exact dates without reproducible ephemeris evidence and crossed the detailed Life Cycles Premium boundary. Existing temporal tests do not by themselves validate those specific dates. | Recompute against reproducible Swiss Ephemeris inputs, record UTC/local convention and test artifact; separate basic timing entitlement from Premium interpretation. Do not reuse prior dates as verified. |
| P1 | User data isolation, consent and persistence round-trip | **BLOCKED** | Governance and Supabase API contract tests exist; live authenticated persistence round-trip, consent revocation, and cross-user isolation have not been verified end-to-end in this audit. | Test save → new session retrieval for same user; deny cross-user access; prove revoked/expired/deleted context is excluded; inspect live migration/runtime status. |

## Capability-level regression matrix

| ID | Capability / expected behavior | Test assets observed | Current status | Evidence needed to pass |
|---|---|---|---|---|
| L1-1 | Deterministic chart repeatability and canonical artifact | `engine/test_golden.py`, `engine/test_canonical_chart.mjs`, `engine/test_golden_activation_regression.py` and related validators | **NOT RUN in this audit** | Run at identified commit; attach output and chart digest. |
| L1-2 | Activation provenance and data contracts | `engine/test_evidence.mjs`, `engine/validate_data_contracts.mjs`, `engine/test_data_contracts.mjs` | **NOT RUN in this audit** | Executed output plus source/method/version trace. |
| L1-3 | Natal vs transit separation | `engine/test_transit_overlay.mjs`, `engine/test_golden_transit_overlay.mjs`, `engine/test_transit_invariants.mjs`, temporal-state tests | **NOT RUN in this audit** | Execute suite and inspect representative output/UI; prove transits never mutate natal definition. |
| L1-4 | Gate/line boundaries and timezone correctness | `engine/test_boundaries.py`, `engine/test_timezone.py`, `engine/test_temporal_edge_mechanics.py` | **BLOCKED for production certification** | Boundary CI evidence is saved in separate audit checkpoint, but node convention/remaining node mismatch unresolved; rerun current main suite. |
| L1-5 | Life-cycle calculations and exact dates | `engine/test_time_mechanics.mjs`, `engine/test_temporal_ephemeris.py`, `engine/test_temporal_golden.py` | **BLOCKED** | Independently reproducible event-date calculation and known-reference fixtures; tests executed at current head. |
| L1-6 | PHS Determination/Cognition/Environment/orientation mapping | `engine/test_substructure.py` and PHS-1…PHS-7 acceptance requirements | **BLOCKED** | Trace every derived label to canonical mapping and source; prove not inferred from a gate number alone. |
| L2-1 | Adaptive response uses relevant context only | `engine/test_user-adaptation.mjs` | **NOT RUN in this audit** | Executed relevance fixtures and captured filtered context payload. |
| L2-2 | Consent, expiry and memory governance | `engine/test_user-memory-governance.mjs` | **NOT RUN in this audit** | Negative tests for absent/revoked/expired/deleted consent; retrieval trace. |
| L2-3 | Conversation continuity/follow-ups | `engine/test_conversation-context.mjs` | **NOT RUN in this audit** | Multi-turn and new-session retrieval evidence; no prior assistant answer treated as chart truth. |
| L2-4 | Persistence round-trip and user ownership | Supabase migration/API test assets include `supabase/test_user_data_api.mjs` | **BLOCKED** | Live authorized-user save/retrieve and user A vs user B negative tests; verify migration/runtime. |
| L3-1 | Open-ended, direct question answering | `engine/test_ai_reasoning_contract.mjs`, `engine/test_reasoning-provider.mjs`, Step 5 acceptance/stress/adversarial tests | **NOT RUN in this audit** | Execute current suite and verify actual runtime path reaches intended reasoning provider, not only template/unit contract. |
| L3-2 | Warm, intent-matched depth and contextual synthesis | Draft PR #9 and `engine/test_answer-composer.mjs` | **FAIL / NOT IN MAIN** | PR head CI + response fixtures + actual application E2E. |
| L3-3 | Evidence/source/inference separation and conflict handling | `engine/test_knowledge-governance.mjs`, `engine/test_external_knowledge.mjs`, `engine/test_holistic_retrieval.mjs`, `engine/test_holistic_chart_integration.mjs` | **NOT RUN in this audit** | Execute tests and assert material claims map to verified evidence/source relationships; conflicts remain explicit. |
| X-1 | Three layers coordinate in one response (3FO) | Several component-level tests exist; no complete live trace verified | **BLOCKED** | One reproducible E2E trace showing chart evidence, consent-filtered context, reasoning input/output and no canonical mutation. |
| PAY-1 | Free vs Premium entitlement on server | Draft PR #7 unit policy; draft PR #8 candidate route tests | **BLOCKED** | Actual production route; trusted identity; server-resolved entitlement; denial before retrieval/model; allow only valid Premium; expiry/cancel/fail-closed. |
| PAY-2 | Premium PHS, life cycles, advanced source retrieval | PHS-1…PHS-7 and Premium P1…P15 written acceptance tests | **BLOCKED** | Run every relevant acceptance case through production route with verified Free and Premium test accounts. |
| PAY-3 | Spoofing, prompt injection, cross-tier leakage | Candidate tests and P1…P15 requirements | **BLOCKED** | Direct API and adversarial E2E tests; client claims never authorize; no restricted material reaches model on denial. |
| UX-1 | My Chart navigation and rendering works in delivered app | Prior user-reported navigation issue; repository has frontend/API contract and inline syntax tests | **BLOCKED** | Verify current target build in browser/device: navigation, chart render, birth-data flow, Explore/Ask; source CI alone is insufficient. |
| VIS-1 | Visuals reflect chart facts and natal/transit state | Requirements documented in `docs/3framework-testing.md`; no current visual E2E evidence found | **NOT RUN** | Compare rendered visual against deterministic chart state; omit visual if alignment cannot be verified. |

## Premium server acceptance cases (P1–P15)

These are requirements, not passes. Keep every case **BLOCKED** until run through the actual protected route.

- P1 basic Free access without protected source text.
- P2 client tier spoofing cannot grant access.
- P3 direct API call by Free user is denied.
- P4 denial happens before restricted retrieval and AI-provider invocation.
- P5 valid Premium access works.
- P6 expiry/cancellation revokes access according to explicit grace policy.
- P7 missing/unavailable entitlement fails closed.
- P8 cross-user data isolation.
- P9 consent revocation, expiry and deletion filter stored context.
- P10 no Premium context leaks into Free requests.
- P11 prompt injection cannot bypass server authorization.
- P12 graceful boundary with a useful basic response where permitted.
- P13 source provenance and model synthesis remain distinct.
- P14 denial/logging does not leak protected content or private-record existence.
- P15 chart/transit/consent regressions continue to pass.

## Release gate

**Do not call 3framework complete, Premium-secure, or production-validated until all P0 rows are closed and the relevant P1 rows pass on the selected release commit.** Keep a separate result for (a) unit/contract tests, (b) candidate API integration, (c) live authenticated end-to-end behavior, and (d) deployment/browser verification.

### Execution log

| Date | Commit / run | Result | Notes |
|---|---|---|---|
| 2026-10-12 | Workflow run #38225061277 / run #491; candidate PR #8 branch | **FAIL** | Python engine validation failed; JavaScript contract validation passed. Job log inspected: 1 failed, 26 passed. `engine/test_v1_api.py::test_interpretation_provider_uses_responses_api_and_filters_evidence` returned empty `knowledge_basis` where the test expected `EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001`; root cause is not yet determined. |
| 2026-10-12 | Draft PR #7 | **BLOCKED** | 14 policy unit tests previously passed; route integration, live migration and provisioning absent per PR description. |
| 2026-10-12 | Draft PR #8 | **BLOCKED for release; candidate CI pass** | Candidate commit `33a6ce6bea8a0ac18890fcbbd3382f1790fda81e` passed Python engine validation, JavaScript contract validation, Premium API route guard, and gate-line regression. Still not production/main; no authenticated live E2E. |
| 2026-10-12 | Draft PR #9 | **BLOCKED** | Answer-quality improvement is unmerged; prior passing run is not proof for current PR head or deployed app. |
| 2026-10-12 | Candidate PR #8, commit `33a6ce6bea8a0ac18890fcbbd3382f1790fda81e` | **PASS — candidate CI only** | Python engine validation, JavaScript contract validation, Premium API route guard, and gate-line regression all completed successfully. Not production E2E. |
| 2026-10-12 | Candidate PR #9, head `8b8c2c1b48836ad7d945d78c3eaa1a340d20c0e4` | **BLOCKED for exact-head certification** | Successful engine runs observed at older commits `c7a7523699f7d440627c03e6809ce5cbc0be5120` and `95e85984f14198ff045d7fad500489307bea6e27`, not the current PR head. |
| 2026-10-12 | Draft PR #11, commit `b35ae2519f08b89462e98b6db1bc8d7ea56b4005` | **PASS — candidate CI only** | Premium API guard, Python engine validation, and JavaScript contract validation passed on the exact head. Includes Basic allowlist / Premium-by-default policy and client downgrade regression test. Does not prove production enforcement or Free UI completeness. |\n| 2026-10-12 | This audit | **IN PROGRESS** | Exact-head candidate CI verified for PR #11; live app, current-main full suite, and authenticated E2E were not run. |

## Next execution order

1. Preserve the historical PR #8 CI failure as history, but use exact-head run evidence: PR #8 candidate commit `33a6ce6bea8a0ac18890fcbbd3382f1790fda81e` and PR #11 candidate commit `b35ae2519f08b89462e98b6db1bc8d7ea56b4005` passed their observed relevant CI checks. These are still candidate-only, not main or production.
2. Run or trigger current-main engine validation and record the exact commit/results; do not use the candidate branch result as main's result.
3. Review PR #9's answer-composer tests and latest checks; keep separate from entitlement changes.
4. Select the real runtime/API route before extending Premium work. Do not merge PR #8 onto main until its base/API deployment relationship is resolved.
5. Run route-level entitlement tests, then authenticated live E2E for Premium and three-layer integration.
6. Update `RESUME.md` only after each material result is verified; fetch the saved file back to confirm remote state.
