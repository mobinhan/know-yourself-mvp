import assert from "node:assert/strict";
import { prepare3FrameworkInput } from "./threeframework-orchestrator.mjs";

const valid = prepare3FrameworkInput({
  question: "What does Gate 57 mean in my chart?",
  canonicalEvidence: {
    chart_facts: [{ gate: 57, activation: "personality_saturn", line: 4 }],
    evidence_refs: ["chart-engine:test-fixture"],
    source_version: "fixture-v1"
  },
  adaptiveContext: {
    preferences: { tone: "natural" },
    memories: [{ category: "response_preference", value: "Avoid mechanical disclaimers" }],
    recent_conversations: [],
    saved_insights: []
  },
  requestId: "test-1"
});
assert.equal(valid.ready, true);
assert.equal(valid.input.layers.layer_1_canonical_evidence.chart_facts[0].gate, 57);
assert.equal(valid.input.layers.layer_2_adaptive_user_context.memories[0].value, "Avoid mechanical disclaimers");
assert.equal(valid.input.invariants.canonical_evidence_is_authoritative, true);
assert.equal(valid.input.invariants.user_context_cannot_override_chart_facts, true);
assert.equal(valid.input.invariants.orchestrator_is_not_a_fourth_framework_layer, true);

// A conflicting personal memory must remain in Layer 2; it cannot mutate Layer 1.
const conflict = prepare3FrameworkInput({
  question: "Check my chart",
  canonicalEvidence: { chart_facts: [{ authority: "Sacral" }], evidence_refs: ["engine"] },
  adaptiveContext: { memories: [{ category: "user_context", value: "My authority is Emotional" }] }
});
assert.equal(conflict.input.layers.layer_1_canonical_evidence.chart_facts[0].authority, "Sacral");
assert.equal(conflict.input.layers.layer_2_adaptive_user_context.memories[0].value, "My authority is Emotional");

// Missing evidence/context must fail closed rather than fabricate an input packet.
assert.deepEqual(prepare3FrameworkInput({ question: "Hi", adaptiveContext: {} }), {
  ready: false,
  issues: ["canonical_evidence_required"],
  input: null
});
assert.equal(prepare3FrameworkInput({ question: "  ", canonicalEvidence: {}, adaptiveContext: {} }).ready, false);
console.log("3Framework Orchestrator contract tests passed.");
