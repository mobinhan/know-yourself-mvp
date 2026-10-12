# 3framework testing

Status: working contract and test map  
Purpose: validate that the three-layer Know Yourself framework works as one coherent system. This is a test/documentation map, not a claim that all layers are already integrated or validated.

## Framework map

```mermaid
flowchart TD
    U[User asks freely, adds context or follows up] --> R[Layer 3: Open ChatGPT reasoning]
    C[Layer 1: Canonical Chart + Immutable Evidence] --> R
    A[Layer 2: Adaptive User Context] --> R
    C -->|verified mechanics, provenance, evidence| R
    A -->|relevant context, preferences, history, consent| R
    R --> O[Helpful, warm, contextual answer]
    R -->|uncertainty or evidence conflict| X[State limits clearly; ask only if needed]
    O --> F[Optional user feedback / saved insight]
    F --> A
    F -. never silently edits chart truth .-> C
```

The user-facing reasoning layer remains open. Do not force the user through a predefined questionnaire or fixed set of questions. The user can ask any question and fill in details on the spot. The system may ask a concise clarifying question only when a missing detail materially affects the answer.

## Layer 1 — Canonical Chart + Immutable Evidence

**Purpose:** provide the authoritative, deterministic foundation for chart facts and source evidence.

Rules:
- Chart mechanics come from the deterministic chart engine, not from free-form LLM inference.
- Keep input data, calculation method/version, outputs, provenance, and evidence traceable.
- Keep natal definition separate from temporary transit activations and combined/overlay views.
- Do not silently change a chart fact because a user preference, memory, transit, or narrative suggests otherwise.
- If a value is unverified, conflicting, or unavailable, mark it as such.
- Never infer authority, channels, gates, lines, centres, or lifecycle activations from prose when validated engine output is available.
- Changes to calculation conventions require trusted reference validation and explicit review; do not switch true/mean node conventions based only on incomplete comparisons.

## Layer 2 — Adaptive User Context

**Purpose:** help the system remember what is relevant to this person and this conversation, without becoming a second source of chart truth.

### Context categories

1. **User-provided context**
   - Details the user explicitly shares about their situation, goals, lived experience, current question, and constraints.
   - Distinguish a user's statement from an externally verified fact.

2. **Preferences and response style**
   - Preferred tone, depth, terminology, language, interaction style, and known dislikes.
   - Current explicit instructions override older general preferences when they conflict.

3. **Conversation continuity**
   - Relevant prior questions, decisions, corrections, unresolved threads, and project state.
   - Retrieve only what is relevant to the current request; do not dump the whole history into every answer.

4. **Saved insights and reflections**
   - Insights the user explicitly chooses to save, plus their date, topic, and provenance.
   - Treat reflections as interpretations, not as deterministic chart facts or established truths about the user.

5. **User feedback and corrections**
   - Preserve durable corrections and decisions when appropriate.
   - A correction should trigger source re-checking and, where useful, a regression test—not merely a change in wording.

6. **Consent and lifecycle**
   - Respect consent for storage and use. Apply access controls, retention/expiry rules, and deletion requests.
   - If consent is absent, revoked, or ambiguous, do not use protected stored context. Ask only if needed to proceed.

### Context record contract

A context record should carry, where applicable:
- `id`: stable record identifier.
- `type`: preference, user_context, conversation_summary, decision, correction, saved_insight, or unresolved_question.
- `content`: concise human-readable content.
- `source`: user statement, conversation, explicit save, or other identifiable origin.
- `created_at` and `updated_at`.
- `relevance_tags` or topic labels.
- `consent_status`, access scope, and expiry/deletion status where relevant.
- `confidence/status`: explicit, inferred, tentative, disputed, or superseded.
- `related_chart_id` only when the record is actually tied to a specific chart.

Do not invent missing metadata. Keep inferred context visibly distinct from explicit user statements. A newer explicit correction supersedes a conflicting inference. Preserve prior versions only where the product's consent and retention rules allow it.

### Retrieval and use rules

