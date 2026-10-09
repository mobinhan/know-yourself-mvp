import { composeAnswer, buildReasoningPromptInput } from "./answer-composer.js";
import { createConversationContext, appendTurn } from "./conversation-context.js";

const input={
  question:"How does my authority operate?",
  question_context:{intent:"interpretive",domains:["self_personal_development"],evidence_targets:["authority"]},
  evidence:[{id:"E-AUTHORITY",claim:"Authority is sacral",result:"sacral"}],
  knowledge:[{id:"HD-KNOW-AUTHORITY-001",concept:"Authority",claim:"Controlled educational claim",source_ids:["SRC_HD_DEFINITIVE_BOOK_2011"],locator:"section"}],
  ready_for_reasoning:true,
  missing_evidence_targets:[]
};
const prompt=buildReasoningPromptInput(input);
let conversation = createConversationContext({ conversationId: "conv-test", userId: "private-user-id" });
conversation = appendTurn(conversation, { role: "user", question: "What about my authority?" });
conversation = appendTurn(conversation, { role: "assistant", answer: "An earlier answer says sacral authority.", factual_basis: ["E-AUTHORITY"] });
const memoryPrompt = buildReasoningPromptInput({
  ...input,
  now: "2026-10-09T00:00:00.000Z",
  user_memory_records: [
    { id: "memory-active", category: "goal", value: "Understand how my patterns affect work", origin: "explicit", status: "active", user_consent: true, user_confirmed: true, source_turn_id: "turn-5" },
    { id: "memory-inference", category: "goal", value: "May dislike long answers", origin: "inferred", status: "proposed", user_consent: true, user_confirmed: false, source_turn_id: "turn-6" }
  ]
});
if (memoryPrompt.active_user_memory.length !== 1 || memoryPrompt.active_user_memory[0].id !== "memory-active") throw new Error("only governed active memory should enter the prompt");
if (memoryPrompt.adaptive_response_policy.user_context.some(item => item.category === "chart_truth")) throw new Error("memory must not override chart truth");

const contextPrompt = buildReasoningPromptInput({ ...input, conversation_context: conversation });
if (contextPrompt.conversation_context?.turns.length !== 2) throw new Error("bounded conversation continuity was not passed");
if ("user_id" in contextPrompt.conversation_context) throw new Error("private user ID leaked into reasoning context");
if (!contextPrompt.instructions.some(item => item.includes("not a source of chart truth"))) throw new Error("conversation/chart-truth boundary missing");
const badContextPrompt = buildReasoningPromptInput({ ...input, conversation_context: { version: "9.9.9", turns: [{ answer: "untrusted" }] } });
if (badContextPrompt.conversation_context !== null) throw new Error("unsupported conversation context must be excluded");

if(prompt.mode!=="grounded_reasoning" || !prompt.instructions.includes("Do not calculate, infer, or invent Human Design mechanics.")) throw new Error("prompt boundary failed");
if(!prompt.instructions.includes("Never claim that a chart fact or calculation is unavailable when that fact is present in the supplied evidence.")) throw new Error("availability boundary failed");
if(!prompt.instructions.some(item => item.includes("first-class Cross structure"))) throw new Error("first-class Cross guidance failed");

