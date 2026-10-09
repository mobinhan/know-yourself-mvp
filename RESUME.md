# Know Yourself — Resume Here

> **HARDWIRED ARCHITECTURE DECISION:** The user explicitly confirmed 3framework. Active path = (1) Canonical Chart + source-linked Evidence, (2) Adaptive User Context, (3) direct ChatGPT synthesis. The 5framework is comparison-only. Never add/invoke a separate critic or extra reasoning layer in the 3framework path. Keep ordinary schema validation and evidence-ID filtering. If a proposed change crosses this boundary, stop and ask the user first.

> **MANDATORY LOVABLE APPROVAL RULE: Do not make any amendments, send prompts, run builds, or otherwise spend Lovable credits unless the user gives explicit permission for that specific Lovable work. “Proceed” alone is not permission. Before requesting approval, explain why Lovable access is necessary, what non-Lovable alternatives exist, and the expected credit cost if it can be estimated. Check the project checkpoint for this rule before any Lovable action.**

> **MANDATORY PLATFORM RULE: We do not use Vercel for Know Yourself. Do not open, configure, troubleshoot, or deploy through Vercel. Use Lovable for the live app interface, GitHub for source control and recovery, GitHub Actions for tests, and Supabase for backend/data. Only reconsider Vercel if the user explicitly asks to reinstate it. Read this rule before taking any action.**


> **HARDWIRED MOBILE/DESKTOP PARITY:** The user explicitly said mobile sessions have been operating below the current desktop level. Do not regress scope or maturity on mobile. Before continuing any session/device, read the latest checkpoint, continuity protocol, architecture contract, and relevant rubric; retrieve current GitHub state via MCP; then continue the exact next engineering task with the same autonomous, test-backed standard. Do not make the user repeat prior decisions. Preserve 3framework, no-critic active path, no-Lovable-without-specific-approval, no-Vercel, and no-merge-without-approval rules. Do not claim unpushed desktop changes are saved when the desktop workspace is inaccessible.

**Purpose:** Single entry point for continuing work across ChatGPT desktop/mobile conversations.

## Canonical short resume command — HARDWIRED

**When the user says exactly `Resume KY`, treat it as the canonical cross-device recovery command.** Immediately read this `RESUME.md` from the latest verified active GitHub branch, then follow the full recovery procedure below: read `docs/CONTINUITY_PROTOCOL.md` and the latest project checkpoint; verify current branch heads, open PRs, relevant CI and accessible backend/app state; preserve desktop-only work; and continue the exact next engineering task at the established technical level. Do not ask the user to repeat settled decisions. This command is a short alias for the complete recovery workflow, not a request to merely explain the file.

## Mandatory rule

When the user says **“save mcp”**, execute the full procedure in [docs/CONTINUITY_PROTOCOL.md](docs/CONTINUITY_PROTOCOL.md). Do not treat it as a request for a verbal summary only.

## Resume steps

1. Read [docs/CONTINUITY_PROTOCOL.md](docs/CONTINUITY_PROTOCOL.md).
2. Read [docs/PROJECT_CHECKPOINT_2026-10-09.md](docs/PROJECT_CHECKPOINT_2026-10-09.md) from the **latest verified** active feature-branch head.
3. Verify current GitHub heads for main and feature/live-api-v1, open pull requests, latest relevant CI runs, and deployment status. Do not assume the checkpoint SHA is still current.
4. Preserve any desktop working folder. Do not reset, overwrite, force-push, or merge while local-only edits are possible.
5. Continue from the checkpoint’s exact next action. Do not redo completed work without a failed test or evidence of regression.

## Branch safety

- Active development/recovery branch known at last checkpoint: feature/live-api-v1.
- main and feature/live-api-v1 have different histories/heads; do not replace one with the other.
- Pull request #1 was recorded as open and unmerged; verify current status before acting and do not merge without explicit approval.

## Latest verified project state — Vercel removal

