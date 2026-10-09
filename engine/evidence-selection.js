import { getEvidence } from "./evidence.js";

const TARGET_TO_EVIDENCE = {
  activations: "E-ACTIVATIONS",
  gates: "E-GATES",
  channels: "E-CHANNELS",
  centres: "E-CENTRES",
  definition: "E-DEFINITION",
  type: "E-TYPE",
  strategy: "E-TYPE",
  authority: "E-AUTHORITY",
  profile: "E-PROFILE",
  cross: "E-CROSS",
  temporal_state: "E-TEMPORAL-STATE",
  lifecycle_event: "E-LIFECYCLE-EVENTS",
  connection: "E-CONNECTION"
};

export function selectEvidence(evidenceBundle, targets) {
  if (!evidenceBundle || !Array.isArray(evidenceBundle.records)) throw new Error("evidence bundle is required");
  if (!Array.isArray(targets)) throw new Error("evidence targets are required");

  const selectedIds = [];
  for (const target of targets) {
    const evidenceId = TARGET_TO_EVIDENCE[target];
    if (evidenceId && !selectedIds.includes(evidenceId)) selectedIds.push(evidenceId);
  }

  return selectedIds.map(id => getEvidence(evidenceBundle, id)).filter(Boolean);
}

import { buildExternalKnowledgePacket } from "./external-knowledge.js";

export function buildReasoningInput({ questionContext, question, evidenceBundle, knowledgePackets, externalKnowledge = null }) {
  const evidence = selectEvidence(evidenceBundle, questionContext.evidence_targets);
  const availableEvidenceIds = new Set(evidenceBundle.records.map(x => x.id));
  const requestedEvidenceIds = questionContext.evidence_targets
    .map(target => TARGET_TO_EVIDENCE[target])
    .filter(Boolean);
  const missing_evidence_targets = [...new Set(requestedEvidenceIds.filter(id => !availableEvidenceIds.has(id)))];
  const allowedIds = new Set(evidence.map(x => x.id));
  const knowledge = (knowledgePackets ?? []).filter(packet => allowedIds.has(packet.evidence.id));

  return {
    contract_version: "1.2.0",
    question_context: questionContext,
    question,
    evidence,
    knowledge,
    external_knowledge: externalKnowledge ?? buildExternalKnowledgePacket({ topics: questionContext.domains ?? [], purpose: "explain" }),
    missing_evidence_targets,
    ready_for_reasoning: missing_evidence_targets.length === 0,
    interpretation_allowed: true
  };
}
