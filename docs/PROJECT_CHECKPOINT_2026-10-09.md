# Know Yourself — Project Checkpoint
**Checkpoint date:** 2026-10-09  
**Repository:** mobinhan/know-yourself-mvp  
**Working branch:** `feature/live-api-v1`  
**Checkpoint purpose:** Resume safely from desktop or mobile without losing current state.

## Current verified state
- Latest known feature-branch commit before this checkpoint: `73ed4578086252a6209ec2121974a744688e399b`.
- GitHub Actions workflow **Gate-line regression tests**, run #17, passed: 7 tests, 0 failures. Run: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37907495024
- The focused test suite covers exact active Gate 57.4 evidence retrieval, active-chart requirements, relationship source requirements, false-positive Director wording, gate-line leakage prevention (Gate 57.4 must not leak into Gate 57.3), evidence/guardrail delivery to ChatGPT, and removal of unknown evidence IDs.
- Workflow: `.github/workflows/gate-line-tests.yml`. It runs Python 3.12 unittest tests on relevant pushes/PRs and supports manual dispatch.
- Draft validation PR #1 remains open and unmerged: https://github.com/mobinhan/know-yourself-mvp/pull/1
- PR #1 is a large change set (previously reported as about 75 commits / 27 files); review before any merge.
- Historical note: Vercel previously reported build-rate-limit failures; the user subsequently instructed that Vercel be removed from this project. Repository configuration has been removed; this historical failure is no longer an active deployment task.
- No successful live interpretation from the deployed app has been verified. OpenAI key/configuration and a working live endpoint have not been confirmed.

## Architecture contract
1. **Layer 1 — Canonical chart + evidence:** deterministic chart mechanics and controlled, source-linked knowledge retrieval.
2. **Layer 2 — Adaptive user context:** context shapes relevance but cannot change chart facts.
3. **Layer 3 — ChatGPT synthesis:** interprets the supplied evidence, connects concepts, contextualizes, and produces an in-depth answer; it must not recalculate chart mechanics.
The current tests validate evidence integrity and request contracts with mocked API responses. They do **not** prove semantic quality of actual live model output.

## Current gate-line retrieval safeguards
In `api/interpretation_provider.py`, `_select_knowledge`:
- Scores external records by overlap and prioritizes exact active gate-line evidence before the `MAX_EXTERNAL_RECORDS=8` limit.
- For an explicit gate+line question, gate-line-specific evidence must match the exact queried gate/line.
- Gate-line-specific evidence requires the corresponding activation to be active in the canonical chart.
- Gate 57.4 “Director” relationship evidence is only attached when Gate 57.4 is active, the exact source ID `EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001` is allowed, and the validated edge explicitly names that source.
- Regression tests prevent Gate 57.4 evidence from leaking into a Gate 57.3 answer.
- Potential future review: a record marked “gate-line synthesis” without an extractable gate/line is treated as specific and skipped for explicit line queries. This may be intentionally conservative; do not loosen it without adding tests.

## Human Design source and chart notes
- Golden Chart #2: 15 April 1982, Baarn, Netherlands, 07:38.
- User-confirmed channels: 3–60, 11–56, 28–38, 32–54, 34–57, and 42–53.
- User has explicitly corrected earlier chart-reading errors. Never assert authority/profile/type without checking the canonical chart fixture and calculation path.
- Gate 57.4 source archetype: **The Director**. Source ID: `EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001`; source: `EXT_IHDS_OFFICIAL`; title: “Gate 57.4 — The Director”.
- Source locator: The Daily View, Gate 57.4 — “Capacity for beneficial relationships or not is key”: https://myemail.constantcontact.com/The-Daily-View--Gate-57-4---Capacity-for-beneficial-relationships-or-not-is-key.html?aid=PJH8RE2ypYU&soid=1101642878733

## Next work — continue autonomously
1. Inspect `api/interpretation_provider.py`, the synthesis contract tests, and endpoint/deployment configuration for request schema and response normalization.
2. Identify a safe way to verify live integration without exposing secrets. Lovable is the live web-app environment; do not trigger Vercel builds.
3. Add an optional, explicitly gated live integration test only if it can safely avoid logging secrets; do not assume `OPENAI_API_KEY` exists.
4. Build/maintain an offline interpretation-quality rubric and fixtures for source fidelity, chart-fact integrity, personalization, depth, uncertainty, and unsupported-claim control.
5. Clearly distinguish offline/mock contract validation from real model-quality evaluation. Do not claim live quality has passed until real outputs are assessed.

