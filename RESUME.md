# Know Yourself — Resume Here

> **MANDATORY LOVABLE APPROVAL RULE: Do not make any amendments, send prompts, run builds, or otherwise spend Lovable credits unless the user gives explicit permission for that specific Lovable work. “Proceed” alone is not permission. Before requesting approval, explain why Lovable access is necessary, what non-Lovable alternatives exist, and the expected credit cost if it can be estimated. Check the project checkpoint for this rule before any Lovable action.**

> **MANDATORY PLATFORM RULE: We do not use Vercel for Know Yourself. Do not open, configure, troubleshoot, or deploy through Vercel. Use Lovable for the live app interface, GitHub for source control and recovery, GitHub Actions for tests, and Supabase for backend/data. Only reconsider Vercel if the user explicitly asks to reinstate it. Read this rule before taking any action.**

**Purpose:** Single entry point for continuing work across ChatGPT desktop/mobile conversations.

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

Verify the latest feature-branch state and CI, then continue safely with live-integration verification and offline interpretation-quality validation. Do not merge PR #1 without explicit approval.

**Important limitation:** GitHub cannot prove whether unpushed edits remain on the user's desktop. If the desktop workspace has not been inspected, say so and preserve it.

## Confirmed platform workflow

- **Lovable:** primary web-app build/preview interface used in this project.
- **GitHub:** source control, reviewed checkpoints, and cross-device recovery.
- **GitHub Actions:** automated regression/contract tests.
- **Supabase:** backend and data services.
- **Vercel:** removed from the project workflow. Do not configure or use it unless explicitly reinstated by the user.
- Verify Lovable/GitHub synchronization before assuming the live interface includes the latest branch changes. Check CI and live behaviour as separate things. The external Vercel project/integration could not be changed through the current Vercel connection (403 scope authorization); repository config has been removed, but external account cleanup requires the user's dashboard action.
- Full process: [docs/CONTINUITY_PROTOCOL.md](docs/CONTINUITY_PROTOCOL.md), section “Know Yourself development and deployment workflow”.
