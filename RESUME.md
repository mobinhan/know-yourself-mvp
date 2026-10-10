# Know Yourself — Resume State

Last updated: 2026-10-10

## Purpose
This file is the canonical continuity checkpoint for the Know Yourself (KY) project. When the user says **“Resume KY”** or **“save mcp”**, recover this file first, inspect the live GitHub state, and continue from the latest verified checkpoint. Do not rely on conversation summaries alone when repository verification is available.

## Confirmed architecture: 3framework
1. **Canonical Chart + Immutable Evidence** — deterministic chart mechanics and source evidence are the authoritative foundation. Do not invent chart facts or silently substitute unsupported interpretations.
2. **Adaptive User Context** — retain relevant personal context, prior questions, preferences, and saved insight history separately from canonical chart mechanics and source evidence.
3. **ChatGPT live reasoning layer** — reason directly on top of the first two layers, adapting explanations to the user's question and context. Do not turn this into an unnecessary five-layer architecture.

Keep mechanics, source teaching, and reflective synthesis distinguishable. If evidence is missing or conflicting, state that clearly rather than guessing.

## Product decisions to preserve
- Product: Know Yourself, an AI-powered Human Design companion.
- My Chart is the primary personal chart experience; Chart Library is secondary.
- Main experience: Foundation, Characteristics, Current Experience, Journey, and Connection.
- Natal definition must remain separate from temporary transit activations.
- Confirmed natal chart used for the user's Golden Chart #2: 15 April 1982, Baarn, Netherlands, 07:38.
- Confirmed natal channels: 3–60, 11–56, 28–38, 32–54, 34–57, and 42–53.
- Do not infer authority or chart facts without validating the deterministic chart output. Previous chart-reading mistakes make explicit verification important.
- Swiss Ephemeris remains an allowed calculation option; do not remove it without approval.
- PHS and RP are in scope. Gene Keys are deferred.
- Keep the experience warm, personal, clear, and inviting rather than mechanical.
- Avoid asking the user to manually code when a safe tool-driven path is available.
- Do not create a Lovable project or spend Lovable credits without explicit approval.
- Do not use Vercel as a development/deployment dependency unless the user explicitly reopens that decision. Do not add new Vercel work by default.
- Never commit API keys, credentials, or secrets.

## Repository
- Repository: https://github.com/mobinhan/know-yourself-mvp
- Main branch: `main`
- README currently describes the website artifact as V22. Confirm the actual branch/deployment version before relying on version labels.
- Existing branches observed on 2026-10-10:
  - `main`
  - `fix/my-chart-inline-handler`
  - `feature/live-api-v1`

## Current verified checkpoint (2026-10-10)
- The repository and README were accessible through GitHub MCP.
- `RESUME.md` did not exist when checked; this file is being added to close that continuity gap.
- Main branch `index.html` was inspected. It contains inline navigation handlers such as `onclick="go('chart')"`.
- Open PR #2: https://github.com/mobinhan/know-yourself-mvp/pull/2
  - Title: “Fix My Chart inline JavaScript syntax”
  - Its description says the fix escapes the `chart` argument in inline `onclick` attributes.
  - Do not assume it is merged or that the deployed app works until the PR state, CI, preview, and navigation are verified.
- Open draft PR #1: https://github.com/mobinhan/know-yourself-mvp/pull/1
  - Gate 57.4 evidence retrieval safeguards and regression tests.
  - Keep as draft; do not merge until focused tests pass and changes are reviewed.
- The user reported that the app opened but My Chart/navigation did not behave as expected. This remains the immediate validation priority.
- CI status and production deployment health have not yet been independently verified in this checkpoint.
- Earlier discussions described Steps 1 and 2 as completed and Step 3 as Canonical Data Contracts; validate repository evidence before declaring any step complete. Continue the agreed workflow rather than restarting it.