- Retrieve context by relevance to the current question, recency when useful, and the user's explicit preferences—not simply by recency alone.
- Use the minimum relevant context needed to answer well.
- Separate **what the user said**, **what the chart engine verifies**, **what source material teaches**, and **what the reasoning layer infers**.
- Do not let memories alter the canonical chart, source evidence, or calculation outputs.
- Do not turn an old reflection into a permanent personality label.
- Do not infer sensitive personal facts or store sensitive context merely because it appeared in a conversation.
- If context conflicts, prefer the latest explicit user correction for their own preference or stated experience; for chart mechanics, use validated canonical output; for source claims, inspect the source. Explain unresolved conflicts.
- The user may correct, update, inspect, or ask to forget context. The system should acknowledge and apply those controls where supported.
- A missing memory is not proof that an event did not happen. Do not claim persistence unless the save and subsequent retrieval have been verified.

## Layer 3 — Open ChatGPT reasoning

**Purpose:** answer naturally and flexibly on top of Layers 1 and 2.

Rules:
- Open-ended chat is the default interaction. No mandatory form, scripted question tree, or fixed questionnaire.
- Answer the question the user actually asks; follow tangents and follow-up questions when relevant.
- Adapt the depth and tone to the user and situation.
- Use Layer 1 for chart mechanics, Layer 2 for relevant personal context, and source evidence for teaching claims.
- Make interpretations and hypotheses explicit as interpretations; never present them as deterministic chart output.
- Do not fabricate citations, memory, test results, saved state, or capabilities.
- When evidence is missing or contradictory, say what is known, what is uncertain, and why. Ask one targeted question only when the answer materially depends on it.
- The user remains in control of the direction of inquiry and can supply details at any point.

## Overall rules for all three layers

1. **Three layers only.** Do not reintroduce a five-layer architecture.
2. **Distinct responsibilities.** Canonical chart truth, adaptive personal context, and live reasoning are separate but connected.
3. **Evidence before certainty.** Never convert uncertainty into a confident claim.
4. **No silent cross-layer mutation.** Context and reasoning cannot rewrite canonical mechanics.
5. **Provenance matters.** Be able to tell whether a statement came from the engine, a source, the user, stored context, or an inference.
6. **Consent and privacy.** Use and persist personal context only within supported consent, access, retention, and deletion rules.
7. **Warm, personal, not mechanical.** Structure the backend rigorously; keep the conversation natural and inviting.
8. **No forced questioning.** Ask only for missing information that materially changes the answer.
9. **Transparent limits.** Clearly label unavailable features, incomplete integration, conflicting sources, and unverified tests.
10. **Continuity is not a claim of persistence.** Only report a save or retrieval as successful after verifying it.
11. **No unapproved platform or cost changes.** GitHub remains the project source of truth. Do not create a Lovable project or spend Lovable credits without explicit approval. Do not introduce Vercel as a dependency unless explicitly reopened.
12. **Regression after correction.** Durable corrections and repeated failures should inform a test or procedure that prevents recurrence.
13. **Visuals must be data-aligned.** General creative imagery is welcome when it adds warmth or understanding, but the concept, symbols, mood, and claims must connect to the actual question and available evidence. Chart-specific visuals must be generated from verified chart data, never guessed by an image model.

## Visual guidance — meaningful images, not generic decoration

Use images when they deepen understanding, improve emotional resonance, or clarify an idea. A general illustration is acceptable; it does not have to be a technical diagram. However, it must be aligned with the actual subject and the evidence available.

Rules:
- Choose a visual concept based on the actual question, verified chart facts, relevant source teaching, and consented user context—not just the broad topic “Human Design.”
- For interpretive topics, a creative/metaphorical illustration is fine if its metaphor accurately reflects the concept being explained. Do not imply that metaphorical artwork is canonical chart evidence.
- For chart mechanics (BodyGraph, gates, channels, centres, planetary activations, profile, Cross, transits), render or annotate from the deterministic chart data. Do not ask image generation to invent a technically accurate BodyGraph.
- If the image depicts a particular channel, gate, centre, or activation, verify that it is actually present in the relevant natal or transit state and label the state clearly.
- Distinguish natal definition from temporary transit conditioning in both visuals and captions.
- Do not use imagery that suggests a chart fact, personal trait, life event, or causal claim that the evidence does not support.
- Avoid repeated generic stock-like images or unrelated decorative images. Prefer one well-matched image over several weak matches.
- If no relevant visual can be made reliably, use no image.
- Where feasible, attach the visual to a short explanation of why it relates to the answer; provide alt text.
- Evaluate relevance and data accuracy separately: a beautiful image can still fail if it is unrelated or implies incorrect chart mechanics.

