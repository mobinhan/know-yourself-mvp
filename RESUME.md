# Know Yourself — Resume State

Last updated: 2026-10-12

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

## Current verified checkpoint (2026-10-11 — ephemeris cross-engine audit)

### Audit status
- Draft PR #5: https://github.com/mobinhan/know-yourself-mvp/pull/5
- Title: “Audit Astronomy Engine against Swiss Ephemeris”.
- Audit branch: `audit/astronomy-engine-cross-check`.
- Latest verified audit branch commit: `70a6c959761c822730badcac35f78e39983a7c8f`.
- Main was not changed by the audit work; PR #5 remains open, draft, and unmerged. Do not merge it as part of the audit step.
- GitHub Actions run #38153382385 completed successfully: https://github.com/mobinhan/know-yourself-mvp/actions/runs/38153382385.
- Audit workflow uses the official standalone Astronomy Engine JavaScript source and pinned `pyswisseph==2.10.3.2`; it is isolated from production code.

### Results verified from workflow logs
- Representative timestamp sample: 12 timestamps, 156 position samples.
- Core planetary and derived positions: 132 samples; zero gate/line mismatches in this sample.
- Maximum core longitude difference: approximately 0.0056503°; mean approximately 0.0008343°.
- Lunar-node comparison using the current Astronomy Engine approximation versus Swiss Ephemeris TRUE_NODE: 24 samples; 10 gate/line mismatches; maximum longitude difference approximately 0.30955°; mean approximately 0.16353°.
- Interpretation: tested planetary samples agree closely, but this is not a full equivalence proof. The node comparison is not yet like-for-like and must be resolved separately. Representative timestamps do not replace gate/line boundary testing.

### Next action — resume here
1. Continue the isolated audit on PR #5; do not ask the user to run local scripts.
2. Implement and run targeted boundary-focused tests for gate/line transitions, with clear treatment of exact-boundary rounding.
3. Investigate a like-for-like lunar-node comparison (Astronomy Engine approximation versus Swiss TRUE_NODE) before interpreting node mismatches as a production defect.
4. Keep the audit branch/PR separate from `main`; do not change the app’s calculation engine or make a production decision from the sample-date test alone.
5. Fetch the workflow result/logs and record verified outcomes here after each material milestone.

### Lovable status
- Existing Lovable project “Human Design Navigator” is not published. Workspace reported out of credits when a message/edit was attempted. Do not retry credit-consuming Lovable actions unless credits are available and the user explicitly approves.
- Do not create a new Lovable project. Do not use Vercel as a development/deployment dependency.

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

## Current verified checkpoint (2026-10-12 — boundary/node audit results)

- Draft PR #6: https://github.com/mobinhan/know-yourself-mvp/pull/6
- Branch: `audit/astronomy-boundary-node-checks`, based on the isolated audit branch and targeting that branch—not `main`.
- Latest audit commit: `55b98dbf75a0b01cf1c568033db4957a8c1d783e`.
- GitHub Actions run #38164547902 completed successfully: https://github.com/mobinhan/know-yourself-mvp/actions/runs/38164547902.
- Boundary regression: all 384 gate/line boundaries tested just before, exactly at, and just after (1,152 cases total), including wrap-around; **0 failures**. Exact boundaries belong to the next segment.
- Core planetary/derived positions: 132 samples; **0 gate/line mismatches**; maximum longitude difference approximately 0.0056503°; mean approximately 0.0008343°.
- Lunar node investigation found a sign error in the custom true-node approximation's `sin(2D)` term. Corrected the sign and reran CI. The node comparison is now closer to Swiss Ephemeris TRUE_NODE: 24 samples; 6 gate/line mismatches; maximum longitude difference approximately 0.143958°; mean approximately 0.047615°.
- The approximation is materially closer to TRUE_NODE than MEAN_NODE, supporting that TRUE_NODE is the relevant convention for this comparison. However, the remaining 6/24 gate/line mismatches mean the node implementation is **not validated for production**. This sample-date comparison is diagnostic, not a production equivalence proof. The 12 timestamps still do not replace dedicated boundary-near node dates or comparison against the app's intended canonical convention.
- No production code or calculation-engine decision was changed. PR #6 remains draft and must not be merged automatically.
- CI artifact: `ephemeris-cross-engine-audit`, artifact ID `11710954671`; its summary reports the results above.
- Next: determine whether the Human Design calculation contract requires true or mean lunar node, then validate the chosen convention at gate/line transitions and against trusted reference chart outputs. Keep Swiss Ephemeris available; do not switch engines based on this audit alone.

