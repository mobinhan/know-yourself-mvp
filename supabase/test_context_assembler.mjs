import assert from "node:assert/strict";
import { assembleContext, eligibleMemories } from "./context-assembler.mjs";

// Deterministic mocked tokenizer: count whitespace-delimited tokens in the
// exact serialized payload. The production caller must inject its provider tokenizer.
const mockTokenizer = text => text.trim() ? text.trim().split(/\s+/).length : 0;
const input = {
  instructions: "Answer using only canonical chart and validated evidence.",
  question: "Explain my chart and what I should consider next.",
  canonicalChart: { type: "Projector", authority: "Splenic", evidence_id: "chart-1" },
  evidence: [
    { id: "ev-1", claim: "Evidence claim one with enough text to consume tokens." },
    { id: "ev-2", claim: "Evidence claim two with enough text to consume tokens." }
  ],
  memories: [
    { id: "mem-1", category: "communication_style", value: "Prefer warm direct answers." },
    { id: "mem-2", category: "goal", value: "Explore career direction over time." }
  ],
  summary: { text: "Earlier conversation summary with prior decisions.", throughSequence: 7 },
  turns: Array.from({ length: 30 }, (_, i) => ({
    sequence_number: i + 1,
    role: i % 2 ? "assistant" : "user",
    question: "Recent question " + (i + 1),
    answer: "Recent answer " + (i + 1)
  }))
};

const result = assembleContext(input, { maxTokens: 4000, maxTurns: 12, countTokens: mockTokenizer });
assert.ok(result.metrics.measured_tokens <= 4000, "assembled context must stay within budget");
assert.equal(result.metrics.recent_turns_included, 12, "AI context should cap raw history at 12 turns");
assert.equal(result.context.recent_turns[0].sequence_number, 19, "selected recent turns should be chronological");
assert.equal(result.context.recent_turns.at(-1).sequence_number, 30, "newest turn must be retained");
assert.equal(mockTokenizer(JSON.stringify(result.context)), result.metrics.measured_tokens, "reported count must measure final serialized context");

const tight = assembleContext(input, { maxTokens: 150, maxTurns: 12, countTokens: mockTokenizer });
assert.ok(tight.metrics.measured_tokens <= 150, "tight budget must still be respected");
assert.ok(tight.metrics.trimmed_items > 0, "trimming must be logged");
assert.ok(tight.metrics.trimming_log.some(entry => entry.action === "trimmed_budget"), "trimming log must identify exclusions");

const memories = [
 { id: "ok", category: "preference", status: "active", user_consent: true, user_confirmed: true },
 { id: "no-consent", category: "preference", status: "active", user_consent: false, user_confirmed: true },
 { id: "unconfirmed", category: "goal", status: "active", user_consent: true, user_confirmed: false },
 { id: "expired", category: "goal", status: "active", user_consent: true, user_confirmed: true, expires_at: "2020-01-01T00:00:00Z" },
 { id: "personal-off", category: "personal_context", status: "active", user_consent: true, user_confirmed: true }
];
assert.deepEqual(eligibleMemories(memories, { personalization_enabled: true, personal_context_enabled: false }, new Date("2026-01-01T00:00:00Z")).map(x => x.id), ["ok"]);
assert.deepEqual(eligibleMemories(memories, { personalization_enabled: false, personal_context_enabled: true }), []);
assert.throws(() => assembleContext(input, { maxTokens: 1, countTokens: mockTokenizer }), /fixed_prompt_exceeds_token_budget/);
console.log("LAYER 2 CONTEXT ASSEMBLER MOCKED-TOKENIZER TEST PASS");
