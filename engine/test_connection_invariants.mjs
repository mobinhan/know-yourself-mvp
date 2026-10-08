import assert from "node:assert/strict";
import { deriveConnectionMechanics } from "./connection_mechanics.js";

const catalog = [
 {channel:"3-60",gates:[3,60],centres:["sacral","root"]},
 {channel:"11-56",gates:[11,56],centres:["ajna","throat"]},
 {channel:"34-57",gates:[34,57],centres:["sacral","spleen"]}
];

const a={activations:[{gate:3},{gate:60},{gate:34}]};
const b={activations:[{gate:11},{gate:56},{gate:57}]};

const ab=deriveConnectionMechanics({chartA:a,chartB:b,channel_catalog:catalog});
const ba=deriveConnectionMechanics({chartA:b,chartB:a,channel_catalog:catalog});

assert.deepEqual(ab.electromagnetic_channels,["34-57"]);
assert.deepEqual(ba.electromagnetic_channels,["34-57"]);
assert.deepEqual(ab.combined,ba.combined);
assert.deepEqual(ab.shared_gates,ba.shared_gates);

/* A complete channel in both charts is not electromagnetic. */
const bothComplete=deriveConnectionMechanics({
 chartA:{activations:[{gate:34},{gate:57}]},
 chartB:{activations:[{gate:34},{gate:57}]},
 channel_catalog:catalog
});
assert.deepEqual(bothComplete.electromagnetic_channels,[]);
assert.deepEqual(bothComplete.combined.channels,["34-57"]);

/* Duplicate activations cannot alter structural output. */
const duplicated=deriveConnectionMechanics({
 chartA:{activations:[{gate:3},{gate:3},{gate:60}]},
 chartB:{activations:[{gate:57},{gate:11},{gate:56}]},
 channel_catalog:catalog
});
assert.deepEqual(duplicated.chart_a.gates,[3,60]);
assert.deepEqual(duplicated.chart_b.gates,[11,56,57]);

console.log("CONNECTION INVARIANTS PASS");
