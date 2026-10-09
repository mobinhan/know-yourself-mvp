import assert from "node:assert/strict";
import fs from "node:fs";
import { getKnowledgeRelationships, getQuarterGateMap, retrieveHolisticContext } from "./holistic-retrieval.js";

const graph = getKnowledgeRelationships();
assert.ok(graph.nodes.some(node => node.id === "quarter"));
assert.ok(graph.nodes.some(node => node.id === "rave_psychology"));

const knownIds = new Set(JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8")).records.map(record => record.id));
const externalIds = new Set(JSON.parse(fs.readFileSync(new URL("./external-knowledge-records.json", import.meta.url), "utf8")).records.map(record => record.id));
const nodeIds = new Set(graph.nodes.map(node => node.id));
for (const edge of graph.edges) {
  assert.ok(nodeIds.has(edge.from), `Unknown relationship source node: ${edge.id}`);
  assert.ok(nodeIds.has(edge.to), `Unknown relationship target node: ${edge.id}`);
  for (const id of edge.knowledge_ids ?? []) assert.ok(knownIds.has(id), `Unknown knowledge record ${id} in ${edge.id}`);
  for (const id of edge.external_knowledge_ids ?? []) assert.ok(externalIds.has(id), `Unknown external knowledge record ${id} in ${edge.id}`);
  if (edge.status === "pending_evidence") {
    assert.equal((edge.knowledge_ids ?? []).length, 0);
    assert.equal((edge.external_knowledge_ids ?? []).length, 0);
  }
  if (edge.status === "validated") assert.ok((edge.knowledge_ids ?? []).length + (edge.external_knowledge_ids ?? []).length > 0);
}


const controlledSources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const externalSources = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
const controlledSourceIds = new Set(controlledSources.sources.map(source => source.id));
const externalSourceById = new Map(externalSources.sources.map(source => [source.id, source]));

const quarterMap = getQuarterGateMap();
assert.equal(quarterMap.status, "validated");
assert.ok(controlledSourceIds.has(quarterMap.source_id));
assert.ok(quarterMap.source_locator.includes("pp. 294–309"));
assert.equal(externalSourceById.get(quarterMap.secondary_crosscheck_source_id)?.tier, "P3");
const mappedGates = quarterMap.quarters.flatMap(quarter => quarter.gates);
assert.equal(mappedGates.length, 64);
assert.equal(new Set(mappedGates).size, 64);
assert.deepEqual([...mappedGates].sort((a,b)=>a-b), Array.from({length:64},(_,i)=>i+1));
for (const quarter of quarterMap.quarters) assert.equal(quarter.gates.length, 16);
assert.equal(quarterMap.quarters.find(q => q.id === "initiation").gates[0], 13);
assert.equal(quarterMap.quarters.find(q => q.id === "civilization").gates[0], 2);
assert.equal(quarterMap.quarters.find(q => q.id === "duality").gates[0], 7);
assert.equal(quarterMap.quarters.find(q => q.id === "mutation").gates[0], 1);
const expectedQuarterGates = {
  initiation: [13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24],
  civilization: [2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33],
  duality: [7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44],
  mutation: [1,43,14,34,9,5,26,11,10,58,38,54,61,60,41,19]
};
for (const [id, gates] of Object.entries(expectedQuarterGates)) {
  assert.deepEqual(quarterMap.quarters.find(quarter => quarter.id === id).gates, gates);
}


const crossQuarter = retrieveHolisticContext({
  concept: "gate",
  gateNumbers: [34, 42, 53],
  chartGateSet: [34, 42, 53]
});
assert.deepEqual(crossQuarter.gate_quarter_context.map(x => [x.gate,x.quarter]), [
  [34,"Mutation"], [42,"Initiation"], [53,"Civilization"]
]);
assert.ok(crossQuarter.gate_quarter_context.every(x => x.chart_defined && x.mapping_status === "validated"));
assert.ok(crossQuarter.external_records.some(x => x.id === "EXT-KNOW-QUARTERS-001" && x.status === "accepted"));
assert.ok(crossQuarter.external_records.some(x => x.id === "EXT-KNOW-QUARTER-GATE-MAP-001" && x.status === "accepted"));

const rpNodes = retrieveHolisticContext({ concept: "personality_nodes" });
assert.ok(rpNodes.external_records.some(x => x.id === "EXT-KNOW-RP-VIEW-001"));
const rpSun = retrieveHolisticContext({ concept: "personality_sun" });
assert.ok(rpSun.external_records.some(x => x.id === "EXT-KNOW-RP-MOTIVATION-001"));

const rpColorMatch = retrieveHolisticContext({
  concept: "rave_psychology",
  maxHops: 2,
  personalitySunColour: 3,
  personalityNodeColours: [6,6]
});
assert.ok(rpColorMatch.relationships.some(x => x.id === "REL-PERSONALITY-SUN-NODES-COLOR-TRANSFERENCE-3-6"));
assert.ok(rpColorMatch.records.some(x => x.id === "HD-KNOW-RP-TRANSFERENCE-3-6-001"));

const rpColorMismatch = retrieveHolisticContext({
  concept: "rave_psychology",
  maxHops: 2,
  personalitySunColour: 2,
  personalityNodeColours: [6,6]
});
assert.ok(!rpColorMismatch.relationships.some(x => x.id === "REL-PERSONALITY-SUN-NODES-COLOR-TRANSFERENCE-3-6"));
assert.ok(!rpColorMismatch.records.some(x => x.id === "HD-KNOW-RP-TRANSFERENCE-3-6-001"));

const gateContext = retrieveHolisticContext({ concept: "gate", maxHops: 1 });
assert.equal(gateContext.missing_concept, false);
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-GATE-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-LINE-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-CHANNEL-001"));
assert.ok(gateContext.records.some(record => record.id === "HD-KNOW-PLANETARY-001"));
assert.ok(gateContext.relationships.some(edge => edge.type === "interpreted_with"));
assert.ok(gateContext.external_records.some(item => item.id === "EXT-KNOW-QUARTERS-001"));
assert.ok(gateContext.unresolved_context.some(item => item.concept_id === "rave_psychology"));
assert.ok(gateContext.unresolved_context.every(item => item.reason.includes("No validated knowledge records")));

const deeper = retrieveHolisticContext({ concept: "gate", maxHops: 2 });
assert.ok(deeper.records.some(record => record.id === "HD-KNOW-HOLISTIC-001"));

const unknown = retrieveHolisticContext({ concept: "made_up_concept" });
assert.equal(unknown.missing_concept, true);
assert.equal(unknown.records.length, 0);

console.log("HOLISTIC RETRIEVAL PASS");
