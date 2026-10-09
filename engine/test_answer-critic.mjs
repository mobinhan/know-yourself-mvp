import assert from "node:assert/strict";
import { criticAnswer, finalizeAnswer } from "./answer-critic.js";

const evidence = [{id:"E-AUTHORITY"},{id:"E-TYPE"}];
const knowledge = [{id:"HD-KNOW-AUTHORITY-001"}];

const good = finalizeAnswer({
  answer:"Your chart evidence identifies sacral authority. The interpretation layer can then discuss how that may relate to your question.",
  factual_basis:["E-AUTHORITY"],
  knowledge_basis:["HD-KNOW-AUTHORITY-001"],
  interpretation:"This is an interpretation rather than a mechanical fact.",
  limitations:"Interpretation depends on the supplied knowledge.",
}, evidence, knowledge);

assert.equal(good.critic.passed,true);
assert.deepEqual(good.critic.issues,[]);

const bad = criticAnswer({
  answer:"The AI calculated your authority.",
  factual_basis:["E-FAKE"],
  knowledge_basis:["HD-FAKE"]
}, evidence, knowledge);
assert.equal(bad.passed,false);
assert.ok(bad.issues.some(x=>x.startsWith("unknown_factual_basis:")));
assert.ok(bad.issues.some(x=>x.startsWith("unknown_knowledge_basis:")));
assert.ok(bad.issues.some(x=>x.startsWith("forbidden_mechanical_claim:")));

const supportedRelationships = [
  { id: "REL-GATE-QUARTER", status: "validated" },
  { id: "REL-PERSONALITY-SUN-RP-MOTIVATION", status: "validated" },
  { id: "REL-PERSONALITY-NODES-RP-VIEW", status: "validated" }
];

const unsupportedLink = criticAnswer({
  answer: "Gate 34 determines your Motivation in Rave Psychology.",
  relationship_basis: [],
  suppliedRelationships: supportedRelationships
});
assert.equal(unsupportedLink.passed, false);
assert.ok(unsupportedLink.issues.includes("unsupported_cross_concept_claim:gate_to_rave_psychology"));

const missingRelationshipBasis = criticAnswer({
  answer: "Gate 34 falls in the Mutation quarter. Personality Sun Color is linked to Motivation, and Personality Nodes Color is linked to View.",
  relationship_basis: [],
  suppliedRelationships: supportedRelationships
});
assert.equal(missingRelationshipBasis.passed, false);
assert.ok(missingRelationshipBasis.issues.includes("missing_relationship_basis:REL-GATE-QUARTER"));
assert.ok(missingRelationshipBasis.issues.includes("missing_relationship_basis:REL-PERSONALITY-SUN-RP-MOTIVATION"));
assert.ok(missingRelationshipBasis.issues.includes("missing_relationship_basis:REL-PERSONALITY-NODES-RP-VIEW"));

const supportedLink = criticAnswer({
  answer: "Gate 34 falls in the Mutation quarter. Personality Sun Color is linked to Motivation, and Personality Nodes Color is linked to View.",
  relationship_basis: ["REL-GATE-QUARTER","REL-PERSONALITY-SUN-RP-MOTIVATION","REL-PERSONALITY-NODES-RP-VIEW"],
  suppliedRelationships: supportedRelationships
});
assert.equal(supportedLink.passed, true);

console.log("ANSWER CRITIC PASS");
