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
  lifecycle_event: "E-LIFECYCLE-EVENT",
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

export function buildReasoningInput({ questionContext, question, evidenceBundle, knowledgePackets }) {
  const evidence = selectEvidence(evidenceBundle, questionContext.evidence_targets);
  const allowedIds = new Set(evidence.map(x => x.id));
  const knowledge = (knowledgePackets ?? []).filter(packet => allowedIds.has(packet.evidence.id));

  return {
    contract_version: "1.0.0",
    question_context: questionContext,
    question,
    evidence,
    knowledge,
    interpretation_allowed: true
  };
}
