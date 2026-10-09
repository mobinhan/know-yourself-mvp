# Know Yourself — Cross-Device Continuity Protocol

**Applies to:** desktop and mobile ChatGPT work, GitHub, CI, and deployment.
**Purpose:** Resume safely without relying on conversational memory alone or overwriting newer work.

## Hardwired architecture decision — user confirmed 2026-10-09

- Know Yourself's active interpretation architecture is **3framework**, as explicitly confirmed by the user.
- The three layers are: (1) Canonical Chart + source-linked Evidence, (2) Adaptive User Context, (3) direct ChatGPT synthesis.
- The 5framework is comparison-only. Never silently blend it into the active path or invoke a separate interpretation critic, answer critic, reasoning adapter, or other post-synthesis reasoning layer from the 3framework provider.
- Normal response-schema validation, JSON normalization, and filtering returned evidence IDs to records actually supplied are allowed contract handling.
- The canonical implementation contract is `engine/THREE_FRAMEWORK.md`; also read the hardwired decision at the top of `RESUME.md`.
- If a future proposal would cross this boundary, stop and obtain an explicit architectural decision from the user first. “Proceed” is not authorization to change the architecture.

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
- Vercel is not an approved project deployment path. Do not invoke or troubleshoot Vercel unless the user explicitly reinstates it.

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

The desktop checkpoint commit `7e49fbdef140a1a79333235d891a40726ff9dc39` is on `feature/live-api-v1`, timestamped 15:53:15 ICT. Its associated Gate-line regression workflow run #18 passed. The latest known main-branch commit is different; do not treat `main` as a replacement for the feature branch. The open PR #1 remains unmerged. The repository's Vercel configuration has since been removed by explicit user decision. The external Vercel project/integration could not be accessed for deletion (403 scope authorization). Live interpretation has not been verified. Recheck all of these before acting because statuses can change.


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

## Know Yourself development and deployment workflow — confirmed 2026-10-09, updated 2026-10-09

### Platform responsibilities
- **Lovable is the primary live web-app build/preview environment** used for the Know Yourself interface. Use it for the interface workflow the user is actually using.
- **GitHub is the source-control and recovery record**: keep reviewed work and checkpoints on the intended branch; never assume `main` is the latest branch.
- **GitHub Actions is the automated test/CI layer**. CI success proves only the tests that ran; it does not prove the live Lovable app or real model output works.
- **Supabase is the backend/data layer** for the project, including the configured database and backend functions.
- **Vercel has been removed from the project workflow by explicit user decision.** `vercel.json` was deleted, Vercel-specific ignore/CI references were removed, and the repository documentation now identifies Lovable as the live app environment. Do not reintroduce Vercel configuration unless the user explicitly requests it. External Vercel account/project cleanup is still pending because the connected Vercel tool returned a 403 scope authorization error.

### Standard work cycle
1. Resume from `RESUME.md` and the latest verified checkpoint/active feature branch.
2. Make or guide interface changes through the established Lovable workflow only when the user has explicitly authorized Lovable use; do not infer approval from “proceed.”
3. Keep the code and decisions synchronized to the intended GitHub branch, taking care not to overwrite desktop-only work.
4. Run relevant GitHub Actions tests and report exactly what passed or remains untested.
5. Verify the Lovable preview/live app separately when interface behaviour needs checking; do not equate a green CI run with a live-app check.
6. Verify Supabase-backed behaviour separately when backend/data behaviour is in scope.
7. Do not use Vercel for this project. If the user later chooses to reinstate it, explicitly configure and validate the new deployment path then.

### Safety and truthfulness
- Do not assume Lovable's running app automatically contains every latest GitHub commit; verify the actual synchronization/source state before claiming it does.
- Do not claim an app is live, deployed, or tested unless that exact state was checked.
- Do not expose secrets or trigger unnecessary paid builds.
- Do not merge PR #1 without explicit user approval.


## Mandatory Lovable credit approval — read before any app work

- **Never amend the Lovable project, send a prompt to its agent, trigger a build, or take another action that may consume Lovable credits without the user's explicit permission for that specific work.** A general “proceed” is not approval to spend credits.
- Before asking for permission, state why a Lovable action is necessary, what alternatives can be completed through GitHub/offline tests/Supabase inspection without Lovable credits, and the expected credit cost if it can be estimated. Do not invent a cost estimate; say when it is unknown.
- Prefer repository inspection, code review, GitHub Actions, and offline tests first. Keep Lovable read-only unless explicit permission has been given.
- This restriction is also recorded in the project checkpoint under **Hard constraints and approvals**. Read `RESUME.md` and the latest checkpoint before acting.


## HARDWIRED MOBILE/DESKTOP PARITY — USER REQUIREMENT, 2026-10-09

**The user explicitly reports that work on mobile has been operating at a lower level than the current desktop work. This is a continuity failure to correct, not a reason to reduce scope. The same project state, architecture, standards, tools, and next-step discipline must carry across desktop and mobile.**

### Mandatory rules for every device and new MCP/chat session

1. **Start from the repository, not from a shallow conversational recap.** Read the latest verified `RESUME.md`, this protocol, the current project checkpoint, the architecture contract, and the relevant rubric before making a recommendation or editing code.
2. **Use the same engineering standard on mobile as desktop.** Continue at the recorded maturity level. Do not restart from beginner instructions, repeat completed work, simplify the architecture, omit existing safeguards, or substitute generic advice merely because the user is on a phone.
3. **Preserve the exact agreed architecture and constraints.** Active 3framework = canonical chart/source evidence → adaptive user context → direct ChatGPT synthesis. No separate critic in the active path. Lovable requires explicit specific approval and a cost/alternative explanation first. Vercel remains out of the workflow. Do not merge PR #1 without explicit approval.
4. **MCP is an execution and continuity mechanism, not a lower-capability mode.** When repository tools are available, inspect the actual files, branches, commits, PRs, and CI; make safe, reviewable GitHub changes where appropriate; verify them after writing. Do not only tell the user what they could do manually when the tools can safely do the work.
5. **Do not confuse device continuity with workspace continuity.** Mobile may not expose unpushed desktop files. Never claim those are saved; do not reset, overwrite, force-push, or merge while local-only changes may exist. Record that limitation and continue with verified remote work when safe.
6. **Continue autonomously until a real blocker or material decision.** Use the checkpoint's exact next action, run appropriate tests when possible, and update the checkpoint after meaningful work. Ask only when an architectural decision, authorization, credential, or inaccessible external state genuinely requires the user.
7. **Make progress visible and verifiable.** Report concrete changed files, commit SHA/link, CI results, and what remains unverified. Clearly distinguish completed implementation, mocked tests, real model quality, and live-app behaviour.
8. **Do not let a mobile handoff erase current work.** When the user says “continue on mobile,” “resume,” or “save mcp,” automatically retrieve this protocol and latest checkpoint first. Treat prior confirmed decisions as binding unless the user explicitly changes them.

### Required first response after a mobile/new-chat handoff

Briefly confirm the current verified branch/checkpoint, state the exact next engineering task, and proceed with the task rather than asking the user to re-explain the project. If live state cannot be verified, state the precise gap and do the safe work that remains possible.
