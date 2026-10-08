const FORBIDDEN_MECHANICAL_CLAIMS = [
  "calculated by the ai",
  "the ai calculated",
  "the chart was calculated from this answer"
];

export function criticAnswer({ answer, factual_basis = [], knowledge_basis = [], suppliedEvidence = [], suppliedKnowledge = [] }) {
  const candidate = typeof answer === "string"
    ? { answer, factual_basis, knowledge_basis }
    : (answer ?? {});
  const issues = [];
  const evidenceIds = new Set(suppliedEvidence.map(x => x.id));
  const knowledgeIds = new Set(suppliedKnowledge.map(x => x.id));

  if (!candidate || typeof candidate.answer !== "string" || !candidate.answer.trim()) {
    issues.push("answer_missing");
  }

  for (const id of candidate.factual_basis ?? []) {
    if (!evidenceIds.has(id)) issues.push(`unknown_factual_basis:${id}`);
  }

  for (const id of candidate.knowledge_basis ?? []) {
    if (!knowledgeIds.has(id)) issues.push(`unknown_knowledge_basis:${id}`);
  }

  const text = String(candidate.answer ?? "").toLowerCase();
  for (const phrase of FORBIDDEN_MECHANICAL_CLAIMS) {
    if (text.includes(phrase)) issues.push(`forbidden_mechanical_claim:${phrase}`);
  }

  if (candidate.interpretation && typeof candidate.interpretation !== "string") {
    issues.push("invalid_interpretation");
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

export function finalizeAnswer(answer, evidence, knowledge) {
  const critic = criticAnswer({answer,suppliedEvidence:evidence,suppliedKnowledge:knowledge});
  return {...answer, critic};
}
