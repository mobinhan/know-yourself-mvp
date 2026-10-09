import assert from "node:assert/strict";
import fs from "node:fs";
import { buildEvidence } from "./evidence.js";
import { buildThreeFrameworkInput, verifyCanonicalGate } from "./three-framework.js";

const chart = JSON.parse(fs.readFileSync(new URL("./golden-chart.json", import.meta.url), "utf8"));
const activations = chart.activations;
const gateSet = [...new Set([...activations.personality, ...activations.design].map(item => item.gate))].sort((a,b) => a-b);
const evidenceBundle = buildEvidence({
  activations,
  structure: {
    gateSet,
    channels: chart.expected.channels,
    centres: chart.expected.centres,
    definition: chart.expected.definition.components,
    type: chart.expected.type,
    authority: chart.expected.authority,
    profile: chart.expected.profile,
    incarnation_cross: chart.expected.incarnation_cross
  },
  calculation: chart.calculation,
  sources: ["SRC_HD_DEFINITIVE_BOOK_2011"]
});
const input = {
  ready_for_reasoning: true,
  question: "Are Gate 7 and Gate 31 activated in my chart?",
  question_context: { intent: "factual", domains: ["general"], evidence_targets: ["gates"] },
  evidence: evidenceBundle.records,
  knowledge: [],
  external_knowledge: [],
  user_adaptation: {
    consent: { personalization_enabled: true, personal_context_enabled: true },
    user_context: [{ id: "ctx", category: "goal", value: "Verify chart facts first", origin: "explicit", user_consent: true }]
  }
};

const gate7 = verifyCanonicalGate(input, 7);
const gate31 = verifyCanonicalGate(input, 31);
assert.equal(gate7.status, "not_activated");
assert.equal(gate31.status, "not_activated");
assert.equal(verifyCanonicalGate(input, 57).status, "activated");
assert.ok(verifyCanonicalGate(input, 57).natal_activations.some(item => item.line === 4 && item.body === "saturn"));
assert.equal(verifyCanonicalGate({ ...input, evidence: [] }, 7).status, "unknown");

const three = buildThreeFrameworkInput({ reasoningInput: input });
assert.equal(three.framework, "3framework");
assert.equal(three.layer_1_canonical_chart_and_evidence.canonical_gate_checks.find(item => item.gate === 7).status, "not_activated");
assert.equal(three.layer_2_adaptive_user_context.question, input.question);
assert.ok(three.layer_3_chatgpt.instructions.some(item => item.includes("before making any chart-specific claim")));
assert.ok(!("critic" in three.layer_3_chatgpt), "3framework does not require a separate critic layer");
assert.notEqual(three.layer_1_canonical_chart_and_evidence.knowledge, three.layer_2_adaptive_user_context.active_user_memory,
  "canonical knowledge and adaptive memory remain separate inputs");

console.log("3FRAMEWORK PASS: canonical gate checks, adaptive-context separation, direct ChatGPT envelope");
