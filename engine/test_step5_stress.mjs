import { buildReasoningInput } from "./evidence-selection.js";
import { buildGroundedAnswer } from "./reasoning-adapter.js";
import { composeAnswer } from "./answer-composer.js";

const evidence = {
  records: [
    {id:"E-TYPE", claim:"Type is generator", inputs:[], result:"generator", calculation:{}},
    {id:"E-AUTHORITY", claim:"Authority is sacral", inputs:[], result:"sacral", calculation:{}},
    {id:"E-PROFILE", claim:"Profile is 5/1", inputs:[], result:"5/1", calculation:{}},
    {id:"E-CHANNELS", claim:"Defined channels supplied", inputs:[], result:["3-60"], calculation:{}}
  ]
};
const knowledge = [
  {id:"K-TYPE",evidence:{id:"E-TYPE"}},
  {id:"K-AUTH",evidence:{id:"E-AUTHORITY"}},
  {id:"K-PROFILE",evidence:{id:"E-PROFILE"}},
  {id:"K-CHANNEL",evidence:{id:"E-CHANNELS"}}
];

const questions = [
  {
    q:"What is my type?",
    context:{intent:"factual",domains:["self_personal_development"],evidence_targets:["type"]}
  },
  {
    q:"How might my authority affect work decisions?",
    context:{intent:"interpretive",domains:["career_purpose","life_direction_major_decisions"],evidence_targets:["authority","type"]}
  },
  {
    q:"Tell me about my profile and channels.",
    context:{intent:"factual",domains:["self_personal_development"],evidence_targets:["profile","channels"]}
  }
];

for(const item of questions){
  const input=buildReasoningInput({
    questionContext:item.context,
    question:item.q,
    evidenceBundle:evidence,
    knowledgePackets:knowledge
  });
  if(!input.ready_for_reasoning) throw new Error("supported question unexpectedly blocked");
  const draft={
    answer:"Grounded response for testing.",
    factual_basis:input.evidence.map(x=>x.id),
    knowledge_basis:input.knowledge.map(x=>x.id),
    interpretation:"Interpretation only; mechanics remain in evidence.",
    limitations:[]
  };
  const adapted=buildGroundedAnswer({reasoningInput:input,draft});
  if(!adapted.critic.passed) throw new Error(JSON.stringify(adapted.critic));
  const composed=composeAnswer({reasoningInput:input,synthesis:draft});
  if(!composed.answer || composed.factual_basis.length===0) throw new Error("composition failed");
}

const timing={
  intent:"timing",
  domains:["timing_life_events"],
  evidence_targets:["temporal_state","lifecycle_event","activations"]
};
const blocked=buildReasoningInput({
  questionContext:timing,
  question:"What is happening in my life right now?",
  evidenceBundle:evidence,
  knowledgePackets:knowledge
});
if(blocked.ready_for_reasoning) throw new Error("timing question bypassed missing evidence");
if(!blocked.missing_evidence_targets.length) throw new Error("timing gap was not surfaced");

console.log("STEP 5 STRESS PASS");
