import assert from "node:assert/strict";
import fs from "node:fs";
import { buildEvidence } from "./evidence.js";
import { understandQuestion } from "./question-understanding.js";
import { buildReasoningInput } from "./evidence-selection.js";
import { buildReasoningPromptInput } from "./answer-composer.js";

const chart = JSON.parse(fs.readFileSync(new URL("./golden-chart.json", import.meta.url), "utf8"));
const activations = chart.activations;
const expected = chart.expected;
const gateSet = [...new Set([
  ...activations.personality.map(item => item.gate),
  ...activations.design.map(item => item.gate)
])].sort((a,b) => a-b);

for (const channel of ["3-60","11-56","28-38","32-54","34-57","42-53"]) {
  assert.ok(expected.channels.some(item => item.channel === channel), `Golden chart missing expected channel ${channel}`);
}

const structure = {
  gateSet,
  channels: expected.channels,
  centres: expected.centres,
  definition: expected.definition.components,
  type: expected.type,
  authority: expected.authority,
  profile: expected.profile,
  incarnation_cross: expected.incarnation_cross
};
const evidenceBundle = buildEvidence({
  activations,
  structure,
  calculation: chart.calculation,
  sources: ["SRC_HD_DEFINITIVE_BOOK_2011"]
});
const question = "Explain Gate 34 in my chart, including its Quarter and how Rave Psychology relates to my Personality Sun and Nodes.";
const questionContext = understandQuestion(question);
const reasoningInput = buildReasoningInput({
  questionContext,
  question,
  evidenceBundle,
  knowledgePackets: []
});
assert.equal(reasoningInput.ready_for_reasoning, true);

const prompt = buildReasoningPromptInput(reasoningInput);
const gateContext = prompt.holistic_context.find(item => item.concept === "gate");
assert.ok(gateContext, "Gate context must be included");
assert.ok(gateContext.gate_quarter_context.some(item =>
  item.gate === 34 && item.quarter === "Mutation" && item.chart_defined === true
), "Gate 34 must resolve to its sourced quarter in this chart");
assert.equal(gateContext.gate_quarter_context.find(item => item.gate === 34).mapping_status, "provisional");
assert.ok(gateContext.external_records.some(item => item.id === "EXT-KNOW-QUARTERS-001"));
assert.ok(gateContext.external_records.some(item => item.id === "EXT-KNOW-QUARTER-GATE-MAP-001" && item.status === "provisional"));

const rp = prompt.rave_psychology_context;
assert.ok(rp, "Rave Psychology context should be supplied from actual chart substructure");
assert.deepEqual(
  [rp.chart_substructure.personality_sun.gate, rp.chart_substructure.personality_sun.line, rp.chart_substructure.personality_sun.colour],
  [42, 5, 3]
);
assert.deepEqual(
  [rp.chart_substructure.personality_north_node.gate, rp.chart_substructure.personality_north_node.line, rp.chart_substructure.personality_north_node.colour],
  [53, 2, 6]
);
assert.deepEqual(
  [rp.chart_substructure.personality_south_node.gate, rp.chart_substructure.personality_south_node.line, rp.chart_substructure.personality_south_node.colour],
  [54, 2, 6]
);
assert.ok(rp.framework.external_records.some(item => item.id === "EXT-KNOW-RP-VIEW-001"));
assert.ok(rp.framework.external_records.some(item => item.id === "EXT-KNOW-RP-MOTIVATION-001"));
assert.match(rp.relevance_note, /do not infer either from the queried gate alone/i);
assert.ok(prompt.instructions.some(item => item.includes("A gate's Quarter is wheel-level context")));

console.log("HOLISTIC CHART INTEGRATION PASS: gate + quarter + actual Personality Sun/Node substructure");
