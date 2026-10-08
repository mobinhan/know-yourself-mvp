import assert from "node:assert/strict";
import { buildEvidence, getEvidence } from "./evidence.js";
import { buildEvidenceKnowledgePacket, getKnowledgeForEvidence, getSource } from "./knowledge_retrieval.js";

const structure = {
  gateSet:[3,11,28,32,34,38,42,53,54,56,57,60],
  channels:[{channel:"3-60"},{channel:"11-56"}],
  centres:["ajna","root","sacral","spleen","throat"],
  definition:[["ajna","throat"],["root","sacral","spleen"]],
  type:"generator",
  authority:"sacral",
  profile:"5/1",
  incarnation_cross:{
    personality_sun:{gate:42,line:5},
    personality_earth:{gate:32,line:5},
    design_sun:{gate:60,line:1},
    design_earth:{gate:56,line:1}
  }
};

const evidence = buildEvidence({
  activations:{personality:[],design:[]},
  structure,
  calculation:{engine_name:"ky-hd-engine",engine_version:"1.0.0",ephemeris_provider:"Swiss Ephemeris",ephemeris_version:"2.10.03"},
  sources:["SRC_HD_DEFINITIVE_BOOK_2011"]
});

const gateEvidence = getEvidence(evidence,"E-GATES");
const packet = buildEvidenceKnowledgePacket(gateEvidence);

assert.ok(getKnowledgeForEvidence("E-GATES").length > 0);
assert.equal(packet.evidence.id,"E-GATES");
assert.equal(packet.knowledge[0].id,"HD-KNOW-GATE-001");
assert.equal(packet.interpretation_allowed,false);
assert.equal(getSource("SRC_HD_DEFINITIVE_BOOK_2011").rights_status,"copyrighted");

const authorityPacket = buildEvidenceKnowledgePacket(getEvidence(evidence,"E-AUTHORITY"));
assert.ok(authorityPacket.knowledge.some(x => x.id === "HD-KNOW-AUTHORITY-001"));

console.log("KNOWLEDGE RETRIEVAL PASS");
