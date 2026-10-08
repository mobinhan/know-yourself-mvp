import { runReasoningProvider, mockReasoningProvider, validateReasoningProvider } from "./reasoning-provider.js";

const input={
  ready_for_reasoning:true,
  question:"What is my authority?",
  evidence:[{id:"E-AUTHORITY"}],
  knowledge:[{id:"K-AUTH"}]
};
validateReasoningProvider(mockReasoningProvider);
const result=await runReasoningProvider({provider:mockReasoningProvider,reasoningInput:input});
for(const field of ["answer","factual_basis","knowledge_basis","interpretation","limitations"]){
  if(!(field in result)) throw new Error(`missing ${field}`);
}
if(result.factual_basis[0]!=="E-AUTHORITY") throw new Error("provider lost evidence grounding");

const blocked=await runReasoningProvider({
  provider:mockReasoningProvider,
  reasoningInput:{...input,ready_for_reasoning:false,missing_evidence_targets:["E-TEMPORAL"]}
});
if(blocked.factual_basis.length!==0) throw new Error("provider bypassed fail-closed boundary");

let rejected=false;
try { validateReasoningProvider({}); } catch { rejected=true; }
if(!rejected) throw new Error("invalid provider accepted");

console.log("REASONING PROVIDER CONTRACT PASS");
