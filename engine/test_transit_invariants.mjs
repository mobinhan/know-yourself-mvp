import assert from "node:assert/strict";
import { deriveTransitOverlay } from "./mechanics.js";

const catalog=[
 {channel:"3-60",gates:[3,60],centres:["sacral","root"]},
 {channel:"34-57",gates:[34,57],centres:["sacral","spleen"]},
 {channel:"11-56",gates:[11,56],centres:["ajna","throat"]}
];

const natal=[
 {body:"sun",gate:3,line:1},
 {body:"earth",gate:60,line:1},
 {body:"moon",gate:34,line:2}
];
const transit=[
 {body:"uranus",gate:57,line:4},
 {body:"saturn",gate:11,line:2},
 {body:"jupiter",gate:56,line:5}
];

const shuffled=[transit[2],transit[0],transit[1],transit[1]];
const a=deriveTransitOverlay({natalActivations:natal,transitActivations:transit,channel_catalog:catalog});
const b=deriveTransitOverlay({natalActivations:[natal[2],natal[0],natal[1]],transitActivations:shuffled,channel_catalog:catalog});

assert.deepEqual(a,b);

/* Transit already present natally is not temporary. */
const overlap=deriveTransitOverlay({
 natalActivations:[{body:"sun",gate:3,line:1}],
 transitActivations:[{body:"moon",gate:3,line:2}],
 channel_catalog:[]
});
assert.deepEqual(overlap.temporary.gates,[]);
assert.deepEqual(overlap.combined.gates,[3]);

console.log("TRANSIT INVARIANTS PASS");
