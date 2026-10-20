# Know Yourself — Resume Here

## Latest report-marketplace checkpoint — 2026-10-20 10:50 ICT

- Active report work: `feature/report-marketplace-contracts`, PR #25 (draft, open, unmerged): https://github.com/mobinhan/know-yourself-mvp/pull/25
- Current branch head before this checkpoint update: `19bbd16030a94d086bd95ee57e73017a8f917fde`.
- Added `docs/reports/life-purpose-direction-specification.md`: flagship paid-report chapters, scope boundaries, 3Framework constraints, and pilot acceptance criteria.
- Added `docs/reports/report-pipeline-output-contract.md`: generation → section validation → envelope assembly → persistence → online/PDF rendering → parity checks.
- Added pure adapter `api/report_pipeline.py` and `tests/test_report_pipeline.py`: normalizes existing section responses into the validated report envelope, enforces stable chapter order, permits omitting life cycles only when unavailable, and rejects unresolved validation warnings or evidence IDs outside the supplied bundle.
- Added `.github/workflows/report-contracts.yml`. **GitHub Actions run #13 passed** on commit `19bbd16030a94d086bd95ee57e73017a8f917fde`: report contract tests and report pipeline adapter tests both passed. Run: https://github.com/mobinhan/know-yourself-mvp/actions/runs/39366288015
- CI exposed a false-negative test caused by a shallow-copy fixture sharing nested canonical facts with the trusted chart; fixed the fixture to deep-copy the chart. The implementation was not weakened.
- Existing `api/report_contracts.py` and `tests/test_report_contracts.py` remain part of PR #25.
- Live schema rechecked read-only: `ky_charts` and `ky_reports` exist; no report artifact table or verified private Storage bucket was found. A read-only query returned no saved rows in `ky_charts`, so there is not yet a saved canonical chart available for a real pilot in this Supabase project.
- Current live Render service remains on `deploy/render-api`, auto-deploy disabled. No migration, merge, or deployment was performed.
- **Next exact task:** wire trusted chart ownership + exact evidence provenance into the server-side report-generation/persistence path. Only after that, add private PDF artifact storage and online/PDF parity tests, then run a pilot with a real saved canonical chart. Mock tests alone do not satisfy the pilot.
- Preserve 3Framework. No separate critic/reasoning layer. No Vercel. No Lovable edits/credits without specific approval. No merge, production migration, or deployment without explicit approval.

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

## Historical checkpoint — 2026-10-15: Render API startup recovered

- Repository: https://github.com/mobinhan/know-yourself-mvp
- API branch: `deploy/render-api`; commit `4762cd6968040034273e4203db8071df7f039725`.
- Render service `know-yourself-api`: https://know-yourself-api.onrender.com. Render reported live on 2026-10-15 at 09:06:44 UTC.
- Startup-import fixes added repository root and `engine/` to `sys.path` before importing `engine.temporal_ephemeris`. A stale-instance traceback was historical; the later instance started successfully.
- No endpoint-level tests were run at that checkpoint. Startup/live status did not prove route functionality or Supabase integration. User was to verify API behaviour from their side.

## Latest checkpoint — 2026-10-16: Report-platform direction confirmed

### Product strategy — treat this as the controlling product decision

**Know Yourself is an AI-powered Human Design analysis and report platform, not primarily an AI chat app.** It transforms verified chart data and relevant personal context into structured, personalized reports across multiple areas of life. Conversational AI can help users explore or apply report insights, but chat is a supporting feature, not the core proposition.

The first flagship is **Life Purpose & Direction**, with three access/content levels:

1. **Basic Human Design Report — free PDF:** a concise, genuinely useful introduction.
2. **Complete Report Preview — free PDF:** the full report structure, selected sections in full, and other sections excerpted/withheld; it must still provide real value rather than act as a brochure.
3. **Full Life Purpose & Direction Report — paid later:** the full agreed content, available as an interactive online report and downloadable PDF.

These three levels apply to the first flagship only; they do not limit the future catalogue. The report catalogue can expand across Career & Purpose, Money & Prosperity, Relationships & Love, Life Direction & Major Decisions, Self & Personal Development, and Timing & Life Events. The website currently presents several future report categories as “Coming Soon”; only Life Purpose & Direction is featured as available. Avoid presenting the catalogue as final or limited to five products.

- Individual purchases are the current direction; no mandatory subscription.
- Defer pricing, payment provider, country-adjusted pricing, checkout and entitlement implementation until the content/product scope is agreed.
- Do not claim report generation, PDF downloads, accounts, checkout, or chart calculation are operational unless separately verified.