## Next actions
1. Read this file and inspect current GitHub state before acting.
2. Check PR #2 state, diff, CI checks, and preview. Verify the fix on the preview before any merge.
3. Confirm My Chart navigation and chart rendering; then check birth-data form and Explore/Ask navigation.
4. Inspect PR #1's focused Gate 57.4 regression tests separately. Keep it draft until tests pass and review is complete.
5. Resume the 3framework work from the last verified repository state. Do not reintroduce a five-layer architecture.
6. Update this file whenever a major milestone, architecture decision, verified test result, or blocker changes. Include commit/PR references and clearly distinguish verified facts from assumptions.

## Continuity protocol
When asked to “Resume KY”:
- Read `RESUME.md` first.
- Verify current branch heads, open PRs, latest commits, and relevant CI before deciding the next step.
- Compare live repository state with this checkpoint; live verified repository state wins if this file is stale.
- Report only the current blocker and next action; avoid making the user repeat established decisions.
- Proceed autonomously on reversible, low-risk work. Pause for major architectural, commercial, licensing, data-loss, or irreversible decisions.
- Never claim that a change was committed, pushed, merged, deployed, or tested unless the tool result verifies it.

## Correction, repetition, and autosave protocol
Treat a user correction, a confirmed assistant mistake, or a repeated failure/repetition as a signal to update the working method—not merely to apologize and continue.

When the user points out that an answer or action is wrong:
1. Stop repeating the disputed claim or action.
2. Acknowledge the specific error plainly; do not defend an unverified assumption.
3. Re-check the relevant source of truth (live repository, code, test result, chart-engine output, or cited evidence).
4. Correct the result and, where feasible, add a focused regression check or change the procedure that allowed the mistake.
5. If the correction changes durable project facts, an agreed decision, a workflow rule, a known failure mode, or a future recovery step, update this checkpoint and commit/push the update to GitHub, then fetch it back to verify the remote state.
6. Report exactly what was corrected, what was saved, and what remains unverified.

When the same issue, question, or work is repeated:
- First check whether it was already completed, decided, or attempted; do not restart from scratch without a reason.
- Record the cause and prevention rule when a repeated failure reveals a process gap.
- Autosave meaningful lessons and state changes; do not create noisy commits for inconsequential wording or transient discussion.

Autosave trigger examples:
- The user says the assistant is wrong or identifies a factual/technical mistake.
- The assistant discovers its own earlier claim was wrong.
- A workflow, build, test, navigation, or recovery attempt fails repeatedly.
- The user has to repeat a decision, preference, instruction, or correction because it was not retained.
- A project decision, completed milestone, blocker, or next action materially changes.

Important limitation: this file records the required protocol; it does not itself execute tools automatically. In each session, follow the protocol when GitHub tools are available, and never claim a remote save until the commit and fetched remote content confirm it.


## Persistent cross-session continuity retrieval — implementation in review (2026-10-10)
- Inspected the live Supabase project and existing `user-data-api`; persistent profile/preferences, conversations/turns, governed user memories, and saved insights already exist, so this increment reuses them rather than adding duplicate tables.
- Added `supabase/continuity-context.mjs`, a pure context assembler, and `supabase/test_continuity_context.mjs` covering preference gates, consent/confirmation/expiry, personal-context setting, bounded turns, and separation from chart truth.
- Added authenticated `GET /functions/v1/user-data-api/continuity`: returns up to 3 active conversations with up to 6 latest turns each, plus up to 50 eligible memories and 5 saved insights when personalization is enabled. The endpoint is user-scoped and uses the existing caller JWT.
- Added the continuity contract test to GitHub Actions and assertions to the existing user-data API security contract.
- No schema changes or production Edge Function deployment were made. This is a proposed repository change; CI, PR review, and authenticated end-to-end verification remain required. The current endpoint uses recency-bounded retrieval, not semantic relevance ranking. The live LLM and frontend integration remain separate outstanding work.