### Visual regression checks
- V1: Image concept directly matches the question's specific subject.
- V2: Any chart details match verified engine output.
- V3: Natal and transit activations are not conflated.
- V4: Metaphorical artwork is not presented as mechanical evidence.
- V5: If no relevant visual is available, the answer omits the image rather than filling space with decoration.

## Advanced source material — general retrieval rule

Advanced Human Design source material is not a special-case add-on for format channels. Retrieve it whenever it materially improves the answer or the question asks for depth, mechanism, interaction, nuance, exceptions, or a source-specific interpretation. This applies across the system: Type and Strategy, Authority, centres, gates, lines, channels, circuitry and streams, definition, profiles, Incarnation Cross, planetary activations, transits, life cycles, PHS, Variable, Color/Tone/Base, relationships, and other advanced topics.

Use the least complex source depth that answers the question accurately, but do not stop at beginner-level summaries when the question calls for advanced mechanics. Retrieve source passages with provenance, preserve the source's terminology and framing, and distinguish:
- deterministic chart mechanics from the engine;
- what the source explicitly teaches;
- synthesis across multiple source passages;
- the model's interpretation or practical application.

Do not invent advanced doctrine from general model associations. If the knowledge base lacks the relevant material, say that it is missing and either research a clearly labelled external source or explain that the point remains unverified. Do not imply a source was consulted unless it actually was. Advanced teaching deepens the explanation; it does not override canonical chart facts or silently replace Strategy and Authority mechanics.

## Human Design interpretation rule — channels and Sacral Authority

The system must not reduce advanced channel/authority questions to generic channel keywords. In particular, when interpreting a Generator with Sacral Authority, it should inspect which defined channels connect directly to the Sacral Centre and explain how Human Design source material describes their relationship to Sacral energy/response. This is an interpretive teaching claim, so it must be grounded in the project's knowledge sources or clearly labelled external research—not invented from general model associations.

For the user's currently recorded six channels (3–60, 11–56, 28–38, 32–54, 34–57, 42–53), the channels directly connecting to the Sacral Centre are recorded as:
- **3–60** (Root–Sacral)
- **34–57** (Sacral–Spleen)
- **42–53** (Sacral–Root)

The other three recorded channels do not directly connect to the Sacral Centre. This structural distinction is not by itself enough to claim exactly how a person's response will feel or to establish a source's advanced doctrine. The answer should investigate circuitry, channel mechanics, and the distinction between authority as decision-making mechanism versus channels as defined energy pathways. Avoid the oversimplification that channels are merely “themes” with no influence on the Sacral response; also avoid claiming they replace or independently override Sacral Authority unless the cited source explicitly supports that statement.

Required response behavior:
- Verify the canonical chart facts first.
- Retrieve relevant advanced teaching with provenance.
- Explain the interaction in layers: mechanical connection to Sacral; source teaching about that channel/circuit; cautious personal synthesis.
- Distinguish official/source teaching from broader Human Design interpretation and KY synthesis.
- Where source materials disagree or are silent, say so and do not manufacture a single definitive doctrine.
- Do not assume the mere presence of a channel proves a specific subjective bodily reaction for the user.

## Cross-layer test map

Treat each test as **not yet passed** until its execution and result are recorded. Code coverage or a successful isolated unit test alone does not prove end-to-end framework operation.