### Architecture constraints

- Preserve the confirmed 3framework: (1) canonical chart plus immutable/source-linked evidence, (2) adaptive user context kept separate from chart facts, (3) direct ChatGPT reasoning/synthesis. No separate critic or extra reasoning layer in the active path.
- Keep the existing deterministic chart engine, Render API, Supabase and repository architecture. No architecture reset.
- Build toward a reusable report-generation pipeline, not a separate bespoke AI implementation for every report. Each report definition will eventually specify purpose, content outline/version, evidence/context requirements, generation instructions, completeness/validation rules, access level, and online/PDF rendering.
- Basic and preview are content/access variants of the flagship report, not the whole platform architecture.
- User explicitly said to pause Lovable work until report scope is defined internally. **Do not spend Lovable credits, send Lovable prompts, or make Lovable edits until the user separately authorizes that specific work.**

### Website state

- Lovable project: `c1949884-6e4e-489f-b72a-381241c63117`
- Editor: https://lovable.dev/projects/c1949884-6e4e-489f-b72a-381241c63117
- Preview: https://id-preview--c1949884-6e4e-489f-b72a-381241c63117.lovable.app
- Last known website commit after visual polish and route preparation: `5ca630ab588f3fc80d34f89371fc63fd08f538ea`.
- Project was last confirmed unpublished. Pages/routes prepared: `/`, `/about`, `/my-chart`, `/account`, `/reports`. My Chart and Account are preparation/coming-soon pages, not working chart-generation or authentication flows.
- The catalogue has Life Purpose & Direction featured and future categories marked “Coming Soon”. No report preview has been built.
- Latest website edits used 1.00 and 1.44 Lovable credits for visual polish and route preparation respectively. The earlier balance was 2.44 before those tasks; current balance has not been independently checked.

### Backend and report contract state

- Repository: https://github.com/mobinhan/know-yourself-mvp
- Report work branch: `feature/report-marketplace-contracts`
- Draft PR #25: https://github.com/mobinhan/know-yourself-mvp/pull/25 — “Implement report payload assembly and validation”; base `deploy/render-api`. Keep it draft until the full pipeline test exists.
- Last known branch head before this checkpoint: `5f6a631c57607ecbffe001d1479ad87e60d91c3b`.
- Four files in the report-contract change: `api/report_contracts.py`, `tests/test_report_contracts.py`, `docs/REPORT_MARKETPLACE_V1.md`, `docs/REPORT_MARKETPLACE_COUNTRY_PRICING.md`.
- The provider-independent report envelope assembly/validation contract exists in code, but is **not wired** to live generation, persistence or a production report endpoint. Tests were written but not verified as executed.
- Supabase project `djtpqqjenmcsrdcguttk`; existing tables include `ky_charts`, `ky_profiles`, `ky_saved_insights`, etc. No report-marketplace tables, `ky_entitlements`, or Storage buckets were found in the last inspection. Verify current state before schema changes.
- Render API: https://know-yourself-api.onrender.com. Startup was recovered, but end-to-end report generation and persistence remain unverified.
- The agreed request pipeline direction is authenticated ownership check → rule-based routing, Flash classification for the gray zone with configurable escalation threshold → escalated requests use context assembler plus reasoning model; simple requests use Flash with minimal context. Keep PR #25 draft until full pipeline tests exist.

### Exact next step on resume

1. **Do not touch Lovable yet.** First define the flagship Life Purpose & Direction report internally: target user/outcome, exact sections, what is included in Basic vs Complete Preview vs Full, evidence/context required per section, safety/uncertainty boundaries, and completeness criteria.
2. Review `docs/REPORT_MARKETPLACE_V1.md` and the current report contract on `feature/report-marketplace-contracts`; compare them with the newly confirmed report-first strategy and make a scoped content specification before implementation.
3. Verify current GitHub branch heads, PR #25 status, CI results and Render state before engineering work. Do not assume any historical SHA or test status is current.
4. Then test and extend the reusable report pipeline end-to-end (request → authenticated ownership → routing → context/evidence assembly → direct synthesis → validation → persistence/versioning → online/PDF rendering). Keep payment, pricing and entitlements deferred until report scope and pipeline are validated.
5. No merge or deployment changes without the established approval/safety rules. Never claim tests, endpoint behaviour, or publication unless independently verified.

**Cross-device resume phrase:** `Resume KY` or `Open MCP KY`. Start with this report-first checkpoint, not the older migration-audit task, unless a fresh repository check shows a higher-priority blocker.