## Live-use integration blocker (2026-10-10)
- Inspected the actual `index.html` on this branch: its `sendAsk()` function constructs client-side canned responses and calls `/v1/charts/.../questions/context`. The page does not currently authenticate with Supabase and does not call the new `/continuity` endpoint.
- Therefore, continuity retrieval is implemented as a backend capability proposal, but it is **not yet active in the app's real-life conversations**. Do not claim otherwise.
- Next: trace the existing `/v1` backend and its authentication/session model, then integrate continuity into the real answer path while preserving guest exploration and the 3framework. Do not put API secrets in browser code, bypass canonical chart/evidence contracts, or deploy before the actual runtime path is verified.

## Major operating decision: ChatGPT-first framework validation (2026-10-10)
- **Decision confirmed by the user:** continue testing and refining the 3framework directly inside ChatGPT before connecting Know Yourself to external sources or activating external continuity integration.
- The purpose of this stage is to establish sufficient confidence through natural, real-life conversations before adding integration complexity. There is no deployment or external-connection deadline implied by this decision.
- Keep the agreed 3framework unchanged:
  1. **Canonical Chart + Immutable Evidence** — deterministic mechanics and verified source evidence remain authoritative.
  2. **Adaptive User Context** — relevant personal context and user-confirmed learning inform interpretation without silently changing canonical facts.
  3. **ChatGPT live reasoning** — ChatGPT reasons directly from Layers 1 and 2. Do not add a separate reasoning/critic layer or drift into the 5framework.
- During ChatGPT testing, evaluate separately: (a) chart/evidence accuracy, (b) correct and restrained use of personal context, (c) relevance and usefulness of interpretation, (d) warm, natural, personal communication, (e) retention of corrections, and (f) clear handling of uncertainty.
- A compelling interpretation is not proof of correct chart mechanics. Keep factual accuracy and interpretive usefulness as separate evaluation dimensions. User feedback can correct interpretation and context; canonical mechanics change only after evidence-based verification and the established correction safeguards.
- The user will use ChatGPT naturally and observe how it behaves in real life; no rigid test script is required. Capture meaningful corrections and recurring failure patterns in the project checkpoint and add regression checks where appropriate.
- **External integration is deliberately deferred** until the user is satisfied with the framework. Do not connect external sources, deploy the continuity endpoint, or spend Lovable credits during this validation stage without a new explicit decision.
- Current status: this is an operating decision for the ChatGPT validation stage, not a claim that external continuity is integrated or that the repository/app has been deployed. The continuity PR remains review-only until the user later decides to proceed.

## Confirmed operating rule: continuous autonomous execution (2026-10-10)
- **User confirmed:** routine, reversible technical decisions should be handled autonomously so work proceeds continuously; do not make the user manage ordinary branch, file, test, or implementation steps.
- Default workflow: investigate existing state first; choose a safe implementation path; make reversible changes; run relevant checks; update the checkpoint for meaningful milestones/decisions; commit to the appropriate development branch; fetch the remote state to verify; report what is verified and what remains blocked.
- Interrupt the user only for genuinely material decisions: architecture changes; unsupported changes to canonical chart mechanics; consequential privacy, security, licensing, or financial choices; irreversible/data-loss actions; unreviewed merges or other changes with meaningful risk; or a genuine product-direction choice that cannot be resolved from existing decisions.
- Autonomy does not mean skipping review or claiming success without evidence. Keep risky or unverified code out of main; do not merge or deploy merely to make progress appear faster. A commit, merge, and deployment are distinct states and must be reported accurately.
- GitHub is the recovery/source-of-truth record. Save meaningful project decisions without waiting for the user to say “Save MCP”; verify the exact remote file/commit after each save. State clearly whether the update is on a feature branch or in main.
- Continue to respect the current ChatGPT-first validation decision: test the 3framework naturally inside ChatGPT until the user is satisfied. External-source integration and deployment remain deferred, and no Lovable credits or project creation without explicit permission.
- This rule reduces interruptions, not safeguards: preserve the 3framework and its evidence/context boundaries; the user focuses on product experience and real-life feedback while routine engineering execution proceeds autonomously.

