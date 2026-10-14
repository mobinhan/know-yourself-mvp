import assert from "node:assert/strict";
import { createAnswerHandler } from "./functions/answer-api/pipeline.mjs";
import { summarizeConversation } from "./functions/user-data-api/summary-service.mjs";

const tokenCount = value => value.trim() ? value.trim().split(/\s+/).length : 0;
const makeRequest = (question, conversationId = "conversation-1") => new Request("https://ky.test/answer", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer mock-session" },
  body: JSON.stringify({ conversation_id: conversationId, question })
});
const parse = async response => ({ status: response.status, body: await response.json() });

function baseDeps(overrides = {}) {
  const calls = { classify: 0, flash: 0, reason: 0, critic: 0, assemble: 0, minimal: 0, full: 0, summarize: 0, persist: 0 };
  const logs = [];
  const turns = Array.from({ length: 32 }, (_, i) => ({
    sequence_number: i + 1,
    role: i % 2 ? "assistant" : "user",
    question: "Turn question " + (i + 1),
    answer: "Turn answer " + (i + 1)
  }));
  const deps = {
    calls, logs,
    authenticate: async req => req.headers.get("Authorization") === "Bearer mock-session" ? { id: "user-1" } : null,
    getOwnedConversation: async ({ userId, conversationId }) => userId === "user-1" && conversationId === "conversation-1"
      ? { id: conversationId, user_id: userId, chart_id: "chart-1", status: "active" } : null,
    getTurnCount: async () => 2,
    loadMinimalContext: async () => {
      calls.minimal++;
      return { instructions: "Be brief.", evidence: [{ id: "E-TERM", claim: "General educational definition." }], knowledge: [] };
    },
    loadFullContext: async () => {
      calls.full++;
      return {
        instructions: "Use canonical evidence only.",
        canonicalChart: { type: "Generator", authority: "Sacral", chart_id: "chart-1" },
        evidence: [{ id: "E-AUTHORITY", claim: "Canonical chart evidence says Sacral authority.", result: "Sacral" }],
        memories: [{ id: "M-1", category: "goal", value: "Explore career direction", status: "active", user_consent: true, user_confirmed: true }],
        preferences: { personalization_enabled: true, personal_context_enabled: true },
        summary: null,
        turns: turns.slice(-20)
      };
    },
    flashClassify: async () => { calls.classify++; return { route: "escalate", confidence: 0.9 }; },
    flashAnswer: async ({ context }) => {
      calls.flash++;
      return { answer: "Human Design is a self-reflection system.", factual_basis: ["E-TERM"], knowledge_basis: [], relationship_basis: [] };
    },
    reasoningAnswer: async ({ context }) => {
      calls.reason++;
      calls.assemble++;
      assert.ok(tokenCount(JSON.stringify(context)) <= 4000, "reasoning context must be within 4,000 tokens");
      return { answer: "The canonical evidence supplied for this chart identifies Sacral authority.", factual_basis: ["E-AUTHORITY"], knowledge_basis: [], relationship_basis: [] };
    },
    critic: async ({ draft, canonicalEvidence }) => {
      calls.critic++;
      const allowed = new Set(canonicalEvidence.map(item => item.id));
      const passed = Array.isArray(draft.factual_basis) && draft.factual_basis.every(id => allowed.has(id));
      return { passed, issues: passed ? [] : ["unsupported_factual_basis"] };
    },
    persistApprovedAnswer: async () => { calls.persist++; return true; },
    countTokens: tokenCount,
    logger: event => logs.push(event),
    createTraceId: () => "trace-test",
    ...overrides
  };
  return { deps, calls, logs, turns };
}

{
  const { deps, calls, logs } = baseDeps();
  const handler = createAnswerHandler(deps, { trustedSummaryEnabled: false });
  const { status, body } = await parse(await handler(makeRequest("Explain Human Design")));
  assert.equal(status, 200);
  assert.equal(body.route, "simple");
  assert.equal(calls.flash, 1, "simple question must use Flash answer path");
  assert.equal(calls.reason, 0, "simple question must not call reasoning model");
  assert.equal(calls.full, 0, "simple question must not assemble full context");
  assert.equal(calls.minimal, 1);
  assert.ok(body.usage.measured_tokens < 100, "simple context should remain small");
  assert.equal(calls.critic, 1, "Flash output must also pass evidence critic");
  assert.equal(calls.persist, 1);
  assert.ok(logs.every(event => !("question" in event) && !("answer" in event) && !("user_id" in event)));
}

