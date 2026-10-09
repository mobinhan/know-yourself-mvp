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

## Confirmed Step 5 requirements — adaptive interpretation and persistent continuity

**Confirmed:** 2026-10-09

### Adaptive Interpretation
- Adapt explanation depth to the user's Human Design knowledge level.
- Adapt language, tone, structure and examples to the user's preferences and current question.
- Use user-provided circumstances and relevant conversation history when they improve the answer.
- Learn preferences gradually; distinguish explicit user statements from tentative inferences.
- Allow users to inspect, correct, reset and delete remembered preferences/context.
- Personalisation changes presentation and relevance, never chart mechanics, evidence standards, or the certainty of a claim.
- Do not simply affirm the user's assumptions. The critic must guard against confirmation loops, over-personalisation and unsupported claims about the user.

### Persistent memory and project continuity
- Treat persistent, cross-session memory as a product requirement, not an assumption about the model's conversational memory.
- Keep user preferences, personal context, conversation summaries, chart truth and project/build state logically separated.
- On resumption, retrieve the latest authoritative project checkpoint and verify repository state before continuing.
- Checkpoints should record completed and verified work, current stage, latest relevant commit, outstanding issues, test results and next action.
- Canonical chart data remains the sole authority for chart mechanics; user memory and conversation history must never override it.

## Confirmed quarterly knowledge-source review

**Confirmed:** 2026-10-09

This is a requirement of the **eventual production Know Yourself Human Design knowledge base and AI system itself**, not merely a manual or developer maintenance task during the build.

The completed product should independently execute a scheduled quarterly review of its registered Human Design source ecosystem and controlled knowledge records. This is a governed, auditable knowledge-maintenance capability, not permission for unconstrained AI self-modification.

Quarterly production workflow:
1. Automatically trigger once per quarter using a production scheduler.
2. Revisit registered source URLs, official source indexes and permitted discovery channels; detect changed, moved, newly published or unavailable material.
3. Prioritise P1 primary / lineage-controlled sources, while reviewing relevant P2–P4 sources according to their roles.
4. Record provenance, author/publisher, URL, publication/observed date where available, review date, tier, topic coverage and rights/use restrictions.
5. Deduplicate new material; extract only permitted metadata and concise paraphrases; preserve attribution and source links.
6. Classify records as foundational, interpretive, experiential or critical/contested.
7. Compare proposed additions and revisions against existing records; flag contradictions, uncertain provenance, unsupported claims, outdated content and source-quality changes.
8. Keep candidate updates versioned and staged. The system can automatically ingest low-risk, rights-cleared changes only when defined validation gates pass; ambiguous, conflicting, high-impact or rights-sensitive changes require review.
9. Never allow this source-refresh pipeline to change deterministic chart mechanics or canonical chart rules. Those remain governed by the deterministic engine and separately controlled releases.
10. Run retrieval, evidence traceability, answer-critic, regression and source-permission checks before updated records become active.
11. Produce an in-product quarterly change report recording additions, revisions, unavailable sources, conflicts, rights concerns, validation results and any items awaiting review.
12. Retain version history and audit trails so an answer can be traced to the knowledge version and sources used at the time.
13. If a scheduled run fails or sources cannot be reached, record the failure and retry safely; never present an uncompleted review as successful or silently discard the previous valid knowledge base.

The intended production cadence is once per quarter. The scheduler, refresh pipeline and operational controls remain to be implemented and verified; this entry records the confirmed product requirement, not a claim that the production capability is already running.

## Confirmed production requirement — individual knowledge-record provenance

**Confirmed:** 2026-10-09

The eventual production Human Design knowledge base and AI system must maintain provenance and governance at the **individual knowledge-record / claim level**, not only at the source or website level. This is a product requirement and applies to ongoing operation and quarterly refreshes.

Each knowledge record should retain, where applicable:
- Stable record ID and version, with created/updated/reviewed timestamps.
- Exact source ID, source URL, author/publisher, title, publication date and retrieval/review date where available.
- Source tier (P1–P4), topic/concept family and epistemic classification: foundational, interpretive, experiential, or critical/contested.
- The specific claim or permitted concise paraphrase, with enough context to avoid changing its meaning.
- Rights, licence, attribution and permitted-use constraints; retain only content the system is allowed to store and use.
- Confidence/quality assessment, supporting evidence, caveats, and known disagreements or contradictions.
- Lifecycle state: proposed, validated, active, superseded, disputed, withdrawn, or unavailable.
- Links to records and answers that depend on it, so changes can trigger targeted review and regression tests.
- Audit history of ingestion, validation, edits, approvals, supersession and reactivation.

At answer time, material knowledge claims should be traceable to the specific active record IDs used, alongside the relevant canonical chart/evidence IDs. At quarterly refresh, the system should assess which individual records are affected by new, changed, conflicting or unavailable source material and version the resulting changes.

Do not treat a source-level registration as proof that every page or claim from that source is verified. Do not allow a knowledge record, regardless of source tier, to override deterministic chart mechanics. Rights-sensitive, materially conflicting, or high-impact changes must remain staged for review under the production governance policy.

This is a confirmed production requirement. Full record-level lineage, dependency tracking, lifecycle controls and quarterly automation remain to be implemented and verified before they can be claimed as operational.

## Confirmed production requirement — holistic Human Design interpretation

**Confirmed:** 2026-10-09