## ChatGPT-first validation log — Gate 57 / Channel 34–57 (2026-10-10)
- Started the first structured live-reasoning test using the user's confirmed Golden Chart #2 and the previously recorded fact that Personality Saturn is in Gate 57.4. The user's confirmed natal Channel 34–57 and Generator / Sacral Authority must remain distinct from Gate 57's general splenic-awareness themes; do not infer Splenic Authority from this gate/channel.
- Source check: the Complete Rave I'Ching page for Gate 57 identifies the gate with intuitive insight in the now, the Spleen, fear of tomorrow, and Channel 34/57 as Power. Its 57.4 entry is titled “The director” and describes mastery of relationships through clarity, maximizing productivity, and sensitivity to interrelationships for harmony; the detriment is becoming dictatorial rather than directorial. Secondary reference: HumDes Gate 57 page corroborates the gate's center and channel links.
- Important guardrail from the previous test: do not reduce 57.4 to a generic claim such as “intuition through relationships.” Keep source teaching, gate mechanics, line-specific nuance, the user's actual planetary activation, and personalized synthesis clearly separated. Avoid asserting that the user behaves in a particular way unless the user confirms it.
- First test status: source-grounded interpretation initiated; no user feedback on this specific retest recorded yet. Next step is to test the interpretation against the user's lived experience, then inspect verified planetary/line activation details before extending the reading. This log records the test process, not proof that the framework is already validated.

### Gate 57 real-life feedback — initial self-report (2026-10-10)
- User reports recognizing Gate 57 in daily life across all four exploratory prompts: (1) intuitive awareness before being able to explain it, (2) sensing danger or that something feels wrong, (3) sensing what to do next, and (4) reading people or situational dynamics.
- Treat this as user-reported lived experience and useful personalization context, not independent proof that Human Design mechanics are objectively predictive or that every intuition is accurate.
- Next validation step: invite one concrete recent example, then examine what was sensed, what evidence was available at the time, what happened afterward, and how the user interpreted it. Preserve uncertainty and avoid retrospective confirmation bias; do not turn the report into a permanent canonical chart fact.

## 3framework guardrail: keep validation natural (2026-10-10)
- User correctly identified that over-structuring the Gate 57 conversation risks recreating the rejected 5framework.
- Keep the approved three layers only: Canonical Chart + Immutable Evidence; Adaptive User Context; ChatGPT live reasoning directly on top of Layers 1 and 2.
- Do not turn ordinary conversation into a user-facing test harness or require the user to answer repeated evaluation questions. Quality checks and uncertainty handling remain within live reasoning and unobtrusive development practice, not a new framework layer.
- Respond naturally to what the user shares. The user's report that all four Gate 57 themes resonate is useful self-reported context, not proof of chart mechanics or a requirement for further questioning. Let the user steer the depth.

## Real-life validation mode (2026-10-10)
- User confirmed the next stage: continue testing the approved 3framework inside ChatGPT with the user as the first real-life end user.
- Use natural conversation, not a scripted questionnaire. Apply chart evidence and personal context only when relevant; keep responses warm, useful, and direct.
- Do not force Human Design into unrelated questions or repeatedly ask for test examples. Learn from spontaneous feedback and corrections.
- Assess accuracy, relevance, warmth, continuity, and uncertainty handling in the background. Subjective resonance alone does not prove chart mechanics.
- External integration and deployment remain deferred until the user is satisfied. Keep the 3framework and autonomous execution rule unchanged.