const gatePrompt = buildReasoningPromptInput({
  ...input,
  question: "How does this gate connect to the wider chart?",
  question_context: { intent: "interpretive", domains: ["general"], evidence_targets: ["gates"] },
  evidence: [
    { id: "E-GATES", claim: "Verified gate evidence", result: [34, 42, 53] },
    { id: "E-ACTIVATIONS", claim: "Verified activation substructure", result: { personality: [
      { body: "sun", gate: 34, line: 2, colour: 4, tone: 3, base: 2 },
      { body: "north_node", gate: 42, line: 5, colour: 2, tone: 4, base: 1 },
      { body: "south_node", gate: 53, line: 5, colour: 2, tone: 4, base: 1 }
    ] } }
  ],
  knowledge: [{ id: "HD-KNOW-GATE-001", concept: "Gates", claim: "Gate knowledge", source_ids: ["SRC_HD_DEFINITIVE_BOOK_2011"], locator: "section" }]
});
if (!Array.isArray(gatePrompt.holistic_context) || !gatePrompt.holistic_context.some(x => x.concept === "gate")) {
  throw new Error("holistic context was not included for gate questions");
}
const gateContext = gatePrompt.holistic_context.find(x => x.concept === "gate");
if (!gateContext.records.some(x => x.id === "HD-KNOW-LINE-001")) {
  throw new Error("gate prompt omitted validated line context");
}
if (!gateContext.gate_quarter_context.some(x => x.gate === 34 && x.quarter === "Mutation" && x.chart_defined && x.mapping_status === "validated")) {
  throw new Error("gate prompt omitted the sourced quarter mapping");
}
if (!gateContext.external_records.some(x => x.id === "EXT-KNOW-QUARTER-GATE-MAP-001" && x.status === "accepted")) {
  throw new Error("gate prompt omitted quarter-map provenance/status");
}
if (!gatePrompt.instructions.some(x => x.includes("unresolved_context"))) {
  throw new Error("holistic evidence-gap instruction missing");
}
if (gatePrompt.rave_psychology_context?.chart_substructure?.personality_sun?.colour !== 4) {
  throw new Error("Rave Psychology prompt omitted the evidenced Personality Sun Color");
}
if (gatePrompt.rave_psychology_context?.chart_substructure?.personality_north_node?.colour !== 2) {
  throw new Error("Rave Psychology prompt omitted the evidenced Personality Node Color");
}
if (!gatePrompt.rave_psychology_context?.framework.external_records.some(x => x.id === "EXT-KNOW-RP-VIEW-001")) {
  throw new Error("Rave Psychology prompt omitted official View context");
}
if (!gatePrompt.instructions.some(x => x.includes("do not infer these values from a gate theme"))) {
  throw new Error("Rave Psychology evidence boundary instruction missing");
}

const gateLinePrompt = buildReasoningPromptInput({
  ...input,
  question: "Tell me more about my Gate 57.4",
  question_context: { intent: "interpretive", domains: ["self_personal_development"], evidence_targets: ["gates"] },
  evidence: [
    { id: "E-GATES", claim: "Verified gate evidence", result: [57] },
    { id: "E-ACTIVATIONS", claim: "Verified planetary activation", result: { personality: [
      { body: "saturn", imprint: "personality", gate: 57, line: 4, colour: 4, tone: 2, base: 3 }
    ], design: [] } }
  ],
  knowledge: [{ id: "HD-KNOW-GATE-001", concept: "Gate", claim: "Gate 57 context", source_ids: ["SRC_HD_DEFINITIVE_BOOK_2011"], locator: "section" }]
});
const gate57Context = gateLinePrompt.holistic_context.find(item => item.concept === "gate");
if (!gate57Context?.external_records.some(item => item.id === "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001")) throw new Error("exact chart gate-line context did not retrieve the Gate 57.4 teaching");
if (!gateLinePrompt.instructions.some(item => item.includes("specific gate-line synthesis"))) throw new Error("gate-line synthesis boundary missing");

const answer=composeAnswer({
  reasoningInput:input,
  synthesis:{
    answer:"Your chart evidence identifies sacral authority. In practice, the interpretation is to pay attention to your body's immediate response before committing.",
    factual_basis:["E-AUTHORITY","E-FAKE"],
    knowledge_basis:["HD-KNOW-AUTHORITY-001","HD-FAKE"],
    interpretation:"The second sentence is interpretation rather than a mechanical calculation.",
    limitations:[]
  }
});
if(JSON.stringify(answer.factual_basis)!=="[\"E-AUTHORITY\"]") throw new Error("factual basis was not constrained");
if(JSON.stringify(answer.knowledge_basis)!=="[\"HD-KNOW-AUTHORITY-001\"]") throw new Error("knowledge basis was not constrained");

const blocked={...input,ready_for_reasoning:false,missing_evidence_targets:["E-TEMPORAL"]};
const blockedPrompt=buildReasoningPromptInput(blocked);
if(blockedPrompt.mode!=="insufficient_evidence") throw new Error("fail-closed prompt failed");
const blockedAnswer=composeAnswer({reasoningInput:blocked,synthesis:{answer:"Should not be used"}});
if(blockedAnswer.factual_basis.length!==0) throw new Error("blocked answer claimed evidence");

console.log("ANSWER COMPOSER PASS");