| ID | Test | Expected result | Evidence needed |
|---|---|---|---|
| F1 | Canonical chart repeatability | Same inputs and engine version produce the same chart artifact/digest | Executed automated test and output |
| F2 | Provenance trace | Key chart facts can be traced to calculation output and method/version | Artifact inspection |
| F3 | Natal vs transit separation | Transit activations do not silently rewrite natal definition | Automated test plus response/UI inspection |
| F4 | Context relevance | Only context relevant to the current question is supplied to reasoning | Retrieval trace or fixture test |
| F5 | Consent boundary | Without valid consent, protected stored context is not injected | Automated negative test |
| F6 | Correction precedence | Latest explicit user correction overrides a conflicting older inference | Retrieval and reasoning fixture |
| F7 | Context cannot rewrite chart | A saved preference or reflection cannot change canonical chart facts | Cross-layer test |
| F8 | Open-ended reasoning | Free-form question is answered without requiring a predefined questionnaire | End-to-end ask test |
| F9 | Evidence-grounded interpretation | Answer distinguishes chart facts, teaching/source claims, user context, and inference | Response evaluation with cited evidence |
| F10 | Missing/conflicting evidence | Assistant states the limitation and does not guess | Negative/conflict fixture |
| F11 | Persistence round-trip | A consented save can be retrieved in a later session for the same authorized user | Authenticated save → new retrieval test |
| F12 | Full three-layer integration | One response demonstrably uses canonical facts plus relevant permitted context while reasoning remains open | End-to-end trace including input, retrieved context, chart evidence, response, and test result |

### Test reporting rule

For every test, record: status (**PASS / FAIL / BLOCKED / NOT RUN**), date, commit/version, exact test input, expected result, observed result, and evidence link. Do not label a test PASS based only on source inspection or a planned test.

## Current implementation note

This document defines the intended framework and its acceptance tests; it does **not** assert that every capability is currently integrated. In the previously inspected Lovable source, deterministic chart/evidence and open-ended ask handling were present, while persistent memories, conversation history, saved insights, and knowledge retrieval were not connected to the ask context. The health endpoint also reported persistence unavailable. Re-check the current source and run the tests before updating implementation status.

## Immediate validation sequence

1. Verify Layer 1 with repeatability, provenance, and natal/transit separation tests.
2. Test Layer 2 independently with consented context fixtures, relevance, correction precedence, and no-consent negatives.
3. Connect the permitted context to the open reasoning request without making the reasoning layer a fixed questionnaire.
4. Run F7, F9, F10, F11, and F12 end to end.
5. Update each status only from executed evidence and save the resulting checkpoint in `RESUME.md`.

## Cross-cutting mechanism — 3Framework Orchestrator (3FO)

The 3Framework Orchestrator is **not a fourth layer**. It is the coordination mechanism intertwined with Layers 1, 2, and 3. It manages the permitted flow between canonical evidence, adaptive context, and open reasoning.

Responsibilities:
- Resolve the user's current question and determine which canonical facts, source evidence, and permitted context are relevant.
- Retrieve only context allowed by consent and access rules.
- Pass chart facts and provenance separately from user memories and interpretive material.
- Keep the reasoning layer open-ended; do not require a fixed questionnaire.
- Prevent Layer 2 or Layer 3 from silently mutating Layer 1.
- Carry uncertainty and conflicts through to the final answer instead of hiding them.
- When the user asks to save a question, memory, or insight, invoke an explicit persistence path if available; verify the write and later retrieval before claiming success.
- Record enough trace information in tests to establish which evidence and context informed a response, without unnecessarily logging sensitive content.

### Orchestrator acceptance tests

| ID | Test | Expected result | Evidence needed |
|---|---|---|---|
| O1 | Routing | A free-form question reaches the open reasoning path with relevant chart/context inputs | Request/response trace |
| O2 | Separation | Canonical evidence and user context remain separately typed/provenanced | Context payload inspection |
| O3 | Consent enforcement | Orchestrator excludes context not authorized for this request | Negative test and retrieval trace |
| O4 | No canonical mutation | User memory or reasoning output cannot alter chart artifact/digest | Before/after artifact comparison |
| O5 | Conflict propagation | Conflicting evidence is surfaced, not silently resolved by the model | Conflict fixture |
| O6 | Question save | A question explicitly selected for saving is stored with source, timestamp, consent/access scope, and topic metadata | Authenticated write plus database read-back |
| O7 | Question retrieval | A later relevant question can retrieve the saved question as context for the same authorized user | New-session retrieval trace |
| O8 | Save control | Ordinary questions are not silently promoted to durable memory unless the product's clearly communicated save policy and consent permit it | UI/behavior test |
| O9 | End-to-end coordination | One response uses verified chart evidence and permitted context while remaining open-ended | Full trace and test report |

