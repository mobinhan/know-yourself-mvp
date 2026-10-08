import {
  createConversationContext,
  appendTurn,
  buildConversationContextForReasoning,
  resolveFollowUpQuestion
} from "./conversation-context.js";

let context=createConversationContext({conversationId:"c1",userId:"u1"});
for(let i=0;i<22;i++){
  context=appendTurn(context,{
    role:i%2===0?"user":"assistant",
    question:i%2===0?"What about my authority?":"",
    answer:i%2===1?"Your supplied evidence says sacral authority.":"",
    factual_basis:i%2===1?["E-AUTHORITY"]:[],
    knowledge_basis:i%2===1?["HD-KNOW-AUTHORITY-001"]:[]
  });
}
if(context.turns.length!==20) throw new Error("turn window failed");
if(context.conversation_id!=="c1" || context.user_id!=="u1") throw new Error("identity failed");

const safe=buildConversationContextForReasoning(context);
if(safe.turns.length!==20) throw new Error("reasoning context failed");

const follow=resolveFollowUpQuestion({currentQuestion:"And at work?",context:safe});
if(!follow.likely_follow_up || !follow.previous_turn) throw new Error("follow-up detection failed");

console.log("CONVERSATION CONTEXT PASS");
