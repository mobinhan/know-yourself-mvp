import assert from "node:assert/strict";
import { buildEvidence } from "./evidence.js";
import { understandQuestion } from "./question-understanding.js";
import { buildReasoningInput } from "./evidence-selection.js";
import { composeAnswer } from "./answer-composer.js";
import { buildGroundedAnswer } from "./reasoning-adapter.js";
import { criticAnswer } from "./answer-critic.js";
import { createConversationContext, appendTurn, buildConversationContextForReasoning } from "./conversation-context.js";

const structure={gateSet:[3,11,28,32,34,38,42,53,54,56,57,60],channels:[{channel:"3-60"},{channel:"11-56"}],centres:["root","sacral","spleen","throat"],definition:[["root","sacral","spleen","throat"]],type:"generator",authority:"sacral",profile:"5/1",incarnation_cross:{}};
const evidence=buildEvidence({activations:{personality:[],design:[]},structure,calculation:{engine_name:"ky-hd-engine",engine_version:"1.0.0"},sources:["SRC_HD_DEFINITIVE_BOOK_2011"],temporalState:{mode:"temporal_state",natal:{gates:[3]},transit:{gates:[41]},temporary:{gates:[41]},combined:{gates:[3,41]}},lifecycleEvents:[{type:"saturn_return",timestamp:"2030-01-01T00:00:00Z"}],connection:{shared_gates:[3],electromagnetic_channels:[]}});

for(const question of ["What is my authority?","How might my design operate at work?","What is my timing?"]){
 const q=understandQuestion(question);
 const input=buildReasoningInput({questionContext:q,question,evidenceBundle:evidence,knowledgePackets:[]});
 assert.equal(input.ready_for_reasoning,true);
 const draft={answer:"Grounded test answer.",factual_basis:input.evidence.map(x=>x.id),knowledge_basis:[],interpretation:"Interpretation is separated from mechanics.",limitations:[]};
 const composed=composeAnswer({reasoningInput:input,synthesis:draft});
 const grounded=buildGroundedAnswer({reasoningInput:input,draft:composed});
 assert.equal(grounded.critic.passed,true);
 assert.equal(criticAnswer({answer:grounded,suppliedEvidence:input.evidence,suppliedKnowledge:input.knowledge}).passed,true);
}
let context=createConversationContext({conversationId:"acceptance"});
context=appendTurn(context,{role:"user",question:"What is my authority?"});
context=appendTurn(context,{role:"assistant",answer:"Your verified authority is sacral.",factual_basis:["E-AUTHORITY"]});
assert.equal(buildConversationContextForReasoning(context).turns.length,2);
console.log("STEP 5 ACCEPTANCE PASS");
