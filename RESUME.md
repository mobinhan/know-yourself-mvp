# Know Yourself — Resume State

Last updated: 2026-10-11

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
