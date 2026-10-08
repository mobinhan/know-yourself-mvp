import { buildEvidence } from "./evidence.js";
import { selectEvidence, buildReasoningInput } from "./evidence-selection.js";

const base={
  activations:{personality:[],design:[]},
  structure:{
    gateSet:[],channels:[],centres:[],definition:[],type:"generator",
    authority:"sacral",profile:"5/1",incarnation_cross:{}
  },
  temporalState:{mode:"temporal_state",natal:{gates:[1]},transit:{gates:[2]},temporary:{gates:[2]},combined:{gates:[1,2]}},
  lifecycleEvents:[{type:"saturn_return",timestamp:"2030-01-01T00:00:00Z"}],
  connection:{shared_gates:[1],electromagnetic_channels:[]}
};
const evidence=buildEvidence(base);
if(!evidence.records.some(x=>x.id==="E-TEMPORAL-STATE")) throw new Error("temporal evidence missing");
if(!evidence.records.some(x=>x.id==="E-LIFECYCLE-EVENTS")) throw new Error("lifecycle evidence missing");
if(!evidence.records.some(x=>x.id==="E-CONNECTION")) throw new Error("connection evidence missing");

const selected=selectEvidence(evidence,["temporal_state","lifecycle_event","connection"]);
if(selected.length!==3) throw new Error("extended evidence selection failed");

const input=buildReasoningInput({
  questionContext:{intent:"timing",domains:["timing_life_events"],evidence_targets:["temporal_state","lifecycle_event"]},
  question:"What is happening in my life now?",
  evidenceBundle:evidence,
  knowledgePackets:[]
});
if(!input.ready_for_reasoning) throw new Error("temporal evidence should now unblock timing reasoning");
if(input.missing_evidence_targets.length) throw new Error("unexpected missing temporal evidence");

console.log("EXTENDED EVIDENCE PASS");
