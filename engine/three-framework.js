import { buildReasoningPromptInput } from "./answer-composer.js";

const GATE_SET_EVIDENCE_ID = "E-GATES";
const ACTIVATION_EVIDENCE_ID = "E-ACTIVATIONS";

/** Verify a requested gate against canonical natal evidence, never a catalogue. */
export function verifyCanonicalGate(reasoningInput, gateNumber) {
  const gate = Number(gateNumber);
  if (!Number.isInteger(gate) || gate < 1 || gate > 64) {
    return { gate: gateNumber ?? null, status: "invalid_gate", natal_activations: [], evidence_ids: [] };
  }
  const evidence = reasoningInput?.evidence ?? [];
  const gateSetRecord = evidence.find(item => item.id === GATE_SET_EVIDENCE_ID);
  const activationRecord = evidence.find(item => item.id === ACTIVATION_EVIDENCE_ID);
  if (!gateSetRecord || !activationRecord || !Array.isArray(gateSetRecord.result) || !activationRecord.result) {
    return {
      gate, status: "unknown", natal_activations: [],
      evidence_ids: [gateSetRecord?.id, activationRecord?.id].filter(Boolean),
      reason: "Canonical gate-set and activation evidence are both required."
    };
  }
  const activations = [
    ...(Array.isArray(activationRecord.result.personality) ? activationRecord.result.personality : []),
    ...(Array.isArray(activationRecord.result.design) ? activationRecord.result.design : [])
  ].filter(item => Number(item.gate) === gate).map(item => ({
    gate,
    line: Number.isInteger(Number(item.line)) ? Number(item.line) : null,
    body: item.body ?? null,
    imprint: item.imprint ?? null
  }));
  const presentInGateSet = gateSetRecord.result.some(value => Number(value) === gate);
  const status = activations.length ? "activated" : presentInGateSet ? "gate_set_only_inconsistent" : "not_activated";
  return {
    gate, status, natal_activations: activations,
    evidence_ids: [gateSetRecord.id, activationRecord.id],
    rule: "Only canonical natal activation records establish a gate as activated; catalogues do not."
  };
}

/** Build the Layer 1 → Layer 2 → direct ChatGPT envelope. No separate critic is called. */
export function buildThreeFrameworkInput({ reasoningInput }) {
  if (!reasoningInput) throw new Error("reasoningInput is required");
  const composed = buildReasoningPromptInput(reasoningInput);
  const gateMatches = String(reasoningInput.question ?? "").match(/\bgate\s*\d{1,2}\b/ig) ?? [];
  const requestedGates = [...new Set(gateMatches.map(match => Number(match.match(/\d{1,2}/)?.[0])).filter(Number.isInteger))];
  const canonical_gate_checks = requestedGates.map(gate => verifyCanonicalGate(reasoningInput, gate));

  return {
    framework: "3framework",
    version: "1.0.0",
    layer_1_canonical_chart_and_evidence: {
      ready_for_reasoning: Boolean(reasoningInput.ready_for_reasoning),
      evidence: reasoningInput.evidence ?? [],
      knowledge: reasoningInput.knowledge ?? [],
      external_knowledge: reasoningInput.external_knowledge ?? [],
      holistic_context: composed.holistic_context ?? [],
      incarnation_cross_context: composed.incarnation_cross_context ?? null,
      rave_psychology_context: composed.rave_psychology_context ?? null,
      canonical_gate_checks
    },
    layer_2_adaptive_user_context: {
      question: reasoningInput.question ?? "",
      question_context: reasoningInput.question_context ?? null,
      adaptive_response_policy: composed.adaptive_response_policy ?? null,
      active_user_memory: composed.active_user_memory ?? [],
      conversation_context: composed.conversation_context ?? null
    },
    layer_3_chatgpt: {
      mode: composed.mode,
      instructions: [
        ...(composed.instructions ?? []),
        "3framework protocol: before making any chart-specific claim, check the relevant canonical evidence supplied in layer_1_canonical_chart_and_evidence.",
        "If mode is insufficient_evidence, do not answer chart-specific claims; state the specific evidence target that is missing.",
        "Use canonical_gate_checks for gate questions. activated means the natal activation is present; not_activated means the complete supplied canonical natal evidence does not contain it; unknown means the required evidence is incomplete.",
        "Do not treat a gate catalogue or channel catalogue as evidence of activation or definition.",
        "Layer 2 shapes relevance and presentation only. It must never override layer 1 chart mechanics, evidence, or source-backed claims.",
        "Do not claim that a separate critic or validation model checked this answer; 3framework has ChatGPT synthesize directly from layers 1 and 2."
      ],
      direct_input: { question: reasoningInput.question ?? "", canonical_gate_checks }
    }
  };
}
