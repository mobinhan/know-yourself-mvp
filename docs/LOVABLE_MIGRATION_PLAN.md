# Know Yourself — Lovable Migration Plan

**Status:** Option A selected by user: preserve the existing implementation and migrate deliberately.  
**Date:** 2026-10-10  
**Repository:** `mobinhan/know-yourself-mvp`  
**Active branch:** `feature/live-api-v1`

## Non-negotiable constraints

- Do not create a Lovable project, send a Lovable agent prompt, run a Lovable build, or take any potentially credit-consuming action without specific explicit user approval after explaining necessity, alternatives, and estimated cost (or stating cost is unknown).
- Do not use Vercel.
- Preserve the active 3framework: (1) canonical chart + source-linked evidence, (2) adaptive user context, (3) direct ChatGPT synthesis. No separate critic in the active path.
- Do not merge PR #1 without explicit user approval.
- Keep GitHub as source of truth for the existing engine and backend contracts. Do not replace or rebuild them just to fit a UI framework.

## Repository inventory confirmed from GitHub

- `index.html` is a large, self-contained V22 web app (~128 KB) with inline styling and application JavaScript; it references `/web/app.js` and `/web/sw.js`.
- The HTML uses these backend routes:
  - `GET /v1/birthplaces/search?q=...`
  - `GET /v1/birthplaces/timezone?latitude=...&longitude=...&date=...&time=...`
  - `POST /v1/charts`
  - `POST /v1/charts/{chart_id}/today`
  - `POST /v1/charts/{chart_id}/questions/context`
  - `GET /v1/knowledge/gates` and `GET /v1/knowledge/gates/{gate}`
  - `GET /v1/knowledge/channels` and `GET /v1/knowledge/channels/{channel}`
- The Python API is implemented in `api/index.py`, using the deterministic engine in `engine/`; AI interpretation is in `api/interpretation_provider.py`.
- `requirements.txt` includes `pyswisseph` and `timezonefinder`.
- The active architecture contract is `engine/THREE_FRAMEWORK.md`.
- The repository README states Vercel is excluded and Lovable is the intended interface/preview environment.

## Safest migration strategy

### Phase 0 — Read-only compatibility audit (no Lovable credits)
1. Inventory every tracked frontend asset and all runtime/deployment configuration.
2. Confirm whether `/web/app.js`, `/web/sw.js`, CSS/assets, and all API entrypoints exist on the active branch.
3. Map each existing UI view and interaction to API calls and deterministic engine contracts.
4. Check the current CI state and relevant test coverage.
5. Determine a deployable architecture that supports the existing Python API/runtime and does not assume Lovable's default TypeScript stack can execute Python.

### Phase 1 — Integration decision (no changes yet)
- Prefer preserving the current working frontend and API as the baseline.
- Do not assume that connecting GitHub in Lovable imports the existing repository; verify the supported workflow and current account/project capabilities first.
- If Lovable requires a new repo, keep it separate during migration and avoid overwriting the current repository.
- Choose between (a) bringing the existing frontend into a new Lovable-managed project, (b) incrementally rebuilding only the UI while preserving API contracts, or (c) retaining the current UI and using Lovable later for targeted UI development. Make the choice based on a file/runtime compatibility audit, not convenience.

### Phase 2 — Minimal, reversible Lovable pilot (requires separate explicit user approval)
- Create a project only after the audit and a scoped migration brief are ready.
- Use a single, small pilot: shell/navigation and one non-destructive chart-entry flow, or another specifically selected slice.
- Avoid implementing the whole app in one prompt.
- Before action, tell the user why Lovable is needed, the no-credit alternatives, and the estimated credit cost if available (otherwise say unknown).
- Review diffs, verify that canonical API contracts remain intact, and test the result before any next credit-consuming action.

### Phase 3 — Incremental integration and verification
- Keep chart calculation deterministic and server-side where required.
- Keep OpenAI credentials out of the browser and repository.
- Validate birthplace/timezone, chart creation, gate/channel exploration, transit/today and contextual-question flows against the existing API.
- Test mobile and desktop layouts, error states, and API-unavailable states.
- Do not call the app live or complete until actual preview/runtime behaviour and relevant tests have been checked.

## Current blocker / next action

The read-only inventory has confirmed the main HTML, API entrypoint, interpretation provider and architecture contract. A complete asset/runtime audit is still needed, especially for `/web/app.js`, `/web/sw.js`, API deployment configuration and any platform-specific routing. Continue that audit without Lovable credits. No Lovable project has been created and no credit-consuming action has been taken.


## Audit finding — unresolved frontend asset references

The current `index.html` references `/web/app.js` and registers `/web/sw.js`, but direct checks on `feature/live-api-v1` returned 404 for both `web/app.js` and `web/sw.js`. The HTML contains substantial inline JavaScript as well, so this finding alone does not prove the UI is wholly broken; however, the missing referenced assets must be reconciled before a migration or live-state claim. No standard `package.json`, `Dockerfile`, `render.yaml`, `netlify.toml`, or `api/requirements.txt` was found at the tested root paths. The root `requirements.txt` contains `pyswisseph` and `timezonefinder`. Continue inventorying the tracked tree and API hosting assumptions before choosing the migration mechanics.
