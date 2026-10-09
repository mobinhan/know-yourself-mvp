# Know Yourself — Cross-Device Continuity Protocol

**Applies to:** desktop and mobile ChatGPT work, GitHub, CI, and deployment.
**Purpose:** Resume safely without relying on conversational memory alone or overwriting newer work.

## Source-of-truth order

1. **Working-tree changes on the active desktop workspace** may contain newer, unpushed work. Never overwrite, reset, or discard them during recovery.
2. **The active feature branch and its latest commit** are the source of truth for pushed work on that development track. Check all relevant branches; do not assume `main` is the latest work.
3. **`docs/PROJECT_CHECKPOINT_2026-10-09.md`** records the current task, verified tests, blockers, and next action. Update it whenever a meaningful checkpoint is saved.
4. **ChatGPT conversation history** provides context but is not proof that code or notes were saved.

## Before stopping, switching devices, or declaring work saved

1. Inspect the working tree and branch. Record modified, staged, untracked, and ignored files that are relevant to the task; never silently omit them.
2. Run the relevant tests. State exactly which tests ran and whether they passed, failed, or were not run.
3. Review the diff for accidental changes and secrets. Never commit credentials, API keys, tokens, or private environment files.
4. Update the project checkpoint with:
   - timestamp and timezone;
   - active branch and latest commit SHA;
   - work completed in this session;
   - tests run and results;
   - deployment status and blockers;
   - explicit next action;
   - any remaining local/uncommitted work.
5. Commit and push the code and checkpoint to the **intended branch**. Do not merge a pull request unless separately authorised.
6. Verify the remote branch HEAD and the new commit through GitHub after pushing. Verify CI separately. A successful commit/push is not proof that tests or deployment succeeded.
7. Report one of these states, precisely:
   - **Pushed and verified** — remote branch SHA confirmed;
   - **Committed locally, not pushed** — commit exists only in local workspace;
   - **Uncommitted local changes remain** — worktree has changes not in a commit;
   - **Blocked** — state the exact blocker and what remains unsaved.
8. Never say “saved to GitHub” unless the remote commit is verified. Never say “deployed” unless the deployment is verified.

## When resuming from another device or a new conversation

1. Read the project checkpoint on the active feature branch first.
2. Query GitHub for the latest commit on **all known relevant branches**, open PRs, recent Actions runs, and deployment status. Do not rely on a stale SHA in the checkpoint without checking.
3. Compare timestamps in the same timezone; show Vietnam time (ICT, UTC+7) for this project and preserve the source UTC timestamp where useful.
4. If the desktop workspace may have unpushed changes, tell the user to keep that workspace intact. Do not reset, pull over, merge, cherry-pick, or rewrite history until the local state is inspected.
5. Resume from the newest verified checkpoint/branch. Do not repeat completed steps unless a regression or failed verification justifies it.
6. If the current conversation cannot access another conversation's messages, say so plainly. Do not claim that the conversation was recovered; use the repository checkpoint as the recovery path.

## Branch and pull-request safety

- The latest desktop work may be on a feature branch rather than `main`. Check both.
- Do not merge an open PR without explicit user approval.
- Do not force-push or rewrite branch history as a continuity fix.
- If branches diverge or contain distinct architectures, preserve both and inspect the diff before deciding what to do.
- Treat Vercel build-rate limits as deployment blockers, not automatically as source-code failures.

## Checkpoint template

Append or update these fields in the active project checkpoint:

- **Checkpoint time (ICT, UTC+7):**
- **Active branch:**
- **Verified remote HEAD SHA:**
- **Session changes:**
- **Tests and results:**
- **CI run/link:**
- **Deployment state/blocker:**
- **Uncommitted/local-only work:**
- **Next action:**
- **Recovery cautions:**

## Current recovery note — 2026-10-09

The desktop checkpoint commit `7e49fbdef140a1a79333235d891a40726ff9dc39` is on `feature/live-api-v1`, timestamped 15:53:15 ICT. Its associated Gate-line regression workflow run #18 passed. The latest known main-branch commit is different; do not treat `main` as a replacement for the feature branch. The open PR #1 remains unmerged. Vercel has shown a build-rate-limit blocker, and live interpretation has not been verified. Recheck all of these before acting because statuses can change.


## Mandatory trigger phrase: “save mcp”

Whenever the user says **“save mcp”** (case-insensitive; punctuation does not matter), treat it as an instruction to execute this full save-and-recovery procedure—not merely to summarize the conversation.

### Required actions, in order