## Hard constraints and approvals
- **Do not use Lovable unless the user gives firm explicit approval.** Before asking for approval, state exactly why it is needed, alternatives, and approximate credit cost. A general “proceed” is not approval.
- Do not merge PR #1 without explicit review/approval.
- Do not expose API keys or secrets in logs, commits, or responses.
- Avoid unnecessary questions; continue until a genuine major decision or external blocker requires the user's input.

## Resume note
On mobile, continue from this checkpoint and the open PR. First verify the branch’s current state and CI status, then proceed with live-integration and interpretation-quality validation. Latest verified regression run at checkpoint: run #17 passed all 7 tests.


## Cross-device continuity — protocol added 2026-10-09

- Mandatory procedure: `docs/CONTINUITY_PROTOCOL.md`.
- Protocol commit on `feature/live-api-v1`: `7edd68f201387e768d5add8fa9645e6408789ca3` (cross-device continuity protocol).
- Recovered desktop checkpoint: `7e49fbdef140a1a79333235d891a40726ff9dc39`, committed at 15:53:15 ICT on 2026-10-09.
- The Gate-line regression workflow run #18 passed for checkpoint commit `7e49fbdef140a1a79333235d891a40726ff9dc39`: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37907754627
- Branch heads differ: `main` currently points to `9b503db604b680fccbc7b962a59ce9fa19776a39`; `feature/live-api-v1` contains the newer desktop checkpoint and must be preserved. Do not merge PR #1 without explicit approval.
- Lovable live behaviour remains unverified. Vercel is removed from the repository workflow by user decision.
- Next action: resume the feature branch from the checkpoint, verify live integration safely without exposing secrets, then improve offline interpretation-quality fixtures. Inspect the desktop working tree before any pull/reset/merge if local-only edits may exist.


## Mandatory “save mcp” continuity protocol — 2026-10-09

- Trigger: whenever the user says “save mcp” (case-insensitive), execute the full save, checkpoint, push, and verification procedure in `docs/CONTINUITY_PROTOCOL.md`. Do not merely summarize or promise to save.
- One-page recovery entry point: `RESUME.md`.
- Protocol commit: `58998ba0dfad2f86a9a0419ada9342500b908a4b`.
- Recovery entry-point commit: `21651be5d6114561454dfd0e9cc0666dd2126a03`.
- This checkpoint update will be the latest commit on `feature/live-api-v1`; verify the resulting remote HEAD after saving.
- On every save, distinguish pushed/verified code from local-only or uncommitted work. This environment cannot inspect the user's desktop working tree; unless inspected, local-only edits cannot be ruled out.
- Do not merge PR #1 without explicit approval. Do not reset/overwrite the desktop workspace during recovery.
- Resume instruction: read `RESUME.md`, then this checkpoint and the full protocol from the latest verified feature branch; verify all relevant branch heads, open PRs, CI, and deployment status before continuing.

## Platform workflow clarification — 2026-10-09

- User confirmed that **Lovable is the live web-app interface/build environment currently being used**.
- Workflow roles: Lovable = interface build/preview; GitHub = source control and recovery; GitHub Actions = automated tests; Supabase = backend/data.
- **Vercel has been removed from the repository workflow.** `vercel.json` deleted; `.gitignore`, CI triggers, README, and recovery docs updated. Do not use or reintroduce Vercel unless the user explicitly asks.
- Do not assume Lovable has synchronized every latest GitHub commit; verify synchronization and test live behaviour separately from CI.
- Repository-side Vercel config changes were made after the user explicitly requested removal. Lovable and Supabase configurations were not changed. The connected Vercel account could not be accessed to delete its external project (403 scope authorization), so dashboard cleanup remains user-action-only.
- Resume action: follow this workflow in `docs/CONTINUITY_PROTOCOL.md` and `RESUME.md`; continue from the existing checkpoint's next engineering task, while preserving desktop-only changes and the no-merge-without-approval rule.