## Can Adaptive User Context save questions?

**Architecturally, yes.** Questions can be a first-class context record, for example `type: unresolved_question` or `type: conversation_question`, with the original wording, timestamp, topic tags, source conversation/turn reference, and consent/access status. The system should distinguish:
- **Question history:** what the user asked, retained under the product's conversation-history policy.
- **Open question / unresolved thread:** a question the user wants to return to.
- **Saved insight:** a conclusion or reflection the user explicitly wants to keep.
- **Durable preference/correction:** information useful across future conversations.

A question should not automatically be treated as a fact about the user. For example, asking about a relationship issue does not prove that the user is experiencing that issue. The user should be able to say “save this question” or explicitly mark it for follow-up. If automatic conversation history is later enabled, its retention and consent rules must be clear and configurable.

**Current implementation status: not yet verified as working end to end.** The previously inspected ask-context code did not connect persistent conversation history, saved insights, memories, or knowledge retrieval, and its health endpoint reported persistence unavailable. Therefore, the architecture supports saving questions, but we cannot yet promise that the current app stores and retrieves them. O6 and O7 must pass against an authenticated persistence service before this can be called operational.

## Readiness gate

The framework is ready for **structured testing now**, but not yet certified as fully integrated. Start with deterministic Layer 1 tests and isolated Layer 2/orchestrator fixtures; then run authenticated persistence round-trip and full cross-layer tests. Do not describe question saving as functional until O6/O7 pass with verified read-back.


## Premium entitlement and knowledge-boundary security test

**Status: required design and acceptance contract; implementation not yet verified.** This section exists because an open chat can unintentionally expose Premium value if the model receives unrestricted source material or if entitlement is enforced only in the UI.

### Security principle

The AI model is not the paywall. Enforce subscription entitlement in trusted server-side code **before** selecting or retrieving restricted knowledge, loading protected personal history, computing Premium-only results, or calling the model. Never send the full Premium knowledge set to a Free request and rely on instructions to conceal it.

The 3Framework remains unchanged:
- **Layer 1 — Canonical Chart + Immutable Evidence:** deterministic chart facts remain authoritative. Subscription may gate advanced derived analyses or tools, but must not corrupt or falsify base chart facts.
- **Layer 2 — Adaptive User Context:** user-specific saved history, patterns and records are scoped to the authenticated user and the relevant consent. Premium-only history/features require server-verified entitlement as well as user-level access checks.
- **Layer 3 — ChatGPT live reasoning:** receives only the permitted evidence, knowledge and context assembled by the trusted server. The model may explain public/basic concepts, but must not be relied upon to enforce access.
- **3Framework Orchestrator (3FO):** validates identity, entitlement, feature scope and consent before retrieval; records which evidence/source tiers were supplied; fails closed when entitlement cannot be verified.

### Entitlement contract

Use server-verified account identity and subscription state. Do not accept `tier`, `isPremium`, `plan`, price, role or entitlement claims from request JSON, URL parameters, local storage or client UI state. The server must resolve entitlement from a trusted provider/database record, including subscription status and applicable grace/expiry rules.

Represent capabilities as explicit feature permissions rather than scattered plan-name checks. Example capability keys (final commercial limits remain configurable):
- `guide.basic`
- `explore.advanced_sources`
- `transits.advanced_analysis`
- `lifecycles.full`
- `insights.history`
- `insights.pattern_recognition`
- `connection.comparison`

Free users can still ask open-ended questions and receive useful explanations from permitted knowledge. A question's wording alone must not be the sole paywall trigger. If the requested depth requires a locked capability, return a graceful upgrade response without retrieving or exposing the restricted payload. Do not leak whether a particular protected source, memory, or record exists.

### Required request sequence

