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
- The answer contract now includes `relationship_basis`. The critic checks required graph relationship IDs for gate/quarter and Personality Sun/Node claims, rejects unsupported gate-to-Rave-Psychology causality, and rejects unknown relationship IDs.
- External knowledge packets now expose explicit conflict sets when separately registered records in a conflict group make distinct claims. The system is instructed to preserve provenance and disclose disagreement rather than silently merging claims.
- Tests include a chart-specific integration fixture and a synthetic conflicting-source fixture. These validate retrieval, prompt assembly, provenance and critic behavior; they do **not** constitute a live LLM reading.

Current acceptance boundary: deterministic mechanics remain authoritative; the quarter mapping is source-validated; the external LLM remains unconnected. Do not describe the full production holistic interpretation capability as complete until record-level lifecycle governance and real-model acceptance tests are finished.