{
  const { deps, calls, logs } = baseDeps();
  const handler = createAnswerHandler(deps, { maxReasoningTokens: 4000, maxReasoningTurns: 12, trustedSummaryEnabled: false });
  const { status, body } = await parse(await handler(makeRequest("Given my chart, how does my authority shape my career and timing?")));
  assert.equal(status, 200);
  assert.equal(body.route, "escalate");
  assert.equal(calls.reason, 1, "complex question must reach reasoning model");
  assert.equal(calls.flash, 0, "complex question must not use simple answer path");
  assert.equal(calls.full, 1);
  assert.equal(calls.assemble, 1);
  assert.equal(body.usage.budget_tokens, 4000);
  assert.ok(body.usage.measured_tokens <= 4000, "assembled context must be bounded");
  assert.equal(body.usage.recent_turns_included, 12);
  assert.equal(calls.critic, 1, "reasoning output must be checked against canonical evidence");
  assert.equal(body.critic.passed, true);
  assert.ok(logs.some(event => event.route === "escalate" && event.measured_tokens <= 4000));
}

{
  const { deps, calls, logs, turns } = baseDeps({
    getTurnCount: async () => 32,
    loadFullContext: async ({ summaryResult }) => ({
      instructions: "Use canonical evidence only.",
      canonicalChart: { type: "Generator", authority: "Sacral" },
      evidence: [{ id: "E-AUTHORITY", claim: "Canonical chart evidence says Sacral authority.", result: "Sacral" }],
      memories: [],
      preferences: { personalization_enabled: true, personal_context_enabled: true },
      summary: summaryResult?.summary ?? null,
      turns: turns.slice(-32)
    }),
    maybeSummarize: async ({ conversationId, turnCount, trustedServerRole }) => {
      calls.summarize++;
      assert.equal(trustedServerRole, true, "summary call must be made only by trusted server orchestration");
      assert.equal(turnCount, 32);
      let saved = null;
      const result = await summarizeConversation({
        conversationId,
        turns,
        existingSummaryThroughSequence: 0,
        existingSummaryVersion: 1,
        preserveRecentTurns: 12,
        generateSummary: async input => {
          assert.equal(input.throughSequence, 20);
          assert.equal(input.turns.at(-1).sequence_number, 20);
          return "Trusted summary through sequence 20.";
        },
        saveSummary: async input => { saved = input; return { summary_through_sequence: input.throughSequence }; }
      });
      assert.equal(result.status, "saved");
      assert.equal(saved.throughSequence, 20, "summary coverage must advance after trusted persistence");
      assert.equal(saved.summaryVersion, 2);
      return { ...result, summary: { text: "Trusted summary through sequence 20.", throughSequence: saved.throughSequence } };
    }
  });
  const handler = createAnswerHandler(deps, { trustedSummaryEnabled: true, summaryTurnThreshold: 30 });
  const { status, body } = await parse(await handler(makeRequest("Given my chart, how does my authority shape my career and timing?")));
  assert.equal(status, 200);
  assert.equal(calls.summarize, 1, "32-turn conversation must trigger summary service");
  assert.ok(logs.some(event => event.summary_status === "saved" && event.summary_through_sequence === 20));
  assert.equal(body.route, "escalate");
}

{
  const { deps, calls } = baseDeps({ authenticate: async () => ({ id: "user-1" }), getOwnedConversation: async () => null });
  const handler = createAnswerHandler(deps, { trustedSummaryEnabled: false });
  const { status } = await parse(await handler(makeRequest("Given my chart, how does my authority shape my career and timing?", "not-owned")));
  assert.equal(status, 404);
  assert.equal(calls.flash + calls.reason + calls.persist, 0, "ownership failure must block model and persistence");
}

{
  const { deps, calls } = baseDeps({ flashClassify: async () => { calls.classify++; return { route: "simple", confidence: 0.4 }; } });
  const handler = createAnswerHandler(deps, { escalationThreshold: 0.72, trustedSummaryEnabled: false });
  const { status, body } = await parse(await handler(makeRequest("Tell me a bit about authority in this context.")));
  assert.equal(status, 200);
  assert.equal(calls.classify, 1);
  assert.equal(body.route, "escalate", "gray-zone confidence below threshold must fail safe to escalation");
  assert.equal(calls.reason, 1);
}

console.log("ANSWER PIPELINE MOCKED END-TO-END PASS: simple/Flash, complex/reasoning+critic+budget, 32-turn trusted summary+coverage, ownership, gray-zone threshold");
