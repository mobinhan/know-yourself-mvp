import assert from "node:assert/strict";
import { deriveConnectionMechanics } from "./connection_mechanics.js";

const catalog = [
  {channel:"3-60",gates:[3,60],centres:["sacral","root"]},
  {channel:"11-56",gates:[11,56],centres:["ajna","throat"]},
  {channel:"34-57",gates:[34,57],centres:["sacral","spleen"]}
];

const a = {activations:[{gate:3},{gate:60},{gate:34}]};
const b = {activations:[{gate:11},{gate:56},{gate:57}]};

const c = deriveConnectionMechanics({chartA:a,chartB:b,channel_catalog:catalog});

assert.deepEqual(c.chart_a.channels,["3-60"]);
assert.deepEqual(c.chart_b.channels,["11-56"]);
assert.deepEqual(c.shared_gates,[]);
assert.deepEqual(c.electromagnetic_channels,["34-57"]);
assert.deepEqual(c.combined.gates,[3,11,34,56,57,60]);
assert.deepEqual(c.combined.channels,["11-56","3-60","34-57"]);

/* Shared gate must be detected without changing either chart. */
const shared = deriveConnectionMechanics({
  chartA:{activations:[{gate:3}]},
  chartB:{activations:[{gate:3}]},
  channel_catalog:catalog
});
assert.deepEqual(shared.shared_gates,[3]);

console.log("CONNECTION MECHANICS PASS");
