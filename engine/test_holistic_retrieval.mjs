import assert from "node:assert/strict";
import { getKnowledgeRelationships, retrieveHolisticContext } from "./holistic-retrieval.js";

const graph = getKnowledgeRelationships();
assert.ok(graph.nodes.some(node => node.id === "quarter"));
assert.ok(graph.nodes.some(node => node.id === "rave_psychology"));

const gateContext = retrieveHolisticContext({ concept: "gate", maxHops: 1 });
assert.equal(gateContext.missing_concept, false);
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-GATE-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-LINE-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-CHANNEL-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-PLANETARY-001"));
assert.ok(gateContext.relationships.some(edge => edge.type === "interpreted_with"));
assert.ok(gateContext.unresolved_context.some(item => item.concept_id === "quarter"));
assert.ok(gateContext.unresolved_context.some(item => item.concept_id === "rave_psychology"));
assert.ok(gateContext.unresolved_context.every(item => item.reason.includes("No validated knowledge records")));

const deeper = retrieveHolisticContext({ concept: "gate", maxHops: 2 });
assert.ok(deeper.records.some(record => record.id === "HD-KNOW-HOLISTIC-001"));

const unknown = retrieveHolisticContext({ concept: "made_up_concept" });
assert.equal(unknown.missing_concept, true);
assert.equal(unknown.records.length, 0);

console.log("HOLISTIC RETRIEVAL PASS");
