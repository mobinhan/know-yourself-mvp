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
