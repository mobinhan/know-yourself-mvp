const FORBIDDEN_MECHANICAL_CLAIMS = [
  "calculated by the ai",
  "the ai calculated",
  "the chart was calculated from this answer"
];

export function criticAnswer({ answer, suppliedEvidence = [], suppliedKnowledge = [] }) {
  const issues = [];
  const evidenceIds = new Set(suppliedEvidence.map(x => x.id));
  const knowledgeIds = new Set(suppliedKnowledge.map(x => x.id));

  if (!answer || typeof answer.answer !== "string" || !answer.answer.trim()) {
    issues.push("answer_missing");
  }

  for (const id of answer?.factual_basis ?? []) {
    if (!evidenceIds.has(id)) issues.push(`unknown_factual_basis:${id}`);
  }

  for (const id of answer?.knowledge_basis ?? []) {
    if (!knowledgeIds.has(id)) issues.push(`unknown_knowledge_basis:${id}`);
  }

  const text = String(answer?.answer ?? "").toLowerCase();
  for (const phrase of FORBIDDEN_MECHANICAL_CLAIMS) {
    if (text.includes(phrase)) issues.push(`forbidden_mechanical_claim:${phrase}`);
  }

  if (answer?.interpretation && typeof answer.interpretation !== "string") {
    issues.push("invalid_interpretation");
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

export function finalizeAnswer({ answer, evidence, knowledge }) {
  const critic = criticAnswer({answer,evidence,knowledge});
  return {...answer, critic};
}
