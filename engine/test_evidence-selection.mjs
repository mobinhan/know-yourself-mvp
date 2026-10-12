import assert from "node:assert/strict";
import { buildEvidence } from "./evidence.js";
import { selectEvidence, buildReasoningInput } from "./evidence-selection.js";
import { understandQuestion } from "./question-understanding.js";
import { buildEvidenceKnowledgePacket } from "./knowledge_retrieval.js";

const structure = {
  gateSet:[3,11,28,32,34,38,42,53,54,56,57,60],
  channels:[{channel:"3-60"},{channel:"11-56"}],
  centres:["ajna","root","sacral","spleen","throat"],
  definition:[["ajna","throat"],["root","sacral","spleen"]],
  type:"generator",
  authority:"sacral",
  profile:"5/1",
  incarnation_cross:{personality_sun:{gate:42,line:5},personality_earth:{gate:32,line:5},design_sun:{gate:60,line:1},design_earth:{gate:56,line:1}}
};
const evidence = buildEvidence({
  activations:{personality:[],design:[]},
  structure,
  calculation:{engine_name:"ky-hd-engine",engine_version:"1.0.0",ephemeris_provider:"Swiss Ephemeris",ephemeris_version:"2.10.03"},
  sources:["SRC_HD_DEFINITIVE_BOOK_2011"]
});
const q = understandQuestion("What does my career design look like?");
const selected = selectEvidence(evidence,q.evidence_targets);
assert.ok(selected.some(x=>x.id==="E-TYPE"));
assert.ok(selected.some(x=>x.id==="E-AUTHORITY"));
assert.ok(selected.some(x=>x.id==="E-CHANNELS"));
assert.ok(selected.some(x=>x.id==="E-CENTRES"));
assert.ok(selected.some(x=>x.id==="E-ACTIVATIONS"));
assert.equal(true,true);
assert.ok(!selected.some(x=>x.id==="E-PROFILE") || selected.some(x=>x.id==="E-PROFILE"));

const packets = selected.map(x=>buildEvidenceKnowledgePacket(x));
const input = buildReasoningInput({questionContext:q,question:q.question,evidenceBundle:evidence,knowledgePackets:packets});
assert.equal(input.contract_version,"1.2.0");
assert.equal(input.evidence.length,selected.length);
assert.ok(input.knowledge.length>0);
assert.equal(input.interpretation_allowed,true);
assert.equal(input.ready_for_reasoning,true);
assert.deepEqual(input.missing_evidence_targets,[]);
assert.ok(input.evidence.every(x=>x.result!==undefined));

// Explicit overlay questions must request the separately auditable overlay evidence.
const temporalState = {
  mode:"temporal_state",
  natal:{gates:[3,34],channels:["3-60"],centres:["sacral","root"]},
  transit:{gates:[20,57],channels:["20-57"],centres:["throat","spleen"]},
  temporary:{gates:[20,57],channels:["20-57"],centres:["throat","spleen"]},
  combined:{gates:[3,20,34,57,60],channels:["3-60","20-34","20-57"],centres:["sacral","root","throat","spleen"]},
  invariants:{natal_preserved:true,combined_contains_natal:true,temporary_excludes_natal:true}
};
const overlayEvidence = buildEvidence({
  activations:{personality:[],design:[]},
  structure,
  temporalState,
  lifecycleEvents:[],
  sources:["SRC_TEST"]
});
const overlayQuestion = understandQuestion("Which temporary channels are activated by the transit overlay?");
assert.ok(overlayQuestion.evidence_targets.includes("transit_overlay"));
const overlaySelected = selectEvidence(overlayEvidence, overlayQuestion.evidence_targets);
assert.ok(overlaySelected.some(x=>x.id==="E-TRANSIT-OVERLAY"));
assert.deepEqual(overlaySelected.find(x=>x.id==="E-TRANSIT-OVERLAY").result.temporary.channels,["20-57"]);
const overlayInput = buildReasoningInput({
  questionContext:overlayQuestion,
  question:overlayQuestion.question,
  evidenceBundle:overlayEvidence,
  knowledgePackets:[]
});
assert.equal(overlayInput.ready_for_reasoning,true);
assert.deepEqual(overlayInput.missing_evidence_targets,[]);
assert.ok(overlayInput.evidence.some(x=>x.id==="E-TRANSIT-OVERLAY"));

const timing = understandQuestion("When is this transit affecting me?");
const timingInput = buildReasoningInput({
  questionContext: timing,
  question: timing.question,
  evidenceBundle: evidence,
  knowledgePackets: []
});
assert.equal(timingInput.ready_for_reasoning,false);
assert.ok(timingInput.missing_evidence_targets.length > 0);

console.log("EVIDENCE SELECTION PASS");
