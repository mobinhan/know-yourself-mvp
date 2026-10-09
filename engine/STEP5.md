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
- The graph includes extension points for Quarter / Mandala context and Rave Psychology; these remain pending until specific, permitted, provenance-traceable knowledge records validate them.
- Holistic synthesis must connect relevant chart mechanics and interpretive frameworks, while distinguishing source-backed relationships from interpretation and never inventing mechanics.
- `test_holistic_retrieval.mjs` verifies the initial graph retrieval and fail-safe treatment of missing Quarter / Rave Psychology evidence.

## Current limitation
The current reasoning adapter deliberately provides a provider-neutral boundary and a deterministic mock for testing. It does not call an external LLM. Conversation state and production model integration remain separate concerns.

## Acceptance
Step 5 progresses only when each boundary is tested independently and the full deterministic suite remains green.
