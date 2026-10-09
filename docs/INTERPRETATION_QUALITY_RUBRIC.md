# Interpretation Quality Rubric — Offline Regression Fixtures

**Status:** Step 3 in progress  
**Purpose:** Evaluate the reliability of 3framework synthesis without requiring Lovable access or live OpenAI calls.

## Evaluation boundaries

- Layer 1 remains the authority for chart mechanics and source-linked knowledge.
- Layer 2 may personalize relevance and continuity but must not invent traits or override Layer 1.
- Layer 3 remains ChatGPT synthesis. The deterministic critic is a guardrail, not another language model or a claim of complete semantic understanding.
- Offline mocked-provider tests establish contract behaviour only. They do not prove real-world model quality.

## Fixture matrix

| Quality dimension | Fixture strategy | Expected result |
|---|---|---|
| Natal gate integrity | Assert active and inactive gates against canonical activation/gate sets | Contradictions are flagged; correct claims pass |
| Gate-line integrity | Check exact gate + line activation, not just whether the gate appears somewhere in the chart | A different line is not treated as active |
| Channel integrity | Check both defined and invented channels; normalize endpoint order | Canonical channels pass; unsupported defined-channel claims are flagged |
| Centre integrity | Check defined and undefined centres; normalize labels such as `solar_plexus` and “solar plexus” | Contradictions are flagged |
| Type, authority, profile | Compare explicit claims with canonical `core` values when present | Conflicting claims are flagged; matching claims pass |
| Source fidelity | Gate-line archetypes require exact gate/line source match and a validated relationship | Missing, mismatched, or unlinked source evidence is blocked |
| Natal vs transit | Transit claims require actual `transit_gates` data and a claimed gate present in that set | No temporal evidence or a mismatched gate is flagged |
| Evidence IDs | Only retrieved knowledge/relationship IDs can be returned | Invented IDs are removed by provider normalization |
| Malformed output | Wrong types, null arrays, invalid gate values, or missing answer | Output is normalized or fails closed |
| Uncertainty and interpretation | Human-reviewed fixtures assess whether meaning is presented as interpretation, uncertainty is calibrated, and predictions are not stated as guarantees | Record qualitative judgement; do not pretend regex checks prove it |
| Cross-concept synthesis | Fixtures combine gates, lines, channels, centres, and transit context; deliberately mismatched relationships are included | Concepts must not leak across unrelated source edges |

## Current automated coverage

Implemented in `tests/test_interpretation_critic.py` and `tests/test_gate_line_synthesis_contract.py`:

- Active/inactive natal gate claims.
- Exact active gate-line status.
- Correct and invented channel claims.
- Defined/undefined centre contradictions.
- Profile, type, and authority conflicts and matching claims.
- Gate-line archetype without exact support, and with exact source plus validated relationship.
- Transit claims without temporal data, with incomplete temporal data, and with gates missing from the supplied transit set.
- Provider-level fail-closed behaviour for chart-mechanics contradictions.
- Evidence-ID filtering, malformed optional fields, missing answer, and provider-not-configured/no-network behaviour.

Focused CI run: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914827088

## Known limitations / next expansion

1. Pattern matching cannot reliably understand every paraphrase, negation, hypothetical, or long-range cross-concept claim.
2. Current source-specific synthesis enforcement focuses on gate-line archetypes. General knowledge claims still rely on retrieval selection, allowed-ID filtering, and prompt instructions; ID validity is not proof of semantic support.
3. The transit guard checks explicit gate assertions against `transit_gates`; it does not yet validate every transit channel, centre, or interpretive statement.
4. Qualitative dimensions—depth, relevance, balanced framing, uncertainty, source fidelity in paraphrase, and personalization without overreach—need curated human-scored examples.
5. The next useful increment is a concept-diverse golden fixture set: multiple gates/lines, at least one channel and centre interaction, one type/authority/profile query, one transit overlay query, and deliberately conflicting evidence. Each fixture should record expected chart facts, allowed source IDs, forbidden claims, and qualitative scoring notes.

## Release interpretation

A passing offline suite means the specific regression cases pass. It does **not** mean all Human Design knowledge is complete, the live provider is configured, or live ChatGPT responses have been semantically validated.