The finished Know Yourself AI must synthesise relevant interconnected Human Design concepts rather than explain each gate, channel, centre or knowledge record in isolation. For a gate question, it should consider relevant context such as the line, channel/circuit, centre, quarter and quarter theme, mandala context, Rave Psychology, and the user's verified chart configuration—when supported by approved sources and genuinely relevant.

Maintain a versioned, evidence-backed concept relationship model / knowledge graph so retrieval can follow validated links across concepts. Clearly distinguish canonical mechanics from teaching interpretations, psychological frameworks, practitioner perspectives and lived experiences. Explain how the lenses complement one another and flag disagreement where relevant; do not indiscriminately list every related concept.

Material claims and meaningful cross-concept connections must trace to individual knowledge-record IDs and canonical chart/evidence IDs. The answer critic must assess whether the synthesis as a whole is supported, and reject invented or weakly supported links. Personalisation may change explanation depth and examples, but never chart facts, source authority or uncertainty boundaries.

Validate with cross-concept tests, including gate + quarter + Rave Psychology examples, chart-specific relevance, contradiction handling, provenance and unsupported-connection rejection. The existing concept families and evidence classes do not by themselves prove that a complete knowledge graph or holistic synthesis capability is already implemented. This is a confirmed production requirement; implementation and verification remain outstanding.

## Holistic interpretation implementation checkpoint

**Updated:** 2026-10-09

Initial Step 5 implementation added:
- engine/knowledge-relationships.json: versioned concept nodes and evidence-linked relationships.
- engine/holistic-retrieval.js: traverses validated relationships and returns supporting knowledge-record IDs; pending relationships are surfaced as evidence gaps rather than treated as established facts.
- engine/test_holistic_retrieval.mjs: tests connected gate context, traceable records, unresolved Quarter / Rave Psychology context and unknown concepts.
- engine/knowledge-ontology.json: expanded concept families and relationship types for Mandala / Quarter and Rave Psychology.
- engine/STEP5.md: documents holistic retrieval boundaries and current limitations.
- GitHub Actions now includes the holistic retrieval test.

Important limitation: this is the first retrieval scaffold, not completion of holistic Human Design reasoning. Quarter / Mandala and Rave Psychology now have source-backed records and validated graph relationships. Direct gate-to-Rave-Psychology causality remains pending. Gate-to-quarter mapping is supplied by a validated lookup cross-checked against the supplied *Definitive Book of Human Design*, Section Eight, printed pp. 294–309—not guessed by the AI. The grounded reasoning prompt consumes graph context for gate, activation, channel and centre questions and treats unresolved context as evidence gaps. GitHub Actions run 180 passed for code commit `5e55e1b05aca5938b60ca446376dabffcfb5af49`; both Python engine validation and JavaScript contract validation succeeded, including holistic retrieval and Step 5 acceptance tests. The live external LLM is still not connected, so this verifies retrieval and prompt-construction contracts rather than real-model synthesis. Run: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37887115560

### Holistic retrieval test result

**Verified:** GitHub Actions run 178 completed successfully for commit `61c3d3ecd796d100d9823bea86d4ca696493f43c` on 2026-10-09. The Python engine validation and JavaScript contract validation jobs both succeeded, including the new `Run holistic cross-concept retrieval test` and the existing Step 5 acceptance test. This verifies the initial retrieval scaffold and its evidence-gap behavior only; it does not yet verify full production holistic answer synthesis or populated Quarter / Rave Psychology coverage.

Run: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37887033375

## Holistic chart integration — implementation checkpoint

**Updated:** 2026-10-09

- Registered a secondary quarter mapping source at P3 and stored a 64-gate / four-quarter lookup in `engine/quarter-gate-map.json`. The data-integrity test checks 64 unique gate assignments, 16 gates per quarter, and the four start-gate boundaries. The gate assignments are cross-checked against the supplied *Definitive Book of Human Design*, Section Eight, printed pp. 294–309; the secondary source remains an independent cross-check.
- Added official-source external knowledge records for quarter framework and Rave Psychology foundations, View, and Motivation. Rave Psychology context is assembled from the deterministic Personality Sun and Personality Node activation fields in `E-ACTIVATIONS`, not inferred from the question's gate.
- Expanded the relationship graph with source-backed gate-to-quarter, quarter-to-Mandala, Personality Sun-to-Motivation and Personality Nodes-to-View relationships. Direct gate-to-Rave-Psychology causality remains pending and is explicitly rejected by the critic.
- Added `relationship_basis` to the AI reasoning contract (v1.1.0); the answer composer filters relationships to retrieved validated graph edges and the critic requires the appropriate relationship IDs for key cross-concept claims.
- Added conflict-set packaging for external knowledge records sharing a `conflict_group`; claims remain individually attributable and are surfaced for review rather than silently merged. The new synthetic conflict test validates this behavior; no claim is made that an existing real-source conflict was found.
- Added `engine/test_holistic_chart_integration.mjs`, which uses the golden chart fixture matching the confirmed 15 April 1982 chart data to test Gate 34 → Mutation quarter context and actual Personality Sun / Node substructure. It also verifies that a supported cross-concept draft passes and an unsupported claim that Gate 34 determines Motivation is rejected.

**Verification boundary:** the automated test covers evidence selection, prompt construction and answer-critic behavior—not live model output. Quarter-to-gate assignments are source-validated; the external LLM is not connected. Individual record lifecycle timestamps, dependency tracking, quarterly source refresh automation and production persistence are still outstanding.

