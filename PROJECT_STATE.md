# Know Yourself — Project State

**State captured:** 2026-10-09
**Repository:** `mobinhan/know-yourself-mvp`
**Branch:** `main`
**Latest verified commit at capture:** `9a4ceb6ec25b2436d6d62e9431f0cec4bc86e358`

## Working rule

Proceed autonomously until a major decision is needed or a major update has been established. Do not interrupt for minor implementation choices. Surface a decision only when logic fails or a choice materially affects architecture, scope, licensing, or another irreversible decision.

Routine background checks may be performed silently. They do not need to be reported unless specifically requested or materially relevant.

## Product architecture

`Birth Data → Deterministic Calculation Engine → Canonical Chart Artifact → Evidence Layer → Knowledge / Interpretation Layer → AI Reasoning + Critic → Supabase persistence/API → Lovable frontend`

Core rule: deterministic Human Design mechanics are the source of truth. AI may interpret supplied facts and knowledge, but must not calculate, alter, or invent chart mechanics.

## Build status

1. Deterministic Engine — completed
2. Complete Deterministic Mechanics — completed and CI verified
3. Canonical Data Contracts — completed and CI verified
4. Evidence & Knowledge Layer — completed and expanded with external practical sources
5. AI Reasoning / Answering Layer — current hardening stage
6. Supabase Backend — next after Step 5
7. Connection / Relationship Intelligence
8. Full MVP Acceptance Testing
9. Lovable Frontend

Supabase has not yet been started. Lovable/frontend work remains later.

## Knowledge ecosystem

The controlled knowledge layer uses provenance, concept families, evidence classes and explicit source hierarchy. External blogs, videos, podcasts, practitioner material and social media are enrichment only; they never override deterministic mechanics.

External source tiers:
- P0 — deterministic mechanics; absolute authority for chart calculation
- P1 — primary / lineage-controlled teaching
- P2 — established teacher / practitioner material
- P3 — community / practical lived examples
- P4 — critical / comparative / independent commentary

Current seeded external sources include Jovian Archive, Ra TV, Richard Beaumont / Human Design School, Human Design Collective, Human Design Business, critical independent commentary, and IHDS.

### IHDS integration

`EXT_IHDS_OFFICIAL` is registered as a P1 source for official International Human Design School educational, certification and lineage context.

The user-supplied official IHDS Facebook share URL is retained as a social provenance/discovery pointer rather than treated as a separate independent authority.

IHDS-related records cover:
- educational standards and lineage context
- current teaching / practical context
- official social-media provenance context

Copyrighted material remains provenance-controlled: metadata, source links and concise paraphrase unless rights permit fuller use.

## AI reasoning safeguards

The provider-neutral reasoning interface is in place. The repository currently uses a deterministic mock provider for contract testing; no live external LLM provider is connected yet.

Reasoning safeguards include:
- fail-closed when evidence is insufficient
- factual chart statements traceable to evidence IDs
- knowledge claims traceable to controlled knowledge IDs
- temporal claims require temporal evidence
- connection interpretation cannot turn into unsupported mechanical claims
- external blogs/videos/podcasts/practitioner material can enrich interpretation but cannot override deterministic evidence
- answer critic rejects unsupported factual basis and AI-calculation claims
- conversation context can resolve follow-ups but is never a source of chart truth

## Verification at capture

GitHub Actions for commit `9a4ceb6ec25b2436d6d62e9431f0cec4bc86e358`:
- JavaScript contract validation — success
- Python engine validation — success

The GitHub commit status also contains a separate Vercel deployment-rate-limit failure. That is deployment infrastructure and does not invalidate the engine validation. Vercel is not the authority for engine correctness.

## Next logical stage

Continue hardening Step 5 AI reasoning/answering until a major decision or major update is reached. Then proceed to Supabase, using the installed Supabase skill and the persistence requirements revealed by Step 5.
