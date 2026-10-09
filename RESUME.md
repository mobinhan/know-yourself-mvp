# Know Yourself — Resume Here

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

## Last verified checkpoint before this recovery update

- Desktop checkpoint: [7e49fbdef140a1a79333235d891a40726ff9dc39](https://github.com/mobinhan/know-yourself-mvp/commit/7e49fbdef140a1a79333235d891a40726ff9dc39), committed at 15:53:15 ICT on 2026-10-09.
- Gate-line regression workflow run #18 passed for that checkpoint: https://github.com/mobinhan/know-yourself-mvp/actions/runs/37907754627.
- The later recovery protocol and checkpoint updates must be verified from the current branch head before resuming.
- Vercel previously reported a build-rate-limit blocker; recheck before any deployment claim.
- Live interpretation was not verified at the last checkpoint.

## Current next action

Verify the latest feature-branch state and CI, then continue safely with live-integration verification and offline interpretation-quality validation. Do not merge PR #1 without explicit approval.

**Important limitation:** GitHub cannot prove whether unpushed edits remain on the user's desktop. If the desktop workspace has not been inspected, say so and preserve it.