## Current verified checkpoint (2026-10-12 — Golden Chart #2 node convention research)

- Web research found that public Human Design calculators use both true and mean lunar nodes. Project Me and YourHumanDesign explicitly state that they use the true node; PRISM explicitly uses the mean node and claims a Jovian Archive lineage. Jovian Archive's public methodology pages reviewed describe chart calculation and the role of the nodes but do not specify the true/mean setting.
- Therefore, no universal canonical node convention has been established from the public sources reviewed. Do not treat a secondary site's “most common” claim as conclusive.
- Recomputed Golden Chart #2's node positions with Swiss Ephemeris 2.10.03 at the exact stored UTC instants:
  - Personality, 1982-04-15 05:38 UTC: True North Node 106.978916086° → Gate 53.2; Mean North Node 107.664681968° → Gate 53.3. South Node is correspondingly 54.2 vs 54.3.
  - Design, 1982-01-17 09:06:09.053097 UTC: True North Node 112.427250626° → Gate 62.2; Mean North Node 112.317608992° → Gate 62.2. South Node remains Gate 61.2 under both.
- This means the node convention changes Personality node line/substructure for Golden Chart #2, although this specific comparison does not change the chart's stored channel set.
- Audit report committed and fetched back from isolated PR #6 branch: https://github.com/mobinhan/know-yourself-mvp/blob/audit/astronomy-boundary-node-checks/audit/golden-chart-node-convention.md (commit 3965bd4588beb6a70c7f934f40755447eb862c48). PR #6 remains open and draft; no production engine, Golden Chart fixture, or main-branch calculation code was changed.
- Next acceptance step: obtain a trusted Human Design reference chart for the exact same birth details and inspect its node activations (ideally the underlying activation data, not just the BodyGraph). If the reference doesn't expose enough detail to determine its node convention, keep the convention unresolved. Do not merge PR #6 or switch production engines based on this evidence alone.


## Current verified checkpoint (2026-10-12 — Premium entitlement security)

### Security review
- Inspected the existing unpublished Lovable project **My Design Decoder**, project ID `483abb3e-5e1f-49ef-8e5c-1d1f8df3e207`, commit `3f9841966f0b8af00c80b5b26ca8ff37106834f4`.
- In that snapshot, `POST /api/ask` has no visible authentication or entitlement check, accepts client-supplied preferences, and sends deterministic chart/transit facts plus the question to the Lovable AI gateway. No Premium knowledge retrieval or persistent user-context integration is present in the inspected route.
- `POST /api/chart` has no visible authentication check; keep basic deterministic chart calculation distinct from any Premium-only analysis.
- `GET /api/health` reports persistence unavailable and the project snapshot does not show subscription entitlement integration.
- Project remains unpublished. No live end-to-end entitlement test has been performed.

### Saved security contract
- Expanded `docs/3framework-testing.md` on branch `docs/3framework-testing` with the Premium entitlement/security contract and 15 acceptance tests, commit `d8834543ddb5321e4708f772bcb11a715c3a244f`.
- Documented server-side identity and entitlement resolution, explicit capability permissions, fail-closed behavior, pre-retrieval/pre-model enforcement, personal-data ownership/consent checks, non-leakage, prompt-injection resistance, and route-level test requirements.
- Verified by fetching the file back from GitHub; the Premium section and P15 regression test are present.
- Link: https://github.com/mobinhan/know-yourself-mvp/blob/docs/3framework-testing/docs/3framework-testing.md

