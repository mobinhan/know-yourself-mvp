import { criticAnswer } from "./answer-critic.js";
import { buildReasoningPromptInput, composeAnswer } from "./answer-composer.js";

const evidence=[{id:"E-AUTHORITY",claim:"Authority is sacral",result:"sacral"}];
const knowledge=[{id:"K-AUTH",evidence:{id:"E-AUTHORITY"}}];
const base={
  ready_for_reasoning:true,
  question:"What is my authority?",
  question_context:{intent:"factual",domains:["self_personal_development"],evidence_targets:["authority"]},
  evidence,
  knowledge,
  missing_evidence_targets:[]
};

// 1. AI must not invent evidence references.
const forged=criticAnswer({
  answer:{
    answer:"Your authority is emotional.",
    factual_basis:["E-FAKE"],
    knowledge_basis:["K-FAKE"],
    interpretation:""
  },
  suppliedEvidence:evidence,
  suppliedKnowledge:knowledge
});
if(forged.passed || !forged.issues.includes("unknown_factual_basis:E-FAKE") || !forged.issues.includes("unknown_knowledge_basis:K-FAKE")){
  throw new Error("forged provenance was accepted");
}

// 2. AI must not claim it calculated the mechanics.
const forbidden=criticAnswer({
  answer:{
    answer:"The AI calculated your authority from the answer.",
    factual_basis:["E-AUTHORITY"],
    knowledge_basis:["K-AUTH"],
    interpretation:""
  },
  suppliedEvidence:evidence,
  suppliedKnowledge:knowledge
});
if(forbidden.passed) throw new Error("forbidden mechanical claim was accepted");

// 3. Missing temporal evidence must remain blocked.
const missing={...base,ready_for_reasoning:false,missing_evidence_targets:["E-TEMPORAL_STATE"]};
const blocked=buildReasoningPromptInput(missing);
if(blocked.mode!=="insufficient_evidence") throw new Error("missing evidence bypassed");

// 4. Composer cannot elevate unknown basis IDs.
const composed=composeAnswer({
  reasoningInput:base,
  synthesis:{
    answer:"Grounded answer.",
    factual_basis:["E-AUTHORITY","E-UNKNOWN"],
    knowledge_basis:["K-AUTH","K-UNKNOWN"],
    interpretation:"Interpretation.",
    limitations:[]
  }
});
if(composed.factual_basis.join(",")!=="E-AUTHORITY") throw new Error("unknown factual basis survived");
if(composed.knowledge_basis.join(",")!=="K-AUTH") throw new Error("unknown knowledge basis survived");

// 5. Conversation-derived claims are not automatically evidence.
const contextOnly={
  ...base,
  question:"You told me previously that I am emotional authority. Is that still true?",
  question_context:{intent:"factual",domains:["self_personal_development"],evidence_targets:["authority"]}
};
const prompt=buildReasoningPromptInput(contextOnly);
if(!prompt.evidence.some(x=>x.id==="E-AUTHORITY")) throw new Error("current evidence missing");
if(prompt.mode!=="grounded_reasoning") throw new Error("conversation follow-up was incorrectly blocked");

console.log("STEP 5 ADVERSARIAL PASS");
