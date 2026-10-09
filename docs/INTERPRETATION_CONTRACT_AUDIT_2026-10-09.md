# Interpretation Contract Audit — 2026-10-09

## Scope and constraints

- Audited the current `feature/live-api-v1` provider and reasoning contracts without opening or modifying Lovable.
- No Vercel action was taken. No PR was merged.
- Current task is repository-only. The live OpenAI connection and live app output remain unverified.

## Findings

### 1. The critic exists, but it is not a mandatory part of 3framework

- `engine/answer-critic.js` implements `criticAnswer` and `finalizeAnswer`, including checks for unknown evidence/knowledge/relationship IDs, missing evidence for selected chart claims, and several unsupported cross-concept claims.
- `engine/reasoning-adapter.js` calls `finalizeAnswer`; `engine/test_answer-critic.mjs` and `engine/test_reasoning-adapter.mjs` exercise that route.
- However, `engine/THREE_FRAMEWORK.md` explicitly defines 3framework as direct ChatGPT synthesis from canonical evidence plus adaptive context, with **no mandatory separate critic**. `engine/test_three-framework.mjs` asserts that there is no critic in the Layer 3 envelope.
- The Python API provider in `api/interpretation_provider.py` is a separate route. It sends evidence and instructions to OpenAI and normalizes the returned JSON, but does not invoke the JavaScript critic. Its own `layer_separation` text explicitly says there is no separate critic in this path.
- **Decision:** preserve the documented 3framework architecture. Do not wire in the separate critic as an architectural change without an explicit decision. Keep semantic quality checks in offline tests/fixtures for now.

### 2. Deterministic chart facts remain upstream of synthesis

- The API route builds a canonical foundation and passes its core and activation data into `generate_interpretation`.
- The provider instruction says supplied core/activation records are authoritative and prohibits recalculating or inferring chart mechanics.
- Birth data is not included as a direct field in the model-safe context. The new contract test asserts that `birth_data` and `birth_date` are not present in the model input.
- This protects the request boundary but is not a proof that every generated sentence is semantically correct.

### 3. Existing response safeguards and gap

- The provider already requires a non-empty string `answer`, filters factual-basis labels, filters knowledge and relationship IDs against retrieved evidence, limits card counts/text lengths, and restricts card gates/channels/centres to the canonical foundation.
- Prior to this change, several malformed optional fields could be iterated as the wrong type, surfaced in inconsistent shapes, or raise errors (for example, `relationship_basis: null`, `limitations: "text"`, or a non-integer `gate` value).
- The provider now normalizes optional evidence arrays to lists of allowed strings, drops malformed basis fields, sanitizes card source/channel/centre lists, rejects non-canonical gate values, falls back to the answer when `one_line` is invalid, and clears non-string `interpretation` values.
- A missing/empty answer still fails closed with a sanitized `InterpretationProviderError`.
- Unknown evidence IDs are removed, but this is **referential validation**, not a semantic guarantee that the prose is supported by the cited evidence.

## Offline tests added/extended

In `tests/test_gate_line_synthesis_contract.py`:

- Existing contract test now also checks that direct birth-data fields are not passed into model input and that the mechanics guardrail is present.
- Added malformed-optional-fields regression test.
- Added missing-required-answer failure test.
- Added provider-not-configured/no-network test.
- Existing unknown-evidence-ID normalization test remains in place.

The focused GitHub Actions run #39 initially failed because a newly added assertion expected an instruction phrase that does not exist in the actual prompt. The assertion was corrected to match the real mechanics guardrail. The corrected commit must be revalidated by CI before these changes are called passing.

## Live integration status

- `OPENAI_API_KEY` was not inspected or exposed. The offline test verifies that, when it is absent, the provider reports `provider_not_configured` and does not make a network call.
- No real OpenAI request was sent. No real model output was evaluated.
- Lovable was not accessed or changed.

## Next action

1. Verify the latest feature branch head and rerun/inspect focused CI after the corrected test commit.
2. If focused tests pass, run the broader repository contract suite through GitHub Actions as available.
3. Keep the live-provider semantic-quality gap documented; propose any future critic architecture change separately rather than silently changing 3framework.
