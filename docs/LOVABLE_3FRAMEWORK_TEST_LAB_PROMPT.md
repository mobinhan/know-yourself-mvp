# Lovable build prompt — Know Yourself 3Framework Testing Lab

Build a focused web application called **Know Yourself — 3Framework Testing Lab**. This is a testing workbench for the existing Know Yourself repository, not a replacement for the Know Yourself app and not a new AI architecture.

## Non-negotiable constraints
- Preserve the existing 3framework exactly:
  1. Layer 1 — Canonical Chart + Immutable Evidence.
  2. Layer 2 — Adaptive User Context.
  3. Layer 3 — ChatGPT live reasoning.
- The 3Framework Orchestrator (3FO) is a cross-cutting coordinator, NOT a fourth layer.
- Do not add a separate critic/reasoning layer.
- Do not invent chart facts, sources, API endpoints, authentication, or backend behaviour.
- Do not put secrets in browser code.
- Do not connect to production data or persist personal/sensitive data until the existing authentication, consent, and backend contracts have been reviewed and explicitly configured.
- Do not claim a test passed merely because a UI interaction succeeded.
- Do not deploy or publish automatically.
- Keep the existing GitHub repository as the source of truth. Do not overwrite the current Know Yourself app or its main branch.
- If backend integration is not available, show a clearly labelled **Demo / disconnected** state and use only synthetic fixtures. Never present fixture responses as real framework outputs.

## Product goal
Provide a warm, uncluttered interface where the owner can converse naturally, inspect the three-layer inputs used for an answer, record corrections, and run repeatable regression cases. The interface should be useful on Android/mobile as well as desktop.

## Main screens
1. **Conversation Lab**
   - Familiar chat layout, question input, conversation history, and clear loading/error states.
   - Show whether the current response is Live, Fixture/Demo, or Disconnected.
   - Do not implement canned Human Design answer templates as if they were live reasoning.
   - Define a typed adapter interface for the real answer-generation service, but do not invent a live endpoint. If the real service contract is not configured, disable live mode and explain what's needed.

2. **Three-Layer Inspector**
   - Expandable panels for Layer 1 evidence, Layer 2 retrieved context, and Layer 3 answer/reasoning result.
   - Layer 1 shows chart facts, source/evidence IDs, engine/version metadata, and missing/conflicting evidence.
   - Layer 2 shows only context actually supplied to the request, with origin/status/consent metadata where available; redact secrets and sensitive fields.
   - Layer 3 shows the answer plus evaluation outcomes; do not expose hidden chain-of-thought. Show concise evidence-grounded rationale/decision summaries only.
   - Clearly label unavailable fields as unavailable, not verified or passed.

3. **Correction Governance**
   - Record a proposed correction with category, scope, concise summary, incident/source reference, consent state, and status.
   - Status lifecycle: reported, under_review, verified, rejected, superseded.
   - Default to reported. Never auto-verify.
   - Never allow a correction to directly mutate canonical chart mechanics or shared knowledge. Require review and evidence references for verification.
   - Until persistence/auth is configured, keep corrections in a clearly labelled local demo session and warn they are not durable.

4. **Regression Library**
   - List and run versioned test cases.
   - Include initial cases for: canonical facts remain authoritative; user context cannot overwrite chart facts; relevant correction is applied in a later interaction; generic mechanical disclaimer does not recur when not materially needed; genuine uncertainty is handled accurately; irrelevant personal context is not injected; missing evidence fails closed.
   - Each test case has input fixture, expected invariants, observed result, pass/fail/blocked status, timestamp, and implementation/version identifier.
   - A test is blocked if it cannot exercise the real service; do not convert blocked to pass.

5. **Run History**
   - Show recent runs, failed assertions, and regression trends.
   - Allow exporting sanitized JSON/Markdown test reports.
   - Do not store full sensitive conversations by default.

## Visual design
- Warm, calm, premium, human-centred interface; ivory background, restrained navy, soft neutral cards, accessible contrast, readable typography.
- Mobile-first responsive layout. Keep normal conversation clean; make technical inspection optional and expandable.
- Avoid overly mechanical forms and dashboard clutter. Make it feel like a thoughtful product, not a generic QA console.

## Technical approach
- Start by inspecting the connected GitHub repository and its existing code before editing.
- Prefer a separate Testing Lab surface/project that can be safely linked to the repository; do not replace or fork production behaviour blindly.
- Create typed interfaces for:
  - Canonical evidence packet.
  - Adaptive context packet.
  - 3FO request/response envelope.
  - Correction record.
  - Regression test case and run result.
- Reuse the existing contract documented in `docs/THREE_FRAMEWORK_ORCHESTRATOR.md` and prototype `supabase/threeframework-orchestrator.mjs` if present in the connected branch. Do not duplicate or silently diverge from them.
- Inspect the real frontend and backend contracts first. The current repository's `index.html` answer path must be audited carefully: do not assume it is live LLM reasoning merely because it fetches chart context.
- Use adapters with explicit disconnected states rather than fabricated API routes. Do not enable a cloud database or add a new backend until approved.
- Add component/unit tests for UI state, status labels, correction lifecycle, and regression-result rules.
- Add a README describing which capabilities are real, demo-only, blocked, and what configuration is required.
- Before finishing, provide a concise change summary, files changed, tests actually run with results, unresolved integration blockers, and any credit-consuming or deployment actions that would need explicit approval.

## Acceptance criteria
- The UI distinguishes Live, Demo/Fixture, Disconnected, Pass, Fail, and Blocked unambiguously.
- It never reports a fixture as a live 3framework result.
- Layer 1 and Layer 2 remain separate in the request model.
- Corrections cannot directly overwrite canonical chart facts.
- Regression failures are reproducible and exportable.
- No production connection, data persistence, or deployment occurs without the required configuration and approval.