## Vercel removal execution checkpoint — 2026-10-09

- User explicitly requested: remove Vercel from the project entirely; reinstall later only if needed.
- Deleted `vercel.json` from `feature/live-api-v1`.
- Removed `.vercel/` from `.gitignore` and removed `vercel.json` from the Step 1 CI path filters.
- Updated `README.md`, `RESUME.md`, and this protocol/checkpoint to make Lovable the live app environment and Vercel not part of the workflow.
- External Vercel project deletion was attempted via the connected Vercel integration but blocked by HTTP 403 scope authorization (`mobinhan-7634`). No claim is made that the external Vercel project or GitHub App integration has been deleted.
- No PR merged; PR #1 remains open/draft. API source code was preserved to avoid deleting application logic without validating the Lovable/Supabase runtime dependency.
- Next: verify remote branch HEAD and file contents; run focused regression CI; then continue interpretation-quality/live integration validation using Lovable and Supabase, not Vercel.


## Lovable credit approval reminder — reaffirmed 2026-10-09

- The existing **Hard constraints and approvals** section already says not to use Lovable unless the user gives firm explicit approval and to explain the reason, alternatives, and approximate credit cost before requesting approval.
- This rule is now promoted to the top of `RESUME.md` and recorded in `docs/CONTINUITY_PROTOCOL.md` so it is encountered on every resume.
- No Lovable actions or amendments were made as part of this documentation update. All future Lovable actions remain blocked unless explicitly authorized by the user.


## Offline interpretation contract audit — 2026-10-09

- Audit report: [`docs/INTERPRETATION_CONTRACT_AUDIT_2026-10-09.md`](INTERPRETATION_CONTRACT_AUDIT_2026-10-09.md).
- Hardened `api/interpretation_provider.py` against malformed optional model-output fields. Invalid evidence basis arrays are dropped; malformed card source/channel/centre arrays are dropped; non-canonical gate values are rejected; invalid one-line/interpretation fields receive safe fallbacks. Missing answer still fails closed with a sanitized provider error.
- Added/extended offline tests in `tests/test_gate_line_synthesis_contract.py`: malformed optional fields, missing required answer, no-network behavior when provider is not configured, and direct birth-data field exclusion.
- Corrected code/test commit: `4bd3ff4cc1d7c8694a2df40000a8da616a8731e5`. Focused Gate-line regression run #41 passed all 10 tests: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37912038319
- Audit report commit: `eca43f42372c02b1eb3ebbb27754f5d1b5def27f`. Documentation-only changes after run #41 were not separately tested.
- Critic finding: `engine/answer-critic.js` and `engine/reasoning-adapter.js` contain a critic path, but `engine/THREE_FRAMEWORK.md` explicitly says a separate critic is not mandatory in 3framework and `engine/test_three-framework.mjs` asserts the direct ChatGPT envelope has no critic. The Python API provider also does not invoke that JavaScript critic. Preserve this intentional architecture; semantic claim validation remains a documented gap rather than silently wiring in a separate critic.
- Deterministic chart mechanics remain authoritative and are supplied to synthesis; tests assert direct birth-data fields are not sent to the model. This does not prove every generated sentence is semantically grounded.
- Live OpenAI integration/model quality remains unverified. No real provider request was sent; provider-not-configured behavior was tested without network access.
- No Lovable access or changes; no Vercel actions; no PR merge.
- PR #1 remains open/draft/unmerged. Latest observed metadata marked it non-mergeable; do not merge. Inspect divergence/conflicts separately before considering review.
- **Local working tree not inspected; unpushed desktop edits cannot be ruled out.**
- Next action: continue offline semantic-quality fixtures and inspect PR divergence safely. Any live-app validation remains blocked until the user explicitly authorizes Lovable access.


## Latest interpretation-quality checkpoint — 2026-10-09

