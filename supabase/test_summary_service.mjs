import assert from "node:assert/strict";
import { summarizeConversation } from "./functions/user-data-api/summary-service.mjs";

const turns = Array.from({ length: 30 }, (_, i) => ({
  sequence_number: i + 1,
  role: i % 2 ? "assistant" : "user",
  question: "Question " + (i + 1),
  answer: "Answer " + (i + 1)
}));
let generatedInput = null;
let saved = null;
const result = await summarizeConversation({
  conversationId: "conversation-test",
  turns,
  existingSummary: "Previously summarized context.",
  existingSummaryThroughSequence: 5,
  preserveRecentTurns: 12,
  generateSummary: async input => {
    generatedInput = input;
    assert.equal(input.turns[0].sequence_number, 6);
    assert.equal(input.throughSequence, 18);
    return "Compact summary through turn 18.";
  },
  saveSummary: async input => {
    saved = input;
    return { summary_through_sequence: input.throughSequence };
  }
});
assert.equal(result.status, "saved");
assert.equal(result.throughSequence, 18);
assert.equal(result.preservedRecentTurnCount, 12);
assert.equal(generatedInput.turns.at(-1).sequence_number, 18);
assert.equal(saved.throughSequence, 18, "persisted coverage must match generated coverage");

const skipped = await summarizeConversation({
  conversationId: "conversation-test",
  turns,
  existingSummaryThroughSequence: 18,
  preserveRecentTurns: 12,
  generateSummary: async () => { throw new Error("must not summarize newest turns"); },
  saveSummary: async () => { throw new Error("must not persist a no-op"); }
});
assert.equal(skipped.status, "skipped");
assert.equal(skipped.reason, "no_new_older_turns");
console.log("TRUSTED SUMMARY COVERAGE TEST PASS");
