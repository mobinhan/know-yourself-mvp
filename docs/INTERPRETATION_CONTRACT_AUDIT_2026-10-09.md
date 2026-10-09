# Interpretation Contract Audit — 2026-10-09

## Scope and constraints

- Repository-only review of `feature/live-api-v1`; Lovable was not accessed or changed.
- Vercel was not used. PR #1 was not merged.
- No real OpenAI request was sent; the live key/configuration and deployed output remain unverified.

## Architecture decision

Know Yourself retains its three layers:

1. **Layer 1 — Canonical chart + evidence:** deterministic chart mechanics and controlled, source-linked knowledge.
2. **Layer 2 — Adaptive user context:** relevance and continuity only; it cannot override chart facts.
3. **Layer 3 — ChatGPT synthesis:** the sole language-model synthesis step.

We did **not** add a second AI model or redefine 3framework. Instead, a deterministic post-synthesis quality gate now checks high-confidence contradictions in the Python API route. This is a guardrail after Layer 3, not a fourth reasoning layer.

## Step 2 implementation

Added `api/interpretation_critic.py` and connected it to `api/interpretation_provider.py`.

The gate currently checks:

- Explicit claims that a gate is activated/defined/active against canonical gate and activation data.
- Explicit defined/active channel claims against canonical channels.
- Explicit defined-centre claims against the supplied centre list.
- Specific gate-line archetype claims against an exact supplied source and matching validated relationship.
- Current-transit assertions when no temporal context was supplied.

When a high-confidence contradiction or missing exact gate-line support is detected, the provider fails closed: it replaces the answer with a safe message, clears cards and evidence-basis claims, adds a limitation, returns `interpretation_status: "needs_review"`, and includes a `quality_review` result. Clean answers retain `interpretation_status: "ready"`.

This is deterministic pattern-based validation, not a proof that all natural-language statements are true. It can miss paraphrases and nuanced unsupported interpretations; false positives are also possible. It is an initial safety boundary to expand through Step 3's broader semantic-quality fixtures.

## Tests and CI

- Added `tests/test_interpretation_critic.py` covering invented natal gate activation, false-negative gate status, invented defined channel, valid channel, unsupported gate-line archetype, transit claim without temporal evidence, and transit claim with temporal context.
- Extended `tests/test_gate_line_synthesis_contract.py` to verify the live provider fails closed on a conflicting chart claim and passes a source-grounded response.
- Updated `.github/workflows/step1-engine.yml` to run the provider contract and critic tests in CI.
- Updated `engine/test_v1_frontend_contract.mjs` to validate the Python route handler instead of requiring the deleted `vercel.json`.
- Focused Gate-line regression CI passed: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37913796218
- Full Step 1 Engine Validation passed on commit `ef96b1872ac24c56be86569446136f1c2feb52bd`: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37913789162

## Remaining limitations

- The validator only catches explicit patterns it knows about. It is not a semantic AI critic and cannot establish general source faithfulness.
- Referential ID filtering remains distinct from prose validation.
- Natal/transit checks currently focus on explicit high-confidence wording and require broader fixture coverage.
- No live OpenAI response has been assessed. Lovable was not accessed or changed.
- The GitHub API can verify pushed repository state, not unpushed desktop-only edits.

## Next action

Continue Step 3: broaden offline semantic-quality fixtures across representative Human Design concepts and query types, not only Gate 57. Cover chart mechanics, source fidelity, natal-versus-transit distinctions, uncertainty calibration, and unsupported cross-concept claims. Keep the deterministic chart engine authoritative and do not add a second LLM unless the user explicitly changes the 3framework decision.


## Step 3 update — expanded offline quality checks

The initial guardrail has been expanded to compare explicit profile, type, and authority statements with canonical `core` values when present; check exact gate-line activation rather than only gate membership; and compare explicit transit gate claims against the supplied `transit_gates` set. Centre labels normalize underscores to spaces.

Regression fixtures now include both positive and negative cases for these mechanics, exact source/validated relationship matching, and a deliberate cross-concept mismatch (a source valid for Gate 34.2 must not support a Gate 57.4 claim).

- Rubric and coverage plan: [`docs/INTERPRETATION_QUALITY_RUBRIC.md`](INTERPRETATION_QUALITY_RUBRIC.md).
- Focused suite passed 27 tests: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912387
- Full Step 1 Engine Validation passed on the same code/test commit: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912452
- Later commits update documentation/checkpoint only. Current branch head should be verified before resuming.

The validator remains pattern-based. It cannot guarantee semantic source faithfulness for all paraphrases, uncertainty, depth, personalization, or broad cross-concept reasoning. Those need curated and human-scored fixtures; no live OpenAI output has been evaluated.
