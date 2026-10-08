import { finalizeAnswer } from "./answer-critic.js";

export function buildGroundedAnswer({ reasoningInput, draft }) {
  if (!reasoningInput?.ready_for_reasoning) {
    return finalizeAnswer({
      answer: "I don't have enough verified evidence to answer that reliably yet.",
      factual_basis: [],
      knowledge_basis: [],
      interpretation: "The required evidence is not currently available in the deterministic evidence layer.",
      limitations: reasoningInput?.missing_evidence_targets ?? []
    }, reasoningInput?.evidence ?? [], reasoningInput?.knowledge ?? []);
  }

  if (!draft || typeof draft.answer !== "string") {
    throw new Error("reasoning draft is required");
  }

  const allowedEvidence = new Set((reasoningInput.evidence ?? []).map(x => x.id));
  const allowedKnowledge = new Set((reasoningInput.knowledge ?? []).map(x => x.id));
  const factual_basis = [...new Set((draft.factual_basis ?? []).filter(id => allowedEvidence.has(id)))];
  const knowledge_basis = [...new Set((draft.knowledge_basis ?? []).filter(id => allowedKnowledge.has(id)))];

  return finalizeAnswer({
    answer: draft.answer,
    factual_basis,
    knowledge_basis,
    interpretation: draft.interpretation ?? "",
    limitations: draft.limitations ?? []
  }, reasoningInput.evidence ?? [], reasoningInput.knowledge ?? []);
}

export function createMockReasoningDraft(reasoningInput) {
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      answer: "I don't have enough verified evidence to answer that reliably yet.",
      factual_basis: [],
      knowledge_basis: [],
      interpretation: "The requested evidence is not currently available."
    };
  }

  const evidenceIds = (reasoningInput.evidence ?? []).map(x => x.id);
  const knowledgeIds = (reasoningInput.knowledge ?? []).map(x => x.id);
  const q = String(reasoningInput.question ?? "").trim();

  return {
    answer: `Based on your verified chart evidence, I can answer: ${q}`,
    factual_basis: evidenceIds,
    knowledge_basis: knowledgeIds,
    interpretation: "This is an interpretation of the supplied evidence and controlled knowledge, not a recalculation of the chart.",
    limitations: []
  };
}
