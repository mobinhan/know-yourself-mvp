# Step 5 — AI Reasoning & Answering Layer

## Current status
AI reasoning contract, question understanding, deterministic evidence selection, grounded answer adaptation, and critic enforcement are implemented.

## Boundary
The AI layer may interpret supplied evidence and controlled knowledge. It must not calculate, alter, or replace deterministic mechanics.

## Pipeline
User question
→ question understanding
→ evidence target selection
→ deterministic evidence retrieval
→ provenance-controlled knowledge retrieval
→ AI reasoning
→ critic
→ answer composer

## Current components
- ai-reasoning-contract.json
- question-understanding.js
- evidence-selection.js
- reasoning-adapter.js
- answer-critic.js
- answer-composer.js (first-class Cross context and adaptive-policy integration)
- user-adaptation.js (consent-aware preference/context filtering contract; no persistence)

## Design principle
The answering experience should be conversational and intelligent, comparable in interaction quality to general AI assistants, while remaining grounded in the deterministic and provenance-controlled layers underneath.

## Holistic cross-concept interpretation
- A versioned relationship graph connects validated concepts and their supporting knowledge-record IDs.
- Retrieval follows only validated relationships and returns unsupported or unpopulated context as explicit gaps rather than treating it as established knowledge.
- The grounded reasoning prompt now receives holistic context for gate, activation, channel and centre questions; its instructions prohibit treating unresolved graph context as established fact.
- Quarter / Mandala context and Rave Psychology now have source-backed knowledge records and validated graph relationships. Direct gate-to-Rave-Psychology causality remains pending and is intentionally not asserted.
- Holistic synthesis must connect relevant chart mechanics and interpretive frameworks, while distinguishing source-backed relationships from interpretation and never inventing mechanics.
- `test_holistic_retrieval.mjs` validates graph edges, quarter mapping coverage and primary-source provenance; `test_holistic_chart_integration.mjs` checks a chart-specific gate + quarter + Rave Psychology prompt and unsupported-link rejection.

## Current limitation
The current reasoning adapter deliberately provides a provider-neutral boundary and a deterministic mock for testing. It does not call an external LLM. Conversation state and production model integration remain separate concerns.

## Acceptance
Step 5 progresses only when each boundary is tested independently and the full deterministic suite remains green.

### Chart-specific holistic integration checkpoint — 2026-10-09

- Added `engine/quarter-gate-map.json` with all 64 gates assigned once across four 16-gate quarters. Automated checks verify 64 unique assignments, 16 gates per quarter, and start-gate boundaries 13 / 2 / 7 / 1.
- The four-quarter framework and gate-specific quarter grouping are cross-checked against the supplied *Definitive Book of Human Design*, Section Eight, printed pp. 288–309. The secondary educational reference is retained as an independent cross-check. The map is marked **validated** and carries its primary-source locator.
- Added controlled knowledge records from the supplied *Definitive Book of Human Design* and Rave Psychology Year 1 Semesters 1–2, alongside external-source records for the four-quarter framework, secondary cross-check, Rave Psychology foundations, View and Motivation. Each record retains source IDs, a locator, claim type/status where applicable and permitted use.
- Rave Psychology is now connected through the correct chart-specific substructure: Personality Sun Color to Motivation, and Personality Node Color to View. The prompt explicitly prohibits inferring either from the queried gate alone.
- For the confirmed chart fixture, the supplied RP course sources identify Personality Sun Color 3 as Desire and Personality Node Color 6 as Innocence in the seeing context. A conditional 6-to-3 transference relationship is retrieved only when those verified colors match, and the prompt frames it as an observation framework—not proof of current transference.
- The answer contract now includes `relationship_basis`. The critic checks required graph relationship IDs for gate/quarter and Personality Sun/Node claims, rejects unsupported gate-to-Rave-Psychology causality, and rejects unknown relationship IDs.
- External knowledge packets now expose explicit conflict sets when separately registered records in a conflict group make distinct claims. The system is instructed to preserve provenance and disclose disagreement rather than silently merging claims.
- Tests include a chart-specific integration fixture and a synthetic conflicting-source fixture. These validate retrieval, prompt assembly, provenance and critic behavior; they do **not** constitute a live LLM reading.

Current acceptance boundary: deterministic mechanics remain authoritative; the quarter mapping is source-validated; the external LLM remains unconnected. Do not describe the full production holistic interpretation capability as complete until record-level lifecycle governance and real-model acceptance tests are finished.


## First-class Incarnation Cross context — implementation in progress
- The prompt now builds a dedicated `incarnation_cross_context` from `E-CROSS` and checks each of the four Sun/Earth gate-line pairs against the canonical activation evidence.
- Each activation receives its own gate-quarter lookup; the Personality Sun quarter is explicitly identified as the primary Cross anchor.
- The context includes the profile when deterministic profile evidence is supplied. It does not invent a Cross name if no name is supplied by canonical evidence.
- Missing or mismatched activation slots make the context incomplete and expose the missing slots instead of fabricating a complete reading.
- Chart-specific integration tests assert the four fixture activations (Personality Sun 42.5, Personality Earth 32.5, Design Sun 60.1, Design Earth 56.1), individual quarter mappings, primary-quarter anchor and no invented Cross name.

## User adaptation and memory boundary — contract groundwork
- `user-adaptation.js` defines a consent-aware policy for explanation depth, tone, language and explicit personal context.
- Explicit confirmed preferences outrank inferred preferences. Inferred preferences require personalization consent and confidence >= 0.8; personal context requires separate consent and must be explicit.
- Chart truth, source knowledge and system instructions are excluded from user-context memory so they cannot override canonical evidence.
- The policy is integrated into prompt assembly and explicitly limited to presentation and relevance, never mechanics, evidence standards or certainty.
- This is a policy contract only. It does **not** implement durable cross-session memory, automatic preference learning, account-level inspection/correction/reset/deletion or a live model provider. Those require backend integration and further acceptance testing.

## Governed memory and conversation integration — contract groundwork
- `user-memory-governance.js` validates memory candidates, separates explicit from inferred records, requires consent, applies a confidence threshold to inferences, requires a source turn, and keeps inferred candidates in `proposed` status until user confirmation.
- Only active, consented, non-expired records in approved personal-memory categories can enter the prompt. Chart truth, source knowledge and system instructions are excluded.
- Prompt assembly now keeps three distinct inputs separate: adaptive response policy, governed active user memory, and bounded conversation continuity. Conversation history is only for references/follow-ups; prior assistant responses are never chart evidence.
- These modules are policy and contract groundwork, not persistent learning. Cross-session storage, memory inspection/edit/reset/delete controls, consent UX, audit trails and authenticated multi-user isolation must be implemented in the backend before claiming user memory is operational.
