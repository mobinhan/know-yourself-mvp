import assert from "node:assert/strict";
import fs from "node:fs";
import { getKnowledgeRelationships, retrieveHolisticContext } from "./holistic-retrieval.js";

const graph = getKnowledgeRelationships();
assert.ok(graph.nodes.some(node => node.id === "quarter"));
assert.ok(graph.nodes.some(node => node.id === "rave_psychology"));

const knownIds = new Set(JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8")).records.map(record => record.id));
const nodeIds = new Set(graph.nodes.map(node => node.id));
for (const edge of graph.edges) {
  assert.ok(nodeIds.has(edge.from), `Unknown relationship source node: ${edge.id}`);
  assert.ok(nodeIds.has(edge.to), `Unknown relationship target node: ${edge.id}`);
  for (const id of edge.knowledge_ids) assert.ok(knownIds.has(id), `Unknown knowledge record ${id} in ${edge.id}`);
  if (edge.status === "pending_evidence") assert.equal(edge.knowledge_ids.length, 0);
  if (edge.status === "validated") assert.ok(edge.knowledge_ids.length > 0);
}

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