## Misconception prevention rule (2026-10-10)
- When the user says they are testing the 3framework, interpret this as evaluating its performance through live ChatGPT interaction, not as asking to configure automatic activation or explain project settings.
- Before responding to a correction or short follow-up, use the immediate conversational context to identify the user's underlying intent. Do not over-literalize one phrase or pivot to an adjacent technical topic.
- If the intended meaning is clear from context, acknowledge it and act on it. Ask a clarifying question only if genuinely ambiguous. Do not make the user repeat established project decisions.
- After a misunderstanding, name the specific reasoning error, adjust the approach, and continue the original task. Record recurring project-level lessons in this checkpoint.

## Short command for ChatGPT framework testing (2026-10-10)
- User's short phrase to resume the current validation activity: **“Test 3framework.”**
- Interpret this as: continue testing the approved three-layer framework through natural ChatGPT conversation; use the available chart/evidence and relevant personal context; assess quality unobtrusively; do not create a scripted questionnaire, re-explain the framework, or imply external integration is active.
- This is a conversational shortcut, not a technical switch that changes ChatGPT settings or activates the external app.


## 3framework test finding — repeated mechanical uncertainty disclaimer (2026-10-10)

- User identified that the assistant again used wording such as “I don't have a verified Gate 57 activation on this side of your chart,” despite an existing instruction to avoid mechanical/defensive disclaimers and integrate uncertainty naturally.
- Root cause: the assistant retrieved the preference as context but failed to apply it as a response-generation constraint. It defaulted to generic cautious phrasing rather than first using available context/evidence, answering directly, and expressing any genuine uncertainty briefly and naturally. It then repeated the same failure by reintroducing a disclaimer while apologizing.
- Prevention rule: do not use database-style “I don't have verified…” caveats in ordinary Human Design conversation. First answer the user's actual question from established chart records. If a material detail truly cannot be established, say so in one natural, concise sentence only when it changes the answer; do not append a defensive qualification after an otherwise confident answer. Never claim chart details are independently verified unless the canonical evidence has actually been checked.
- Testing implication: assess whether prior corrections change the actual response behavior, not merely whether the assistant can repeat the rule. Acknowledging a preference is not compliance; the next answer must demonstrate it.


## 3framework response behaviour protocol — enforce corrections in output (2026-10-10)

Apply this protocol during every natural 3framework conversation, especially after user corrections:

1. **Answer first.** Identify the user's actual question and respond directly before discussing uncertainty, process, or limitations.
2. **Use known context before disclaiming.** Check established chart facts and user corrections already present in conversation/project context. Do not ask the user to repeat them.
3. **Uncertainty must be specific and useful.** Mention uncertainty only if it materially changes the answer. State the precise unknown naturally and briefly; never use generic database-style phrases such as “I don't have a verified…” as filler or as a defensive tail to a confident answer.
4. **Do not invent verification.** A remembered chart detail may be used as a previously recorded detail, but call it canonically verified only after checking the canonical chart/evidence source. When that source is unavailable, distinguish recorded context from checked evidence without making the conversation mechanical.
5. **Make corrections behavioural.** After a user flags a response pattern, apply the correction immediately in the next answer. Do not merely acknowledge it, explain it, or repeat the unwanted pattern inside the apology.
6. **Keep the experience natural.** No unsolicited test scripts, checklists, or framework lectures. Reason from Layer 1 (canonical chart/evidence) and Layer 2 (relevant adaptive user context) directly in the live answer; Layer 3 is the response, not a separate user-facing process.
7. **Self-check before sending.** Ask internally: Did I answer the question? Did I reuse known context? Did I add a generic caveat? Am I claiming a verification I did not perform? Did I repeat a correction the user has already made? Revise before sending if any answer is yes in the wrong direction.
8. **Evaluate outcomes, not acknowledgements.** A correction is considered implemented only when later answers demonstrate the changed behaviour. If the same error recurs, name the specific failure, update the prevention rule, and continue without making the user manage the process.

Scope: conversational behaviour for ChatGPT-first validation of the approved 3framework. This checkpoint documents the intended response protocol; it does not by itself change ChatGPT's underlying model or guarantee perfect compliance.


