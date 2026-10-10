/**
 * 3Framework Orchestrator (3FO)
 *
 * Cross-cutting coordinator for the existing three layers, not a fourth layer.
 * This module prepares a bounded input packet for Layer 3 (live reasoning).
 * It does not calculate chart mechanics, generate the answer, persist context,
 * or claim to be wired into the production answer path.
 */
const OBJECT = (value) => value && typeof value === "object" && !Array.isArray(value);

export function prepare3FrameworkInput({
  question,
  canonicalEvidence,
  adaptiveContext,
  requestId = null,
} = {}) {
  const issues = [];
  if (typeof question !== "string" || !question.trim()) issues.push("question_required");
  if (!OBJECT(canonicalEvidence)) issues.push("canonical_evidence_required");
  if (!OBJECT(adaptiveContext)) issues.push("adaptive_context_required");

  if (issues.length) {
    return { ready: false, issues, input: null };
  }

  const evidence = {
    chart_facts: Array.isArray(canonicalEvidence.chart_facts) ? canonicalEvidence.chart_facts : [],
    evidence_refs: Array.isArray(canonicalEvidence.evidence_refs) ? canonicalEvidence.evidence_refs : [],
    source_version: canonicalEvidence.source_version ?? null,
  };

  // Context is passed separately; it can inform personalization but never
  // replace or mutate canonical chart evidence.
  const context = {
    preferences: OBJECT(adaptiveContext.preferences) ? adaptiveContext.preferences : null,
    memories: Array.isArray(adaptiveContext.memories) ? adaptiveContext.memories : [],
    recent_conversations: Array.isArray(adaptiveContext.recent_conversations)
      ? adaptiveContext.recent_conversations : [],
    saved_insights: Array.isArray(adaptiveContext.saved_insights) ? adaptiveContext.saved_insights : [],
  };

  return {
    ready: true,
    issues: [],
    input: {
      schema_version: "ky-3framework-input-v1",
      request_id: requestId,
      question: question.trim(),
      layers: {
        layer_1_canonical_evidence: evidence,
        layer_2_adaptive_user_context: context,
        layer_3_live_reasoning: {
          instruction: "Answer the user's question naturally using Layer 1 as chart/evidence authority and Layer 2 only as relevant user-specific context. Do not invent facts. State uncertainty only when it materially affects the answer."
        }
      },
      invariants: {
        canonical_evidence_is_authoritative: true,
        user_context_cannot_override_chart_facts: true,
        reasoning_is_not_a_separate_critic_layer: true,
        orchestrator_is_not_a_fourth_framework_layer: true
      }
    }
  };
}