1. **Freeze scope:** do not start new feature work until the save is verified. Do not reset, overwrite, force-push, or merge branches.
2. **Establish current state:** inspect all relevant GitHub branches, open PRs, latest commits, CI results, and deployment status. Identify the active working branch from the current task; never assume `main`.
3. **Capture the work:** summarize decisions, completed work, exact next task, changed files, known limitations, test outcomes, failures, deployment blockers, and any user decision still needed.
4. **Check for local-only work:** if the available environment cannot inspect the desktop working tree, explicitly record **“local working tree not inspected; unpushed edits cannot be ruled out.”** Never imply that remote checks prove local files were saved.
5. **Update recovery files:** update this protocol only if needed, update `docs/PROJECT_CHECKPOINT_2026-10-09.md` with a timestamp in ICT (UTC+7), and maintain the root `RESUME.md` as the short entry point. The checkpoint must name the active branch, verified remote HEAD, work completed, tests and links, deployment state, local-only uncertainty, and exact next action.
6. **Validate safely:** run relevant tests when the available tools support it. Clearly distinguish tests actually run from prior CI results and from tests not run. Do not trigger unnecessary paid builds or expose secrets.
7. **Save to the intended branch:** commit the checkpoint/recovery files and all relevant code changes that are accessible and reviewed. Never claim inaccessible desktop-only changes were committed. Do not merge a PR without explicit approval.
8. **Verify the remote save:** re-read the branch head and checkpoint from GitHub after the commit. Confirm the expected commit SHA and links. Check CI independently; if a workflow has not run for the latest commit, say so.
9. **Respond with a compact recovery receipt:** include branch, commit SHA/link, Vietnam-time save timestamp, test/CI state, deployment state, any unsaved/local-only risk, and the exact one-line instruction for resuming.
10. **If blocked:** do not silently stop or claim success. Save all safe, accessible recovery notes possible; state what could not be saved, why, and the single action needed to unblock.

### Required success condition

“Save mcp” is complete only when the remote checkpoint/recovery files have been re-read from the intended branch and their commit is confirmed. If code or local changes could not be saved, report a **partial save** and identify the risk plainly. A checkpoint is not a substitute for committing accessible code changes.

### Standard resume instruction

Use the following as the default next-chat instruction, updating the branch/task only when verified:

> Resume Know Yourself. First read `RESUME.md` and the project checkpoint on the latest verified `feature/live-api-v1` branch head. Check all relevant branch heads, open PRs, CI, and deployment status. Preserve local desktop files; do not reset, overwrite, or merge. Continue from the checkpoint’s exact next action and do not repeat verified work.

## Know Yourself development and deployment workflow — confirmed 2026-10-09

### Platform responsibilities
- **Lovable is the primary live web-app build/preview environment** used for the Know Yourself interface. Use it for the interface workflow the user is actually using.
- **GitHub is the source-control and recovery record**: keep reviewed work and checkpoints on the intended branch; never assume `main` is the latest branch.
- **GitHub Actions is the automated test/CI layer**. CI success proves only the tests that ran; it does not prove the live Lovable app or real model output works.
- **Supabase is the backend/data layer** for the project, including the configured database and backend functions.
- **Vercel is not part of the routine build/test loop by default.** Do not trigger Vercel builds, troubleshoot its build limits, or make Vercel the assumed live interface path unless a separate Vercel deployment is explicitly required and verified.

### Standard work cycle
1. Resume from `RESUME.md` and the latest verified checkpoint/active feature branch.
2. Make or guide interface changes through the established Lovable workflow only when the user has explicitly authorized Lovable use; do not infer approval from “proceed.”
3. Keep the code and decisions synchronized to the intended GitHub branch, taking care not to overwrite desktop-only work.
4. Run relevant GitHub Actions tests and report exactly what passed or remains untested.
5. Verify the Lovable preview/live app separately when interface behaviour needs checking; do not equate a green CI run with a live-app check.
6. Verify Supabase-backed behaviour separately when backend/data behaviour is in scope.
7. Use Vercel only when there is a specific, confirmed reason to deploy there. A Vercel build-rate-limit or access issue is not automatically a code/CI failure and should not block unrelated development.

### Safety and truthfulness
- Do not assume Lovable's running app automatically contains every latest GitHub commit; verify the actual synchronization/source state before claiming it does.
- Do not claim an app is live, deployed, or tested unless that exact state was checked.
- Do not expose secrets or trigger unnecessary paid builds.
- Do not merge PR #1 without explicit user approval.