### Implementation blocker
- Attempted to send an implementation request to the existing Lovable project only; Lovable rejected it because the workspace is out of credits. No code edit, credit-consuming build, database provisioning, payment integration, or deployment occurred.
- Do not retry Lovable build actions until workspace credits are available and authorized. No new project was created.
- Next safe implementation step once the existing project can be edited: add a reusable server-only capability guard and tests; Premium must fail closed until trusted authentication and entitlement resolution exist. Do not claim Premium is protected until route-level tests pass against the actual implementation.


## Current verified checkpoint (2026-10-12 — Premium entitlement enforcement)

### Framework policy foundation
- Draft PR #7: https://github.com/mobinhan/know-yourself-mvp/pull/7
- Branch: `security/premium-entitlement-guard`; latest known commit `c07a5c0ccd613c879e076c52cef12b7c12f3af0b`.
- Capability policy and trusted entitlement lookup are implemented; server-managed table migration is authored but not applied to live Supabase.
- GitHub Actions run #38224634198 passed **14 tests, 0 failures**. This verifies unit-level capability and lookup policy only, not live route enforcement.

### Candidate API route enforcement
- Draft PR #8: https://github.com/mobinhan/know-yourself-mvp/pull/8
- Branch: `security/premium-api-route-guard`, based on candidate API branch `feature/live-api-v1`; latest verified branch head `5ae2e6679eb6a9e1b6218352733b5beb7ef2b517`.
- Added `api/entitlements.py`: verifies Supabase bearer JWT, reads the server-managed entitlement row using the authenticated JWT, defaults a missing row to Free, and fails closed on entitlement lookup errors.
- Added guards to candidate `/v1/charts/{id}/questions/context` and `/today` before chart/transit computation and before the AI interpretation provider when a Premium capability is requested.
- Free requests default to `guide.basic`; the model context is limited to active foundational L1 records, with external curated records and validated relationships excluded. Premium capability is not inferred from a client plan claim; the client can request a capability but the server independently authorizes it.
- Added route tests designed to assert denied Premium requests do not invoke chart computation, transit computation, or the model provider; added a Free knowledge-tier boundary test.
- Route guard CI run #38225069136 passed. The gate-line regression workflow, which initially failed because old tests did not explicitly request the Premium tier, now also passes in run #38225069134 after updating those tests. These are candidate-branch CI tests, not live end-to-end entitlement tests.
- PR #8 targets `feature/live-api-v1`, not `main`. That candidate API is not yet the default-branch production application.

### Mandatory blockers
- Both PRs remain draft/unmerged. No deployment was performed.
- The entitlement migration has not been applied to live Supabase; no billing/webhook or trusted admin provisioning integration exists.
- The default `main` branch remains a V22 static website artifact and has no corresponding AI API route. The actual production app/API route must be selected before these guards can protect the live user experience.
- Do not edit Lovable without explicit user approval.
- The mandatory 3framework Premium acceptance gate remains **BLOCKED**, not PASS, until candidate route tests pass, production route alignment is resolved, entitlement migration/provisioning is safely applied, and authenticated end-to-end bypass tests pass.
- Resume by checking PR #7 and #8 heads, route-guard CI, and the current deployed API identity; then continue with integration without merging/deploying prematurely.

## Confirmed product decision (2026-10-12 — PHS access and presentation)

- **Detailed PHS interpretation is Premium.** Treat this as a confirmed product decision, not merely a proposal.
- Premium PHS includes detailed Determination/digestion interpretation, Cognition/Tone interpretation, Environment analysis, and personalized synthesis using the controlled knowledge base.
- Keep underlying PHS mechanics and classifications accurate in the canonical chart/evidence layer; the entitlement boundary governs access to the detailed interpretation and experience, not calculation correctness.
- Do not expose unnecessary raw technical substructure in user-facing PHS explanations. In particular, the user explicitly says PHS explanations do **not** need to disclose full activation notation such as `62.2.5.5.3`. Present the relevant human-readable classification (for example, Environment: Valleys / Wide Valleys) and explain its meaning at the appropriate entitlement level.
- Free/basic chart access may show basic chart facts and only the PHS information explicitly assigned to Free by the product design; do not give a detailed PHS reading to a Free user.
- **Implementation status remains unverified:** this is a confirmed product rule, but it is not proof that Premium gating is deployed or enforced end-to-end. Follow the Premium entitlement checkpoint above; do not claim enforcement until the real app/API route and authenticated end-to-end tests are verified.

