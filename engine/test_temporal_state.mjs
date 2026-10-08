import assert from "node:assert/strict";
import { deriveTemporalState, assertTemporalState } from "./temporal_state.js";

const catalog = [
 {channel:"3-60",gates:[3,60],centres:["sacral","root"]},
 {channel:"34-57",gates:[34,57],centres:["sacral","spleen"]},
 {channel:"11-56",gates:[11,56],centres:["ajna","throat"]}
];

const natal = [
 {body:"sun",gate:3,line:1},
 {body:"earth",gate:60,line:1},
 {body:"moon",gate:34,line:2}
];
const transit = [
 {body:"uranus",gate:57,line:4},
 {body:"saturn",gate:11,line:2},
 {body:"jupiter",gate:56,line:5}
];

const before = JSON.stringify(natal);
const state = deriveTemporalState({
 natalActivations:natal,
 transitActivations:transit,
 channel_catalog:catalog
});

assertTemporalState(state);
assert.equal(state.mode,"temporal_state");
assert.deepEqual(state.natal.channels,["3-60"]);
assert.deepEqual(state.combined.channels,["11-56","3-60","34-57"]);
assert.deepEqual(state.temporary.gates,[11,56,57]);
assert.equal(JSON.stringify(natal),before);

const second = deriveTemporalState({
 natalActivations:natal,
 transitActivations:transit,
 channel_catalog:catalog
});
assert.deepEqual(second,state);

console.log("TEMPORAL STATE INTEGRATION PASS");
