import { composeAnswer, buildReasoningPromptInput } from "./answer-composer.js";

const input={
  question:"How does my authority operate?",
  question_context:{intent:"interpretive",domains:["self_personal_development"],evidence_targets:["authority"]},
  evidence:[{id:"E-AUTHORITY",claim:"Authority is sacral",result:"sacral"}],
  knowledge:[{id:"HD-KNOW-AUTHORITY-001",concept:"Authority",claim:"Controlled educational claim",source_ids:["SRC_HD_DEFINITIVE_BOOK_2011"],locator:"section"}],
  ready_for_reasoning:true,
  missing_evidence_targets:[]
};
const prompt=buildReasoningPromptInput(input);
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