## Current checkpoint (2026-10-12 — PHS acceptance criteria)

- Confirmed product rule: detailed PHS interpretation is Premium; do not routinely expose full raw activation notation such as `62.2.5.5.3` in user-facing explanations. Keep full canonical substructure internally for accuracy/audit.
- Added PHS-specific acceptance tests PHS-1 through PHS-7 to `docs/3framework-testing.md` on branch `docs/3framework-testing`, commit `16946979f3764d5a1902c5f2efb73ce6b23517ae`; fetched the remote file back and verified all seven tests are present.
- Tests cover Free/Premium boundaries, raw-substructure presentation, separation of calculation from presentation, verified mapping provenance, graceful Free response, and regression against the general entitlement gate.
- These are documentation/acceptance criteria, not runtime tests. PHS mapping correctness and deployed Premium enforcement remain unverified. Do not claim PHS is secured until the actual serving route applies trusted server-side entitlement checks and authenticated end-to-end tests pass.
- Next: inspect the canonical PHS calculation/mapping implementation and its source evidence; validate the chain that yields Determination/Cognition/Environment/orientation without inferring a label from Gate 62.2 alone. Keep this isolated from production calculations until the mapping contract is supported by approved sources.



## Current checkpoint (2026-10-13 — somatic-first Sacral response orchestration)

- User clarified a core Know Yourself teaching principle: for Sacral Authority, the answer must help move decision-making away from mental analysis and back toward direct bodily awareness. The Sacral response should be explained as a bodily response, not a thought; the user is learning to notice their own response, not to think their way into one.
- Added an orchestrator rule and regression tests O10–O14 to `docs/3framework-testing.md` on branch `docs/3framework-testing`.
- Documentation commit: `cb398497a00c7c5603db09bb9166a2ba43369086`.
- Remote fetch-back verified the new rule and O10 test are present.
- Manual conversation evaluation: initial responses **failed** the somatic-first requirement by foregrounding biological explanation/caveats and mental analysis. O12 was partial; advanced source provenance and live retrieval were not demonstrated. O14 passes only as a correction-handling process because the regression rule is now documented.
- **Important:** this is a documentation change and manual conversation evaluation, not proof the production 3Framework Orchestrator/runtime enforces the rule. Runtime integration and automated execution of O10–O14 remain **NOT VERIFIED**.
- Next: implement the rule in the actual Answer Composer/3FO prompt or policy path, then run O10–O14 against the real response path and record trace/evidence. Keep the answer natural and warm; do not reflexively turn Sacral teaching into a neuroscience lecture. Preserve source accuracy and distinguish Sacral Authority from channels such as 34–57.


## Current checkpoint (2026-10-13 — embodied decision-making across all authorities)

- User clarified that the product principle is not Sacral-only: **all Human Design authority guidance should orient users toward embodied decision-making, with the body leading and the mind supporting rather than taking over.**
- Updated the 3Framework Orchestrator contract on branch `docs/3framework-testing` to generalize the rule across Emotional, Sacral, Splenic, Ego/Heart, Self-Projected, Mental/Environmental, and Lunar decision processes.
- Added regression tests O15–O20 for authority coverage, authority-specific mechanics, avoiding mind-as-authority drift, avoiding generic gut-signal substitution, chart-driven personalization, and direct experiential guidance.
- Documentation update commit: `0f40863ca151d3fd2d0217d945aa5b47a49e1f00`.
- This is a product/orchestration requirement, not evidence that runtime behavior is already implemented. O15–O20 are **NOT RUN** against the actual answer-generation path.
- Important nuance for faithful implementation: embodied decision-making is the overarching product principle, but the specific Human Design mechanics differ by authority. Do not flatten every authority into the Sacral gut-response model; in particular, preserve the source-specific Emotional clarity-over-time and Mental/Environmental sounding-board/environment process.
- Next: inspect the actual Answer Composer / 3FO runtime path, apply the cross-authority rule there, then execute O10–O20 with representative fixtures for each supported authority and retain evidence. Do not claim runtime integration until verified.

