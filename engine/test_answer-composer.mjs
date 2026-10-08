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
if(JSON.stringify(answer.factual_basis)!=="["E-AUTHORITY"]") throw new Error("factual basis was not constrained");
if(JSON.stringify(answer.knowledge_basis)!=="["HD-KNOW-AUTHORITY-001"]") throw new Error("knowledge basis was not constrained");

const blocked={...input,ready_for_reasoning:false,missing_evidence_targets:["E-TEMPORAL"]};
const blockedPrompt=buildReasoningPromptInput(blocked);
if(blockedPrompt.mode!=="insufficient_evidence") throw new Error("fail-closed prompt failed");
const blockedAnswer=composeAnswer({reasoningInput:blocked,synthesis:{answer:"Should not be used"}});
if(blockedAnswer.factual_basis.length!==0) throw new Error("blocked answer claimed evidence");

console.log("ANSWER COMPOSER PASS");