- Feature branch head at implementation verification: `ef96b1872ac24c56be86569446136f1c2feb52bd`.
- Step 2 gap is addressed for the Python API route by `api/interpretation_critic.py`, a deterministic post-synthesis quality gate. It does not add a second AI model or alter the 3framework contract.
- High-confidence explicit chart contradictions and unsupported source-specific gate-line synthesis fail closed; clean answers remain ready. This is not comprehensive semantic validation.
- Added `tests/test_interpretation_critic.py`, expanded `tests/test_gate_line_synthesis_contract.py`, and wired both into `.github/workflows/step1-engine.yml`.
- Focused Gate-line regression passed: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37913796218
- Full Step 1 Engine Validation passed: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37913789162
- Fixed the V1 frontend/API contract test so it no longer requires the user-deleted `vercel.json`; CI now tests the Python route handler instead.
- No OpenAI live request was sent. No Lovable access or changes. No Vercel action. PR #1 remains open and unmerged.
- Next action: Step 3 — expand semantic-quality fixtures across representative gates/lines, channels, centres, chart mechanics, source faithfulness, natal-versus-transit distinctions, and cross-concept claims. Gate 57 is one fixture, not the whole coverage strategy.


## Step 3 — expanded offline interpretation-quality fixtures (2026-10-09)

- Added `docs/INTERPRETATION_QUALITY_RUBRIC.md`, defining a multi-concept fixture strategy and separating deterministic checks from qualitative human review.
- Expanded `api/interpretation_critic.py` beyond Gate 57: explicit profile/type/authority claims are checked against canonical values when supplied; gate-line activation checks the exact line; transit claims require a `transit_gates` list and named gates must appear in that list.
- Expanded `tests/test_interpretation_critic.py` across gate activation, gate-line status, defined channels, defined/undefined centres, profile/type/authority, exact gate-line source + validated relationship, mismatched cross-concept source evidence, and transit/natal distinction.
- Expanded focused workflow triggers and coverage so changes to `api/interpretation_critic.py` and `tests/test_interpretation_critic.py` run the regression suite. The Step 1 Engine Validation workflow now also triggers on `tests/**`.
- Focused regression passed: 27 tests, 0 failures — https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912387
- Full Step 1 Engine Validation passed on code/test commit `10a96297d96d07e6762d7d2356857dcd7a1fcb6b`: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912452
- Quality checks remain intentionally conservative and pattern-based. They do not prove general prose/source faithfulness or live model quality. Human-scored fixtures for depth, uncertainty, personalization, and broad paraphrase fidelity remain future work.
- No Lovable access or changes, no Vercel use, no live OpenAI request, and no PR merge.
- Next: extend the fixture corpus with several independently sourced gate/line records and representative channel/centre/transit questions; review any potential false positives/negatives before changing fail-closed behaviour.


## Hardwired 3framework architecture decision — 2026-10-09

- **User explicitly confirmed 3framework. This is binding and must persist across desktop/mobile, MCP/GitHub recovery, code, prompts, tests, and future continuation.**
- Canonical specification: [`engine/THREE_FRAMEWORK.md`](../blob/feature/live-api-v1/engine/THREE_FRAMEWORK.md).
- Active path is exactly: (1) Canonical Chart + source-linked Evidence, (2) Adaptive User Context, (3) direct ChatGPT synthesis.
- The 5framework remains available for comparison only. Do not blend it into the active 3framework path. No separate interpretation critic, answer critic, reasoning adapter, or extra reasoning layer may be invoked by the 3framework provider without a new explicit user decision.
- Ordinary response-schema validation, JSON normalization, and filtering evidence IDs to records actually supplied remain allowed as contract/safety handling.
- Corrected `api/interpretation_provider.py` to remove the post-synthesis `review_interpretation` call and stop returning critic-generated `quality_review` / `needs_review` output. Updated provider contract tests to assert direct synthesis.
- The standalone `api/interpretation_critic.py` and its tests remain isolated comparison/legacy material only; they are not wired into the active provider path.
- Prior 27-test and full-engine CI results predate this correction and do not validate the corrected code. Run fresh focused and full CI now.
- No Lovable access, no Vercel use, no live OpenAI request, and no PR merge.
- Local working tree not inspected; unpushed desktop edits cannot be ruled out.
- **Next action:** run the new focused and full engine CI; verify branch HEAD and inspect the updated provider and recovery docs. Continue 3framework fixture expansion only after the corrected path passes.
