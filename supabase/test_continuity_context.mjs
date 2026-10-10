import assert from "node:assert/strict";
import { buildContinuityContext } from "./continuity-context.mjs";

const now = "2026-10-10T00:00:00.000Z";
const preferences = {
  personalization_enabled: true, personal_context_enabled: false,
  language: "en", knowledge_level: "intermediate", tone: "conversational",
  language_confirmed: true, knowledge_level_confirmed: true, tone_confirmed: true
};
const memories = [
  { id: "m1", category: "communication_style", value: "Keep it practical", origin: "explicit", confidence: 1, status: "active", user_consent: true, user_confirmed: true },
  { id: "m2", category: "personal_context", value: "Sensitive detail", origin: "explicit", confidence: 1, status: "active", user_consent: true, user_confirmed: true },
  { id: "m3", category: "goal", value: "Expired goal", origin: "explicit", confidence: 1, status: "active", user_consent: true, user_confirmed: true, expires_at: "2026-10-09T00:00:00.000Z" },
  { id: "m4", category: "preference", value: "Unconfirmed", origin: "inferred", confidence: 0.9, status: "proposed", user_consent: true, user_confirmed: false }
];
const conversations = [{ id: "c1", title: "Gate 57", chart_id: "chart1", status: "active", updated_at: now }];
const turns = { c1: Array.from({ length: 8 }, (_, i) => ({ id: String(i), role: i % 2 ? "assistant" : "user", question: "Q" + i, answer: "A" + i, created_at: now, factual_basis: [], knowledge_basis: [], relationship_basis: [] })) };
let context = buildContinuityContext({ preferences, memories, conversations, turnsByConversation: turns, savedInsights: [{ id: "s1", title: "Saved", content: "Insight", factual_basis: [], knowledge_basis: [], relationship_basis: [] }], now });
assert.equal(context.schema_version, "ky-continuity-context-v1");
assert.deepEqual(context.memories.map((m) => m.id), ["m1"], "only active, consented, confirmed, unexpired allowed memories are returned");
assert.equal(context.recent_conversations[0].turns.length, 6, "conversation context is bounded");
assert.equal(context.recent_conversations[0].turns[0].id, "2", "bounded turns preserve chronological order");
assert.equal(context.saved_insights.length, 1);
assert.equal(context.boundaries.conversation_history_is_not_chart_truth, true);

context = buildContinuityContext({ preferences: { ...preferences, personalization_enabled: false }, memories, conversations, turnsByConversation: turns, savedInsights: [{ id: "s1" }], now });
assert.equal(context.preferences, null, "preferences are not injected when personalization is disabled");
assert.deepEqual(context.memories, [], "memory is not injected when personalization is disabled");
assert.deepEqual(context.saved_insights, [], "saved insights are not injected when personalization is disabled");
assert.equal(context.recent_conversations.length, 1, "conversation continuity remains available independently of personalization");

context = buildContinuityContext({ preferences, memories, conversations, turnsByConversation: turns, now });
assert.ok(!context.memories.some((m) => m.category === "personal_context" || m.category === "goal"), "personal context requires its separate setting");
console.log("PERSISTENT CONTINUITY CONTEXT CONTRACT PASS");
