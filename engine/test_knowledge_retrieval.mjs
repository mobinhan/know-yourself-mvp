import assert from "node:assert/strict";
import { getKnowledgeForEvidence, getSource, getOntology, buildEvidenceKnowledgePacket } from "./knowledge-retrieval.js";

const channelKnowledge = getKnowledgeForEvidence("E-CHANNELS");
assert.ok(channelKnowledge.length >= 8);
assert.ok(channelKnowledge.some(x => x.id === "HD-KNOW-CHANNEL-3457-001"));
assert.ok(channelKnowledge.some(x => x.id === "HD-KNOW-CHANNEL-360-001"));

const deep = getKnowledgeForEvidence("E-CHANNELS", { depth: "L4" });
assert.ok(deep.length >= 5);

const authority = getKnowledgeForEvidence("E-AUTHORITY");
assert.ok(authority.some(x => x.id === "HD-KNOW-SACRAL-AUTHORITY-001"));

assert.equal(getSource("SRC_RAVE_ABC")?.title, "Rave ABC");
assert.equal(getSource("SRC_LIFE_FORCE_CHANNELS_2008")?.title, "The Life Force: The Channels");
assert.ok(getOntology().concept_families.structure.includes("channel"));

const packet = buildEvidenceKnowledgePacket({
  id: "E-TYPE",
  claim: "Type is derived mechanically.",
  inputs: ["centres"],
  result: "generator"
});
assert.equal(packet.evidence.id, "E-TYPE");
assert.ok(packet.knowledge.some(x => x.id === "HD-KNOW-GENERATOR-001"));
assert.equal(packet.interpretation_allowed, false);

console.log("KNOWLEDGE RETRIEVAL PASS");