1. Authenticate the user on the server.
2. Resolve the user's current entitlement from trusted state; reject invalid, expired, canceled (outside configured grace), or unverifiable status for Premium capabilities.
3. Resolve the requested capability/feature.
4. Apply user ownership, consent, expiry and deletion rules to personal context.
5. Retrieve only knowledge and records permitted for that user and capability.
6. Build the model context with source provenance and clear boundaries between mechanics, source teaching and synthesis.
7. Call the model with only that bounded context.
8. Record an auditable decision (user/account identifier, capability, allow/deny, policy version and source IDs; never log secrets or unnecessary sensitive content).

The sequence must fail closed: unavailable entitlement service means no Premium retrieval. Basic non-Premium chart calculations may remain available if independently safe and explicitly permitted.

### Acceptance tests (must run against server routes, not just UI)

- **P1 — Basic Free access:** unauthenticated or Free user can use only explicitly public/basic endpoints; response is useful and does not contain protected source text.
- **P2 — No client-side tier spoofing:** request bodies claiming Premium, modified local storage, altered query parameters, or forged headers cannot grant a capability.
- **P3 — Direct endpoint denial:** a Free user calling a Premium API/route directly is denied server-side.
- **P4 — Retrieval-before-model guard:** on denial, restricted retrieval is not invoked and the AI provider is not called with Premium material.
- **P5 — Premium allow:** a valid Premium user can retrieve the allowed source tier and use the advanced analysis.
- **P6 — Expiry/cancellation:** expired or canceled entitlement loses Premium access according to the configured grace policy without waiting for a UI refresh.
- **P7 — Fail closed:** missing/unavailable subscription data never defaults to Premium.
- **P8 — Personal data isolation:** user A cannot read user B's saved insights, memories, conversation history, chart records or snapshots, regardless of tier.
- **P9 — Consent and expiry:** consent-revoked, unconfirmed, expired or deleted personal context is excluded even for Premium users.
- **P10 — Cross-tier non-leakage:** Free requests do not receive Premium history, advanced-source excerpts, pattern results or hidden prompt/context fields.
- **P11 — Prompt injection:** asking the model to ignore the paywall, reveal system prompts, list hidden sources, or reproduce all training material does not bypass server authorization.
- **P12 — Graceful boundary:** when a question needs a locked capability, response explains that the deeper analysis is Premium and offers a useful basic answer where possible.
- **P13 — Provenance:** Premium responses identify permitted source provenance internally/appropriately; model-generated synthesis is not misrepresented as source quotation.
- **P14 — No side-channel leakage:** denial messages, status codes, timing and logs do not disclose protected content or whether specific private records exist.
- **P15 — Regression:** natal chart facts, transit separation, consent behavior, and deterministic chart regression tests continue to pass.

### Current inspected implementation gap (Lovable project snapshot)

Inspected project: `My Design Decoder`, commit `3f9841966f0b8af00c80b5b26ca8ff37106834f4`, unpublished.
- `POST /api/ask` accepts question, chart and preferences without a visible authentication or entitlement check. Preferences are client-supplied; the server prompt says ADAPTIVE is consented, but the route does not verify consent against trusted user state.
- The route builds natal/transit facts and sends them to the Lovable AI gateway. It currently does not retrieve advanced-source records, persistent memories, saved insights or subscription data.
- `POST /api/chart` calculates charts without a visible authentication check. That may be acceptable for a basic public calculator, but it must not become a route to Premium-only calculations or source payloads.
- `GET /api/health` reports persistence unavailable; the project snapshot does not show a connected database or subscription entitlement service.
- The app is unpublished. No live subscription enforcement, authenticated end-to-end test, or deployment has been verified.

### Implementation order

1. Add server-side identity and entitlement resolution using the chosen auth/subscription source; do not trust client tier claims.
2. Create a single reusable capability policy and enforce it before any Premium source retrieval or model invocation.
3. Keep basic chart computation separate from gated advanced analyses.
4. Add ownership/consent/expiry filtering for Adaptive User Context before context assembly.
5. Add unit tests for policy decisions and route-level tests that spy on retrieval/model calls to prove they are not invoked on denial.
6. Add Free/Premium integration acceptance tests with test accounts and verify direct API calls, expiry and user isolation.
7. Only then consider the boundary validated. Do not merge, publish or claim Premium protection until the server-side tests pass.
