import { buildGroundedAnswer, createMockReasoningDraft } from "./reasoning-adapter.js";

const evidence = [
  {id:"E-AUTHORITY", kind:"mechanical_derivation", result:"sacral"},
  {id:"E-TYPE", kind:"mechanical_derivation", result:"generator"}
];
const knowledge = [
  {id:"HD-KNOW-AUTHORITY-001", evidence:{id:"E-AUTHORITY"}},
  {id:"HD-KNOW-TYPE-001", evidence:{id:"E-TYPE"}}
];

const input = {
  contract_version:"1.0.0",
  question_context:{intent:"interpretive",domains:["career_purpose"],evidence_targets:["authority","type"]},
  question:"How does my design operate at work?",
  evidence,
  knowledge,
  missing_evidence_targets:[],
  ready_for_reasoning:true,
  interpretation_allowed:true
};

const draft=createMockReasoningDraft(input);
const result=buildGroundedAnswer({reasoningInput:input,draft});
if(!result.critic?.passed) throw new Error(JSON.stringify(result.critic));
if(!result.factual_basis.includes("E-AUTHORITY")) throw new Error("authority basis missing");
if(!result.knowledge_basis.includes("HD-KNOW-AUTHORITY-001")) throw new Error("knowledge basis missing");

const blocked={...input,ready_for_reasoning:false,missing_evidence_targets:["E-TEMPORAL"]};
const blockedResult=buildGroundedAnswer({reasoningInput:blocked,draft:createMockReasoningDraft(blocked)});
if(!blockedResult.critic?.passed) throw new Error("fail-closed answer should pass critic");
if(blockedResult.factual_basis.length!==0) throw new Error("blocked answer must not claim evidence");

console.log("REASONING ADAPTER PASS");