- Verified branch before this final resume-file update: `feature/live-api-v1` at `e8972067c011ef243c3b424a7290f1417e3a3d22`.
- Vercel repository configuration removed: `vercel.json` deleted; `.vercel/` ignore entry removed; CI no longer watches `vercel.json`; README and recovery docs updated.
- `vercel.json` absence verified through GitHub (404 for the deleted path). `.gitignore` and `.github/workflows/step1-engine.yml` verified without Vercel references.
- Focused gate-line regression workflow previously passed on the pre-removal code checkpoint: [run #25](https://github.com/mobinhan/know-yourself-mvp/actions/runs/37909816257). The repository config/doc changes themselves have not been followed by a new full regression run.
- PR #1 remains open, draft, and unmerged. The Vercel status still appears on older commit checks because the external Vercel project/GitHub integration remains attached.
- Attempted external Vercel project deletion was blocked by 403 scope authorization. Repository cleanup is complete; external dashboard/integration deletion is not verified and requires authorized dashboard access.
- Lovable remains the primary live web-app environment; do not use Vercel unless the user explicitly reinstates it.

## Last verified checkpoint before this recovery update

- Desktop checkpoint: [7e49fbdef140a1a79333235d891a40726ff9dc39](https://github.com/mobinhan/know-yourself-mvp/commit/7e49fbdef140a1a79333235d891a40726ff9dc39), committed at 15:53:15 ICT on 2026-10-09.
- Gate-line regression workflow run #18 passed for that checkpoint: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37907754627.
- The later recovery protocol and checkpoint updates must be verified from the current branch head before resuming.
- Vercel has been removed from the repository workflow and its `vercel.json` configuration deleted. Do not use Vercel as a deployment target unless the user later explicitly reinstates it.
- Live interpretation was not verified at the last checkpoint.

## Current next action

Read `docs/PROJECT_CHECKPOINT_2026-10-09.md`, `docs/LOVABLE_MIGRATION_PLAN.md`, and `docs/INTERPRETATION_QUALITY_RUBRIC.md`. The immediate task is the no-credit, read-only Lovable migration compatibility audit: inventory the frontend tree, resolve the `/web/app.js` and `/web/sw.js` references, and establish the API runtime/routing assumptions. Do not create a Lovable project or spend credits without separate, specific approval.

**Interpretation Step 3 remains in progress; the immediate task is the migration compatibility audit before any Lovable pilot.** The active 3framework provider sends Layers 1 and 2 directly to ChatGPT for Layer 3 synthesis. It performs ordinary response normalization and evidence-ID filtering, but does not run a separate critic or post-synthesis reasoning layer. The standalone critic helper is not wired into this path.

- Historical focused regression suite: 27 tests passed before the direct-synthesis correction — https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912387. New CI must verify the corrected path.
- Full Step 1 Engine Validation passed on code/test commit `10a96297d96d07e6762d7d2356857dcd7a1fcb6b` — https://github.com/mobinhan/know-yourself-mvp/actions/runs/37914912452
- Latest work is pushed to `feature/live-api-v1`; verify branch HEAD before continuing.
- Focused Gate-line regression passed on the corrected path: run #87 — https://github.com/mobinhan/know-yourself-mvp/actions/runs/37915509731
- Full Step 1 Engine Validation passed on corrected provider code/prompt commit `1a2da5da06c96ec44b9f2d3064350d37c637193d`: run #384 — https://github.com/mobinhan/know-yourself-mvp/actions/runs/37915475617
- Next: broaden source-grounded fixtures for direct ChatGPT synthesis without introducing a critic layer.
- These are offline/mocked checks, not proof of live model quality. No live OpenAI request has been sent.
- Do not access or amend Lovable without explicit approval. Do not use Vercel or merge PR #1 without explicit approval. Preserve desktop-only work; this environment cannot inspect the desktop working tree.
## Confirmed platform workflow

- **Lovable:** primary web-app build/preview interface used in this project.
- **GitHub:** source control, reviewed checkpoints, and cross-device recovery.
- **GitHub Actions:** automated regression/contract tests.
- **Supabase:** backend and data services.
- **Vercel:** removed from the project workflow. Do not configure or use it unless explicitly reinstated by the user.
- Verify Lovable/GitHub synchronization before assuming the live interface includes the latest branch changes. Check CI and live behaviour as separate things. The external Vercel project/integration could not be changed through the current Vercel connection (403 scope authorization); repository config has been removed, but external account cleanup requires the user's dashboard action.
- Full process: [docs/CONTINUITY_PROTOCOL.md](docs/CONTINUITY_PROTOCOL.md), section “Know Yourself development and deployment workflow”.


## Latest save — 2026-10-09 22:57 ICT

- Latest checkpoint update: [4f9790ecef34799e17200bd2db0ce59550ac899f](https://github.com/mobinhan/know-yourself-mvp/commit/4f9790ecef34799e17200bd2db0ce59550ac899f).
- Read and preserved the existing 3framework decision, no-Lovable-without-explicit-approval rule, no-Vercel rule, and no-merge-without-approval rule.
- Mobile resume point: read `docs/PROJECT_CHECKPOINT_2026-10-09.md` from the latest `feature/live-api-v1` head, verify branch heads and CI, then continue Step 3 offline evaluation fixture expansion. No live model-quality pass is claimed.
- GitHub search surfaced main HEAD `9b503db604b680fccbc7b962a59ce9fa19776a39`; do not mistake it for the feature branch head or replace the feature branch with main.
- Local desktop working tree has not been inspected, so unpushed local edits cannot be ruled out. Do not reset, overwrite, force-push, or merge during recovery.
