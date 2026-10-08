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

## Current limitation
The current reasoning adapter deliberately provides a provider-neutral boundary and a deterministic mock for testing. It does not call an external LLM. Conversation state and production model integration remain separate concerns.

## Acceptance
Step 5 progresses only when each boundary is tested independently and the full deterministic suite remains green.
