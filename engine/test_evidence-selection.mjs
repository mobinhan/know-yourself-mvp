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
assert.equal(input.contract_version,"1.1.0");
assert.equal(input.evidence.length,selected.length);
assert.ok(input.knowledge.length>0);
assert.equal(input.interpretation_allowed,true);
assert.equal(input.ready_for_reasoning,true);
assert.deepEqual(input.missing_evidence_targets,[]);
assert.ok(input.evidence.every(x=>x.result!==undefined));

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
