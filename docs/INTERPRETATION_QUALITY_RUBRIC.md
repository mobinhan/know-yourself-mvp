# Interpretation Quality Rubric — Offline Evaluation Fixtures

**Status:** Step 3 in progress  
**Purpose:** Evaluate direct 3framework synthesis without Lovable access or live OpenAI calls. This rubric is for offline evaluation, not an active post-synthesis critic.

## Binding architecture boundary

- Layer 1 is authoritative for chart mechanics and source-linked knowledge.
- Layer 2 may personalize relevance and continuity but must not invent traits or override Layer 1.
- Layer 3 is direct ChatGPT synthesis. The active 3framework provider must not invoke a separate critic or additional reasoning layer.
- The standalone `api/interpretation_critic.py` helper and its unit tests are isolated comparison/legacy material only. They are not part of the active 3framework response path.
- Ordinary schema validation, JSON normalization, and filtering returned evidence IDs to records actually supplied remain allowed contract handling.
- Offline mocked-provider tests establish request/response contract behaviour only. They do not prove live model quality or independently verify the semantic truth of every generated claim.

## Fixture matrix

| Quality dimension | Evaluation method | Expected evaluation outcome |
|---|---|---|
| Natal gate integrity | Compare generated claims with canonical activation evidence | Record whether claims are correct; the provider does not automatically rewrite or block the answer after synthesis |
| Gate-line integrity | Compare claims with exact gate + line activation and matching source evidence | Record mismatches; a gate catalogue alone cannot prove a specific activation |
| Channel integrity | Compare defined-channel claims with canonical channel evidence | Record unsupported claims; no post-synthesis critic blocks them |
| Centre integrity | Compare defined/undefined centre claims with canonical centre evidence | Record contradictions; provider output is not rewritten after synthesis |
| Type, authority, profile | Compare explicit claims with canonical values when available | Record matches, contradictions, or cases where evidence is missing |
| Source fidelity | Compare interpretive claims with supplied source records and validated relationships | Record whether the source actually supports the claim; a valid ID alone is not semantic proof |
| Natal vs transit | Check whether transit claims are supported by supplied temporal context | Record unsupported or conflated natal/transit claims |
| Evidence IDs | Check returned knowledge/relationship IDs against retrieved records | Invalid IDs are removed by provider normalization; this does not prove semantic support |
| Malformed output | Test wrong types, null arrays, invalid gate values, and missing answer | Output is normalized or a missing required answer fails closed |
| Uncertainty and interpretation | Human-review depth, calibrated uncertainty, non-diagnostic framing, and guaranteed predictions | Record qualitative judgement rather than pretending pattern matching proves it |
| Cross-concept synthesis | Combine gates, lines, channels, centres, and transit context with deliberately mismatched evidence | Record source leakage, unsupported connections, and whether distinctions remain clear |

## Current automated contract coverage

Implemented in `tests/test_gate_line_synthesis_contract.py`:

- Confirms the provider sends canonical chart evidence, selected source-linked knowledge, and validated relationships to ChatGPT.
- Confirms the prompt identifies direct 3framework synthesis and does not define a separate critic layer.
- Confirms output evidence IDs are restricted to records actually supplied.
- Covers malformed optional fields, missing required answer, and provider-not-configured/no-network behaviour.
- Confirms provider output is not rewritten by a post-synthesis critic.

The standalone `tests/test_interpretation_critic.py` tests only the isolated legacy critic utility; they are not evidence that the active 3framework provider invokes that utility.

Historical CI runs that tested the previous critic-wired implementation do not validate the corrected direct-synthesis path. Check the latest branch and CI before claiming the current path passes.

## Active 3framework provider contract

The active API provider sends canonical evidence and adaptive context to ChatGPT, then performs response-schema normalization and filters evidence identifiers against supplied records. It does not run a separate post-synthesis critic. No live OpenAI request has been made as part of this offline work.

## Known limitations / next expansion

1. The active provider does not independently verify the semantic truth of every generated chart claim after synthesis. Correctness depends on the canonical evidence supplied to ChatGPT, the instructions, and subsequent human/offline evaluation.
2. Filtering evidence IDs proves only that an ID was supplied; it does not prove that the cited source semantically supports every sentence.
3. Transit, channel, centre, profile/type/authority, gate-line source fidelity, and cross-concept claims need curated fixture-based evaluation; no separate critic currently blocks an incorrect answer after synthesis.
4. Qualitative dimensions—depth, relevance, balanced framing, uncertainty, source fidelity in paraphrase, and personalization without overreach—need curated human-scored examples.
5. Next: build a concept-diverse golden fixture set with multiple independently sourced gates/lines, channel-centre interactions, type/authority/profile questions, transit questions, and deliberately conflicting evidence. Each fixture should record expected chart facts, allowed source IDs, forbidden claims, and qualitative scoring notes.

## Release interpretation

Passing offline tests means only that the specific contract cases passed. It does **not** mean all Human Design knowledge is complete, the live provider is configured, or live ChatGPT responses have been semantically validated.
