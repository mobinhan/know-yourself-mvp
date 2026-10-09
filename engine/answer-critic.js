const FORBIDDEN_MECHANICAL_CLAIMS = [
  "calculated by the ai",
  "the ai calculated",
  "the chart was calculated from this answer"
];

export function criticAnswer({ answer, factual_basis = [], knowledge_basis = [], relationship_basis = [], suppliedEvidence = [], suppliedKnowledge = [], suppliedRelationships = [] }) {
  const candidate = typeof answer === "string"
    ? { answer, factual_basis, knowledge_basis, relationship_basis }
    : (answer ?? {});
  const issues = [];
  const evidenceIds = new Set(suppliedEvidence.map(x => x.id));
  const knowledgeIds = new Set(suppliedKnowledge.map(x => x.id));
  const relationshipIds = new Set(suppliedRelationships.filter(x => x.status === "validated").map(x => x.id));

  if (!candidate || typeof candidate.answer !== "string" || !candidate.answer.trim()) {
    issues.push("answer_missing");
  }

  for (const id of candidate.factual_basis ?? []) {
    if (!evidenceIds.has(id)) issues.push(`unknown_factual_basis:${id}`);
  }

  for (const id of candidate.knowledge_basis ?? []) {
    if (!knowledgeIds.has(id)) issues.push(`unknown_knowledge_basis:${id}`);
  }

  for (const id of candidate.relationship_basis ?? []) {
    if (!relationshipIds.has(id)) issues.push(`unknown_relationship_basis:${id}`);
  }

  const text = String(candidate.answer ?? "").toLowerCase();
  const relationBasis = new Set(candidate.relationship_basis ?? []);
  const factualBasis = new Set(candidate.factual_basis ?? []);
  const crossMechanicsClaim = /\b(incarnation cross|cross of incarnation)\b/.test(text) &&
    (/\b(your|my|this)\s+(incarnation cross|cross)\b.{0,100}\b(is|includes|consists|formed|has|defined)\b/.test(text) ||
     /\b(personality sun|personality earth|design sun|design earth)\b/.test(text));
  if (crossMechanicsClaim && !factualBasis.has("E-CROSS")) {
    issues.push("missing_factual_basis:E-CROSS");
  }
  if (crossMechanicsClaim && !factualBasis.has("E-ACTIVATIONS")) {
    issues.push("missing_factual_basis:E-ACTIVATIONS");
  }
  const hasSpecificGate57Line4Claim = /\bgate\s*57\s*[.\/-]\s*4\b|\bgate\s*57\s+line\s+4\b|\bgate\s+57.{0,30}\bfourth line\b/.test(text);
  if (hasSpecificGate57Line4Claim && !knowledgeIds.has("EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001")) {
    issues.push("missing_knowledge_basis:EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001");
  }
  if (hasSpecificGate57Line4Claim && !relationBasis.has("REL-GATE-57-LINE-4-DIRECTOR")) {
    issues.push("missing_relationship_basis:REL-GATE-57-LINE-4-DIRECTOR");
  }
  const hasGateQuarterClaim = /\bgate\s*\d*\b.{0,100}\b(quarter|initiation|civilization|duality|mutation)\b/.test(text) &&
    /\b(is in|belongs to|falls in|located in|sits in|quarter)\b/.test(text);
  if (hasGateQuarterClaim && !relationBasis.has("REL-GATE-QUARTER")) {
    issues.push("missing_relationship_basis:REL-GATE-QUARTER");
  }
  const hasSunMotivationClaim = /personality sun/.test(text) && /\b(motivation|transference)\b/.test(text);
  if (hasSunMotivationClaim && !relationBasis.has("REL-PERSONALITY-SUN-RP-MOTIVATION")) {
    issues.push("missing_relationship_basis:REL-PERSONALITY-SUN-RP-MOTIVATION");
  }
  const hasNodeViewClaim = /personality (north |south )?nodes?/.test(text) && /\b(view|perspective)\b/.test(text);
  const hasColor36TransferenceClaim = /color 3/.test(text) && /color 6/.test(text) && /transference/.test(text);
  if (hasColor36TransferenceClaim && !relationBasis.has("REL-PERSONALITY-SUN-NODES-COLOR-TRANSFERENCE-3-6")) {
    issues.push("missing_relationship_basis:REL-PERSONALITY-SUN-NODES-COLOR-TRANSFERENCE-3-6");
  }
  if (hasNodeViewClaim && !relationBasis.has("REL-PERSONALITY-NODES-RP-VIEW")) {
    issues.push("missing_relationship_basis:REL-PERSONALITY-NODES-RP-VIEW");
  }
  if (/\bgate\s*\d*\b.{0,80}\b(determines|causes|defines|establishes)\b.{0,40}\b(rave psychology|motivation|view|perspective)\b/.test(text)) {
    issues.push("unsupported_cross_concept_claim:gate_to_rave_psychology");
  }
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

export function finalizeAnswer(answer, evidence, knowledge, relationships = []) {
  const critic = criticAnswer({answer,suppliedEvidence:evidence,suppliedKnowledge:knowledge,suppliedRelationships:relationships});
  return {...answer, critic};
}
