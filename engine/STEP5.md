# Step 5 — AI Reasoning & Answering Layer

## Current status
AI reasoning contract, question understanding, and deterministic evidence selection are implemented.

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

## Design principle
The answering experience should be conversational and intelligent, comparable in interaction quality to general AI assistants, while remaining grounded in the deterministic and provenance-controlled layers underneath.

## Current limitation
Generation, critic evaluation, and persistent conversation state are deliberately not yet implemented. They follow only after the input boundary has been tested.

## Acceptance
Step 5 progresses only when each boundary is tested independently and the full deterministic suite remains green.