## 3framework oversight component and supporting appendices (2026-10-10)

### Architecture decision

Name the cross-cutting oversight component **3Framework Orchestrator (3FO)**.

- The 3FO oversees coordination across the three existing layers: (1) Canonical Chart + Immutable Evidence, (2) Adaptive User Context, and (3) ChatGPT live reasoning.
- **The 3FO is not a fourth layer.** It is a cross-cutting coordination and governance component that makes sure the three layers exchange the right inputs, preserve their authority boundaries, and produce a coherent response.
- Keep specialised capabilities modular and documented as supporting appendices/components, rather than promoting them into new framework layers.
- The orchestrator must not replace ChatGPT's live reasoning with a separate critic or reasoning layer. It supplies context, enforces boundaries, and supports validation; Layer 3 still performs the live reasoning.

### Supporting appendices/components

- **Appendix A — Canonical Evidence & Provenance:** chart facts, calculation source/version, evidence references, and distinction between canonical facts and interpretation.
- **Appendix B — Adaptive Context & Persistent Continuity:** relevant user context, preferences, history, saved insights, retrieval and cross-session continuity.
- **Appendix C — Correction Governance:** record corrections, classify whether they affect user preference, personal context, or canonical mechanics, and ensure corrections are applied without allowing unsupported changes to Layer 1.
- **Appendix D — Response Quality & Regression Tests:** test directness, naturalness, contextual relevance, uncertainty handling, and whether previously corrected failure patterns recur.
- **Appendix E — Privacy, Permissions & Data Lifecycle:** access boundaries, consent, retention, and separation of user-specific context from canonical evidence.

### Orchestration contract

For each answer, the 3FO should:
1. Obtain the relevant canonical evidence from Layer 1.
2. Retrieve only relevant and permitted context from Layer 2.
3. Provide both to Layer 3 for natural, question-specific reasoning.
4. Preserve provenance and uncertainty without inserting generic mechanical disclaimers.
5. Capture eligible user corrections/insights under the governance and privacy rules.
6. Evaluate failures through regression tests and route durable fixes to the appropriate component.

### Implementation status

This is an architecture decision/checkpoint saved in RESUME.md. It does **not** claim that the 3FO is already implemented in runtime code. Next engineering step is to map these responsibilities to existing modules and PR #3/#4, identify duplication and gaps, then implement the smallest cohesive orchestration contract without adding a fourth/fifth framework layer. Do not merge open pull requests without user approval.


## 3Framework Orchestrator prototype added (2026-10-10)
- Added `supabase/threeframework-orchestrator.mjs`: a pure 3FO input-packet builder that keeps Layer 1 canonical evidence separate from Layer 2 user context and defines Layer 3 as the live reasoning destination. It fails closed when required inputs are missing and explicitly states that the orchestrator is not a fourth layer.
- Added `supabase/test_threeframework_orchestrator.mjs`: contract tests for required inputs, layer separation, conflict isolation (user context cannot overwrite chart facts), and the three-layer boundary.
- Added `docs/THREE_FRAMEWORK_ORCHESTRATOR.md` with the purpose, responsibilities, appendices, and integration gates.
- Added the orchestrator contract test to `.github/workflows/step1-engine.yml`.
- Files and workflow edit were fetched back from GitHub and verified on `feature/persistent-continuity-retrieval`. Commit containing the workflow registration: `4aa6ab47359fc12076ceb849aec3223f3cc91568`.
- **Status limitation:** this is a tested-by-contract prototype pending CI execution; it is not yet connected to the live frontend/backend answer-generation path. Do not claim runtime activation until CI and end-to-end integration tests pass. No merge or deployment was performed.
- User's immediate aim is to resume natural 3framework testing in ChatGPT next time; do not turn that into a questionnaire or claim the prototype changes ChatGPT itself. Keep app integration separate from ChatGPT-first validation unless the user changes that decision.
