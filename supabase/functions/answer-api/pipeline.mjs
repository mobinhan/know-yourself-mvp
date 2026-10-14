/**
 * Know Yourself server-side answer pipeline.
 *
 * Provider-neutral orchestration. The deployed Edge Function adapter must inject
 * authenticated Supabase access, trusted server-role retrieval/persistence, model
 * adapters, and the provider's tokenizer. No provider credentials belong here.
 */
import { assembleContext } from "../user-data-api/context-assembler.mjs";

const DEFAULTS = Object.freeze({
  escalationThreshold: 0.72,
  maxReasoningTokens: 4000,
  maxReasoningTurns: 12,
  maxFlashTokens: 700,
  summaryTurnThreshold: 30
});

const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|thanks|thank you|good morning|good evening)[!. ]*$/i,
  /^(what is|what's|define|explain) human design\??$/i,
  /^(what does (a )?(gate|channel|center|centre) mean)\??$/i
];
const ESCALATE_PATTERNS = [
  /\b(my chart|my design|my authority|my profile|my gates|my channels|my centres|my centers)\b/i,
  /\b(transit|saturn return|uranus opposition|chiron return|solar return|life cycle|life cycles)\b/i,
  /\b(compare|compatib|relationship|connection chart|timing|when will|career decision|should i)\b/i,
  /\b(why do i|how does my|based on my|given my)\b/i
];

export function routeQuestionByRules(question) {
  const q = String(question ?? "").trim();
  if (SIMPLE_PATTERNS.some(pattern => pattern.test(q))) {
    return { route: "simple", confidence: 0.99, reason: "rule_simple" };
  }
  if (ESCALATE_PATTERNS.some(pattern => pattern.test(q))) {
    return { route: "escalate", confidence: 0.99, reason: "rule_personal_or_complex" };
  }
  return { route: "gray_zone", confidence: null, reason: "rule_gray_zone" };
}

function safeMetricLog(logger, event) {
  // Whitelist telemetry fields. Never pass question, answer, chart, user ID,
  // conversation ID, memory values, or provider request/response bodies.
  const allowed = {
    event: event.event,
    trace_id: event.trace_id,
    route: event.route,
    route_reason: event.route_reason,
    classifier_confidence: Number.isFinite(event.classifier_confidence) ? event.classifier_confidence : null,
    threshold: event.threshold,
    measured_tokens: event.measured_tokens,
    budget_tokens: event.budget_tokens,
    recent_turns_included: event.recent_turns_included,
    turn_count: event.turn_count,
    summary_status: event.summary_status,
    summary_through_sequence: event.summary_through_sequence,
    critic_passed: event.critic_passed,
    outcome: event.outcome,
    duration_ms: event.duration_ms
  };
  logger(allowed);
}

