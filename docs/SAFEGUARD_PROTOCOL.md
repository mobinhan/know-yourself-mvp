# Know Yourself Safeguard Protocol

Status: proposed implementation contract, pending CI and review. This document defines rules; it does not claim that application persistence or automatic ChatGPT session startup is already operational.

## A. Assistant / engineering operating protocol

At the start of a KY session, read `RESUME.md`, inspect the live repository and relevant pull requests/checks, reconcile any stale checkpoint, then continue from the latest verified state.

When the user identifies an error, the assistant discovers an earlier error, or work repeats/fails:
1. Stop repeating the disputed claim or action.
2. State the specific error without defensiveness.
3. Verify against the correct source of truth: deterministic chart output, cited knowledge/evidence, live code, test results, or explicit user preference.
4. Correct the answer/code and investigate the cause.
5. Add a focused regression test or process rule when practical.
6. Autosave meaningful durable changes to GitHub, fetch them back, and report commit plus verification status.
7. Do not claim tests, deployment, merges, or persistence that were not independently verified.

Check prior attempts before restarting. Do not create noisy commits for inconsequential wording. Pause for major architectural, licensing, commercial, irreversible, or data-loss decisions. Never overwrite or force-push uncertain work.

Important: documentation does not itself trigger tools or force a fresh ChatGPT conversation to run this procedure. Each session must have tool access and actually execute the recovery steps.

## B. Product safeguards (Know Yourself 3framework)

### Layer 1 — Canonical Chart + Immutable Evidence
- Deterministic mechanics remain the authority for chart facts.
- Evidence and knowledge claims must retain stable IDs and source/provenance references.
- A user correction or AI answer must never silently overwrite canonical chart mechanics or source evidence.
- Corrections to mechanics require independent verification, regression coverage, and an explicit reviewed change.

### Layer 2 — Adaptive User Context
- Keep user-specific preferences and experience separate from chart truth and shared knowledge.
- Do not turn a personal disagreement or individual interpretation into a universal fact.
- Persist correction records only when the required persistence consent is present; store a concise summary and references, not unnecessary raw conversation or sensitive data.
- User-specific records must not be injected into another user's context.

### Layer 3 — ChatGPT live reasoning
- Distinguish reported feedback, verified fact, source teaching, and reflective interpretation.
- If evidence is insufficient or conflicting, state the limitation and do not guess.
- A correction is initially a report, not proof. Verify before promoting it to a shared knowledge or mechanics change.
- Do not add a separate critic/reasoning layer to the active 3framework path. Existing validation and evidence-ID checks remain ordinary safeguards, not an extra product layer.

## C. Correction record lifecycle

1. `reported`: feedback captured, not yet verified.
2. `under_review`: being checked against evidence and affected code/records.
3. `verified`: a reviewer has recorded a resolution and supplied evidence references.
4. `rejected`: review found the report unsupported or incorrect; retain a brief reason when appropriate.
5. `superseded`: a later reviewed record replaces it; retain the link to the successor.

Each record should include an identifier, category, scope, concise summary, reporter, source/incident reference, consent state, lifecycle status, timestamps, evidence references, reviewer/resolution when verified, and related regression test when applicable.

The current implementation is a pure validation policy only. It does not write to a database, change the knowledge base, update the chart engine, or perform hidden learning. Persistence and user-facing feedback capture must be implemented separately after review of the existing Supabase contracts and access controls.

## D. Regression requirements

At minimum, tests must establish that:
- A correction defaults to `reported`, never silently `verified`.
- Verification requires a reviewer, resolution, and evidence reference.
- Canonical-mechanics corrections cannot directly mutate the chart source of truth.
- Missing consent blocks persistent correction records.
- User-specific feedback is not promoted into shared knowledge automatically.
- Invalid categories, statuses, scopes, or missing incident references fail closed.
- A resolved material defect gets a targeted regression test where practical.

## E. Completion criteria

This safeguard is not considered operational until:
- policy tests pass in GitHub Actions;
- changes are reviewed and merged under the repository's normal process;
- persistence design and access control are separately validated before any database writes;
- recovery is tested from a fresh ChatGPT conversation;
- any remaining manual steps and limitations are clearly documented.
