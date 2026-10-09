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
- Vercel check has been blocked by a build-rate-limit message: https://vercel.com/mobinhan-7634?upgradeToPro=build-rate-limit. This is distinct from the passing Python regression tests.
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
2. Identify a safe way to verify live integration without exposing secrets or triggering unnecessary Vercel builds.
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