function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export function createAnswerHandler(deps, config = {}) {
  const settings = { ...DEFAULTS, ...config };
  for (const name of [
    "authenticate", "getOwnedConversation", "getTurnCount", "loadMinimalContext",
    "loadFullContext", "flashAnswer", "flashClassify", "reasoningAnswer", "critic",
    "persistApprovedAnswer", "countTokens", "logger"
  ]) {
    if (typeof deps?.[name] !== "function") throw new TypeError("missing_pipeline_dependency:" + name);
  }
  if (settings.trustedSummaryEnabled && typeof deps.maybeSummarize !== "function") {
    throw new TypeError("trusted_summary_dependency_required");
  }

  return async function handleAnswerRequest(request) {
    const started = Date.now();
    const traceId = deps.createTraceId?.() ?? "trace-unavailable";
    let route = "unclassified";
    let routeReason = "not_started";
    let classifierConfidence = null;
    let turnCount = 0;
    let summaryStatus = "not_checked";
    let summaryThroughSequence = null;
    let measuredTokens = null;
    let budgetTokens = null;
    let recentTurnsIncluded = 0;
    let criticPassed = null;

    const log = (event, outcome) => safeMetricLog(deps.logger, {
      event, trace_id: traceId, route, route_reason: routeReason,
      classifier_confidence: classifierConfidence, threshold: settings.escalationThreshold,
      measured_tokens: measuredTokens, budget_tokens: budgetTokens,
      recent_turns_included: recentTurnsIncluded, turn_count: turnCount,
      summary_status: summaryStatus, summary_through_sequence: summaryThroughSequence,
      critic_passed: criticPassed, outcome, duration_ms: Date.now() - started
    });

    try {
      if (request.method !== "POST") {
        log("answer_pipeline_rejected", "method_not_allowed");
        return response(405, { error: "method_not_allowed" });
      }
      const user = await deps.authenticate(request);
      if (!user?.id) {
        log("answer_pipeline_rejected", "authentication_required");
        return response(401, { error: "authentication_required" });
      }

      let body;
      try { body = await request.json(); } catch {
        log("answer_pipeline_rejected", "invalid_json");
        return response(400, { error: "invalid_json" });
      }
      const conversationId = typeof body?.conversation_id === "string" ? body.conversation_id : "";
      const question = typeof body?.question === "string" ? body.question.trim() : "";
      if (!conversationId || !question || question.length > 12000) {
        log("answer_pipeline_rejected", "invalid_request");
        return response(400, { error: "invalid_request" });
      }

      // Ownership must be verified before private retrieval, model calls, summaries,
      // or persistence. The adapter must implement this with an owner-scoped query.
      const conversation = await deps.getOwnedConversation({ userId: user.id, conversationId });
      if (!conversation) {
        log("answer_pipeline_rejected", "conversation_not_owned_or_missing");
        return response(404, { error: "conversation_not_found" });
      }
      turnCount = await deps.getTurnCount({ userId: user.id, conversationId });
      if (!Number.isSafeInteger(turnCount) || turnCount < 0) throw new Error("invalid_turn_count");

      let summaryResult = null;
      if (settings.trustedSummaryEnabled && turnCount >= settings.summaryTurnThreshold) {
        // This dependency must be server-only and persist through the trusted-role RPC.
        summaryResult = await deps.maybeSummarize({
          userId: user.id,
          conversationId,
          conversation,
          turnCount,
          trustedServerRole: true
        });
        summaryStatus = summaryResult?.status ?? "skipped";
        summaryThroughSequence = Number.isSafeInteger(summaryResult?.throughSequence)
          ? summaryResult.throughSequence : null;
      } else {
        summaryStatus = settings.trustedSummaryEnabled ? "below_threshold" : "disabled";
      }

      let routeResult = routeQuestionByRules(question);
      if (routeResult.route === "gray_zone") {
        const classification = await deps.flashClassify({
          question,
          escalationThreshold: settings.escalationThreshold
        });
        classifierConfidence = Number.isFinite(classification?.confidence)
          ? Math.max(0, Math.min(1, classification.confidence)) : null;
        const validRoute = classification?.route === "simple" || classification?.route === "escalate";
        if (validRoute && classifierConfidence !== null &&
            classifierConfidence >= settings.escalationThreshold) {
          routeResult = { route: classification.route, confidence: classifierConfidence, reason: "flash_gray_zone_confident" };
        } else {
          // Ambiguity fails safe toward the evidence-rich route.
          routeResult = { route: "escalate", confidence: classifierConfidence, reason: "gray_zone_below_threshold_default_escalate" };
        }
      }
      route = routeResult.route;
      routeReason = routeResult.reason;

      let draft;
      let canonicalEvidence;
      let tokenMetrics;

      if (route === "simple") {
        const minimal = await deps.loadMinimalContext({ userId: user.id, conversation, question });
        canonicalEvidence = minimal.evidence ?? [];
        const flashPayload = {
          instructions: minimal.instructions ?? "Answer briefly. Do not invent or calculate chart mechanics.",
          question,
          evidence: canonicalEvidence,
          knowledge: minimal.knowledge ?? []
        };
        measuredTokens = deps.countTokens(JSON.stringify(flashPayload));
        budgetTokens = settings.maxFlashTokens;
        if (measuredTokens > budgetTokens) throw new RangeError("flash_context_exceeds_token_budget");
        tokenMetrics = { measured_tokens: measuredTokens, budget_tokens: budgetTokens, recent_turns_included: 0 };
        draft = await deps.flashAnswer({ context: flashPayload, maxTokens: budgetTokens });
      } else {
        const full = await deps.loadFullContext({
          userId: user.id, conversation, question, summaryResult
        });
        canonicalEvidence = full.evidence ?? [];
        const assembled = assembleContext({
          instructions: full.instructions ?? "Use canonical chart evidence; separate fact from interpretation.",
          question,
          canonicalChart: full.canonicalChart,
          evidence: canonicalEvidence,
          memories: full.memories ?? [],
          preferences: full.preferences ?? {},
          summary: full.summary ?? null,
          turns: full.turns ?? []
        }, {
          maxTokens: settings.maxReasoningTokens,
          maxTurns: settings.maxReasoningTurns,
          countTokens: deps.countTokens
        });
        measuredTokens = assembled.metrics.measured_tokens;
        budgetTokens = assembled.metrics.budget_tokens;
        recentTurnsIncluded = assembled.metrics.recent_turns_included;
        tokenMetrics = assembled.metrics;
        draft = await deps.reasoningAnswer({
          context: assembled.context,
          maxTokens: Math.max(1, budgetTokens - measuredTokens)
        });
      }

      // Both routes pass the same canonical-evidence critic before persistence.
      const criticResult = await deps.critic({ draft, canonicalEvidence, route, question });
      criticPassed = criticResult?.passed === true;
      if (!criticPassed) {
        log("answer_rejected_by_critic", "critic_rejected");
        return response(422, { error: "answer_failed_evidence_critic", trace_id: traceId });
      }

      const persisted = await deps.persistApprovedAnswer({
        userId: user.id,
        conversationId,
        question,
        answer: draft,
        criticResult,
        route,
        tokenMetrics,
        traceId
      });
      log("answer_pipeline_completed", "success");
      return response(200, {
        answer: draft.answer,
        route,
        trace_id: traceId,
        usage: {
          measured_tokens: measuredTokens,
          budget_tokens: budgetTokens,
          recent_turns_included: recentTurnsIncluded
        },
        critic: { passed: true },
        persisted: persisted === true
      });
    } catch (error) {
      const code = error instanceof RangeError ? error.message : "pipeline_failed";
      log("answer_pipeline_failed", code);
      if (error instanceof RangeError) return response(413, { error: code, trace_id: traceId });
      return response(500, { error: "answer_pipeline_failed", trace_id: traceId });
    }
  };
}

export { DEFAULTS as ANSWER_PIPELINE_DEFAULTS };
