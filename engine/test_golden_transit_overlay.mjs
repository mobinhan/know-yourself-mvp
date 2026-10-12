import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deriveTransitOverlay } from "./mechanics.js";

const catalogue = JSON.parse(readFileSync(new URL("./channel-catalog.json", import.meta.url), "utf8")).channels;
const gates = (...values) => values.map((gate, i) => ({ body: `gate_${gate}_${i}`, gate, line: 1 }));

// Golden Chart #2 natal gate set, reduced to unique gates for overlay mechanics.
const natal = gates(3,11,13,18,28,32,34,37,38,41,42,44,48,50,53,54,56,57,60,61,62);
const transit = [
  [57,4],[51,4],[30,5],[29,5],[28,5],[1,1],[28,6],[33,1],
  [4,3],[21,2],[20,6],[25,5],[41,2]
].map(([gate,line], i) => ({body:`transit_${i}`,gate,line}));

const overlay = deriveTransitOverlay({natalActivations:natal, transitActivations:transit, channel_catalog:catalogue});

assert.deepEqual(overlay.natal.channels, ["11-56","28-38","3-60","32-54","34-57","42-53"].sort((a,b)=>a.localeCompare(b)));
assert.deepEqual(overlay.temporary.channels, ["13-33","20-34","20-57","25-51","30-41"].sort((a,b)=>a.localeCompare(b)));
assert.deepEqual(overlay.transit.channels, ["20-57","25-51","30-41"]);
assert.deepEqual(overlay.temporary.centres, ["g","heart","solar_plexus"]);

// The overlay may define additional centres/channels, but must not mutate natal input
// or recalculate natal definition, type, strategy, or authority.
assert.equal(natal.length, 21);
assert.deepEqual(overlay.natal.channels, ["11-56","28-38","3-60","32-54","34-57","42-53"].sort((a,b)=>a.localeCompare(b)));
console.log("GOLDEN CHART TEMPORARY CHANNEL OVERLAY PASS");