## Current checkpoint (2026-10-15 — routed answer pipeline mock gate passed)

### Authoritative repository state
- Repository: https://github.com/mobinhan/know-yourself-mvp
- Active implementation PR: [PR #24 — Add bounded Layer 2 context retrieval contract](https://github.com/mobinhan/know-yourself-mvp/pull/24)
- Branch: `feature/layer2-context-retrieval`
- Latest branch commit: `2a780062e05c065f98dec2aff59b0c6c7e56ddc8` — “Add routed server-side answer pipeline contract tests”.
- PR #24 remains **OPEN, DRAFT, UNMERGED**. Do not merge without explicit approval.
- Successful CI run for the latest commit: https://github.com/mobinhan/know-yourself-mvp/actions/runs/38633734869. Workflow conclusion: **success**. Both Python engine validation and JavaScript contract validation jobs passed, including the mocked end-to-end answer pipeline test.

### Implemented on PR #24
- Bounded Layer 2 context assembler: configurable 4,000-token default budget, maximum 12 newest turns, consent/confirmation/status/expiry filtering for memories, summary inclusion gated by personal-context preference, and trimming telemetry without private text.
- User-facing history API pagination remains separate: default 50 rows/page, hard max 100. Never pass a 50-row history page wholesale into model context.
- Trusted summary orchestration preserves the newest 12 turns, tracks summary version and covered sequence, and uses an injected trusted persistence callback. Migration/RPC is still a candidate and has not been applied to production.
- New provider-neutral answer pipeline contract in `supabase/functions/answer-api/pipeline.mjs`: authenticate, verify conversation ownership before retrieval/model calls, rule-first router, Flash classifier for gray-zone questions, configurable escalation threshold (default 0.72), Flash/minimal-context path, reasoning/assembled-context path, critic before persistence, and whitelisted privacy-safe telemetry.
- New mocked end-to-end test in `supabase/test_answer_pipeline.mjs` registered in CI.

### Mocked tests verified
1. Simple question routes to Flash with small context; full assembler/reasoning path is skipped; critic passes before persistence.
2. Complex/personal question escalates to reasoning; assembled context stays within 4,000 tokens and includes no more than 12 recent turns; critic passes before persistence.
3. A 32-turn conversation triggers trusted summary orchestration; coverage advances to sequence 20, summary version advances, and the newest 12 turns are preserved.
4. Ownership denial blocks model calls and persistence.
5. Gray-zone classifier confidence below the configured threshold fails safe to escalation.
- Latest CI is green. These tests use mocked model and token-count adapters; this is not proof of live provider behavior or production deployment.

### Hard rollout gates
- **No real provider key has been connected.**
- **No production migration applied, no production Edge Function deployed/redeployed, no merge.**
- The answer pipeline is a provider-injected orchestration module and mock contract, not yet a fully wired deployed Supabase answer endpoint. Trusted Supabase retrieval/persistence adapters and real model/critic provider integration remain future work.
- Do not discuss/enable a real provider key until the mock gate remains green and the server-side adapter/security review is ready.
- When approved for the first real API run, limit it to 5–10 manual test questions, with a $10 billing cap set in Google Cloud beforehand. Do not enable general traffic by default.
- Keep PR #24 in draft until the full pipeline integration/test gate is explicitly met.
- Preserve prior constraints: no Lovable project/credit spend without approval; no Vercel dependency; never commit secrets; no merges, production migrations, or production redeployments without explicit approval.

### Next action when resuming
1. Read this checkpoint and re-check PR #24 head and CI status.
2. Wire a trusted Supabase Edge Function adapter that performs owner-scoped conversation access, trusted canonical chart/evidence retrieval, consent-governed memory/summary retrieval, provider-tokenizer measurement, and trusted assistant-turn persistence.
3. Use only mocked model adapters first; add authenticated ownership/consent tests and full handler-level integration tests. Keep the deployment and migration disabled.
4. After that passes, review the real-provider plan. First real-provider trial remains limited to 5–10 manual questions with the $10 Google Cloud cap set before use.

