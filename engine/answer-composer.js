const MAX_ANSWER_CHARS = 12000;

export function composeAnswer({ reasoningInput, synthesis }) {
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      answer: "I don't have enough verified information to answer that reliably yet.",
      factual_basis: [],
      knowledge_basis: [],
      interpretation: "",
      limitations: reasoningInput?.missing_evidence_targets ?? []
    };
  }

  if (!synthesis || typeof synthesis.answer !== "string" || !synthesis.answer.trim()) {
    throw new Error("reasoning synthesis must contain an answer");
  }

  const evidenceIds = new Set((reasoningInput.evidence ?? []).map(x => x.id));
  const knowledgeIds = new Set((reasoningInput.knowledge ?? []).map(x => x.id));

  const factual_basis = [...new Set(synthesis.factual_basis ?? [])]
    .filter(id => evidenceIds.has(id));
  const knowledge_basis = [...new Set(synthesis.knowledge_basis ?? [])]
    .filter(id => knowledgeIds.has(id));

  const answer = synthesis.answer.trim();
  if (answer.length > MAX_ANSWER_CHARS) {
    throw new Error("reasoning synthesis exceeds answer length limit");
  }

  return {
    answer,
    factual_basis,
    knowledge_basis,
    interpretation: typeof synthesis.interpretation === "string" ? synthesis.interpretation.trim() : "",
    limitations: Array.isArray(synthesis.limitations) ? synthesis.limitations : []
  };
}

export function buildReasoningPromptInput(reasoningInput) {
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      mode: "insufficient_evidence",
      question: reasoningInput?.question ?? "",
      missing_evidence_targets: reasoningInput?.missing_evidence_targets ?? []
    };
  }

  return {
    mode: "grounded_reasoning",
    question: reasoningInput.question,
    question_context: reasoningInput.question_context,
    evidence: reasoningInput.evidence,
    knowledge: reasoningInput.knowledge,
    instructions: [
      "Answer the user's question naturally and directly.",
      "Use supplied evidence as the only source of chart mechanics.",
      "Use controlled knowledge to explain meaning; do not reproduce source text.",
      "Separate mechanical facts from interpretation.",
      "Do not calculate, infer, or invent Human Design mechanics.",
      "If the evidence does not support a claim, do not make the claim.",
      "For timing, use only supplied temporal evidence."
    ]
  };
}
