import assert from "node:assert/strict";
import { deriveTransitOverlay, compareTransitOverlay } from "./mechanics.js";

const catalog = [
  { channel: "3-60", gates: [3,60], centres: ["sacral","root"] },
  { channel: "34-57", gates: [34,57], centres: ["sacral","spleen"] },
  { channel: "11-56", gates: [11,56], centres: ["ajna","throat"] }
];

const natal = [
  { body:"sun", gate:3, line:1 },
  { body:"earth", gate:60, line:1 },
  { body:"moon", gate:34, line:2 }
];

const transit = [
  { body:"sun", gate:57, line:4 },
  { body:"earth", gate:11, line:2 },
  { body:"mercury", gate:56, line:5 }
];

const overlay = deriveTransitOverlay({
  natalActivations:natal,
  transitActivations:transit,
  channel_catalog:catalog
});

assert.deepEqual(overlay.natal.gates, [3,34,60]);
assert.deepEqual(overlay.natal.channels, ["3-60"]);
assert.deepEqual(overlay.natal.centres, ["root","sacral"]);

assert.deepEqual(overlay.transit.gates, [11,56,57]);
assert.deepEqual(overlay.transit.channels, ["11-56"]);
assert.deepEqual(overlay.transit.centres, ["ajna","throat"]);

assert.deepEqual(overlay.temporary.gates, [11,56,57]);
assert.deepEqual(overlay.temporary.channels, ["11-56","34-57"]);
assert.deepEqual(overlay.temporary.centres, ["ajna","spleen","throat"]);

assert.deepEqual(overlay.combined.gates, [3,11,34,56,57,60]);
assert.deepEqual(overlay.combined.channels, ["11-56","3-60","34-57"]);
assert.deepEqual(overlay.combined.centres, ["ajna","root","sacral","spleen","throat"]);

/* Natal definition is not mutated by transit mechanics. */
assert.deepEqual(natal, [
  { body:"sun", gate:3, line:1 },
  { body:"earth", gate:60, line:1 },
  { body:"moon", gate:34, line:2 }
]);

const expected = JSON.parse(JSON.stringify(overlay));
assert.equal(compareTransitOverlay(overlay, expected).ok, true);

const broken = JSON.parse(JSON.stringify(overlay));
broken.temporary.gates.push(1);
assert.equal(compareTransitOverlay(broken, expected).ok, false);

console.log("TRANSIT OVERLAY MECHANICS PASS");
