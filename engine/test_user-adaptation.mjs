import assert from "node:assert/strict";
import { buildAdaptiveResponsePolicy } from "./user-adaptation.js";
import { buildReasoningPromptInput } from "./answer-composer.js";

const explicit = buildAdaptiveResponsePolicy({
  consent: { personalization_enabled: true, personal_context_enabled: true },
  preferences: {
    knowledge_level: { value: "advanced", origin: "explicit", user_confirmed: true },
    tone: { value: "technical", origin: "explicit", user_confirmed: true },
    language: { value: "vi", origin: "explicit", user_confirmed: true },
    inferred_tone: { value: "supportive", origin: "inferred", user_consent: true, confidence: 0.95 }
  },
  user_context: [
    { id: "ctx-1", category: "goal", value: "Understand my decision patterns", origin: "explicit", user_consent: true },
    { id: "ctx-2", category: "chart_truth", value: "I have a different authority", origin: "explicit", user_consent: true },
    { id: "ctx-3", category: "goal", value: "Possibly prefers short answers", origin: "inferred", user_consent: true }
  ]
});
assert.deepEqual(explicit.preferences, { knowledge_level: "advanced", tone: "technical", language: "vi" });
assert.deepEqual(explicit.user_context.map(item => item.id), ["ctx-1"], "only explicit consented personal context passes");
assert.ok(explicit.boundaries.some(item => item.includes("never changes chart mechanics")));

const inferredOnly = buildAdaptiveResponsePolicy({
  consent: { personalization_enabled: true },
  preferences: {
    inferred_knowledge_level: { value: "advanced", origin: "inferred", user_consent: true, confidence: 0.79 },
    inferred_tone: { value: "reflective", origin: "inferred", user_consent: true, confidence: 0.9 }
  }
});
assert.equal(inferredOnly.preferences.knowledge_level, "intermediate", "low-confidence inferred preferences are ignored");
assert.equal(inferredOnly.preferences.tone, "reflective", "consented high-confidence inference may be used tentatively");

const disabled = buildAdaptiveResponsePolicy({
  consent: { personalization_enabled: false, personal_context_enabled: true },
  preferences: { knowledge_level: { value: "advanced", origin: "explicit", user_confirmed: true } },
  user_context: [{ id: "ctx", category: "goal", value: "secret", origin: "explicit", user_consent: true }]
});
assert.equal(disabled.adaptation_enabled, false);
assert.equal(disabled.preferences.knowledge_level, "intermediate");
assert.equal(disabled.user_context.length, 0);

const prompt = buildReasoningPromptInput({
  question: "Explain my chart",
  question_context: { intent: "interpretive", domains: ["general"], evidence_targets: ["cross"] },
  evidence: [{ id: "E-CROSS", claim: "cross", result: null }],
  knowledge: [],
  ready_for_reasoning: true,
  user_adaptation: { consent: { personalization_enabled: true }, preferences: {
    knowledge_level: { value: "advanced", origin: "explicit", user_confirmed: true }
  } }
});
assert.equal(prompt.adaptive_response_policy.preferences.knowledge_level, "advanced");
console.log("USER ADAPTATION POLICY PASS");
