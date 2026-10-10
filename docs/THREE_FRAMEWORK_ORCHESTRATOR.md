# 3Framework Orchestrator (3FO)

Status: first executable contract prototype; not yet wired into the production answer-generation path.

## Purpose
The 3FO coordinates inputs across the approved three layers. It is a cross-cutting component, **not a fourth layer** and not a separate reasoning/critic model.

- Layer 1: Canonical Chart + Immutable Evidence — source of chart facts and evidence.
- Layer 2: Adaptive User Context — relevant user-specific preferences, memories, conversation history, and insights.
- Layer 3: ChatGPT live reasoning — the answer-generation process that reasons from Layers 1 and 2.

## Current contract
`prepare3FrameworkInput()` accepts a question, canonical evidence, and adaptive context, then creates a structured input packet. It keeps evidence and personal context in separate fields and marks the authority boundary explicitly. Missing required inputs fail closed. It does not calculate chart facts, persist context, or generate an answer.

## Supporting appendices/components
- Appendix A — Canonical Evidence & Provenance
- Appendix B — Adaptive Context & Persistent Continuity
- Appendix C — Correction Governance
- Appendix D — Response Quality & Regression Testing
- Appendix E — Privacy, Permissions & Data Lifecycle

These are supporting contracts/components, not additional framework layers.

## Next integration gates
1. Verify and review the existing correction-governance and continuity PRs.
2. Trace the actual backend/frontend answer path and its auth model.
3. Connect canonical evidence and consent-governed context retrieval to the same request.
4. Pass the resulting packet to the actual answer-generation path.
5. Add end-to-end regression tests for correction retention, canonical fact protection, relevance, and natural uncertainty handling.
6. Only describe the 3FO as runtime-active after end-to-end tests prove it. No production deployment is implied by this prototype.
