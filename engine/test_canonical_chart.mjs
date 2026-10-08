import assert from "node:assert/strict";
import { buildCanonicalChart } from "./canonical-chart.mjs";

const activations = {
  personality: [
    { body: "sun", gate: 42, line: 5 },
    { body: "earth", gate: 32, line: 5 },
    { body: "moon", gate: 38, line: 2 },
    { body: "north_node", gate: 53, line: 2 },
    { body: "south_node", gate: 54, line: 2 }
  ],
  design: [
    { body: "sun", gate: 60, line: 1 },
    { body: "earth", gate: 56, line: 1 },
    { body: "moon", gate: 50, line: 6 },
    { body: "north_node", gate: 62, line: 2 },
    { body: "south_node", gate: 61, line: 2 }
  ]
};

const catalog = [
  { channel: "3-60", gates: [3,60], centres: ["sacral","root"] },
  { channel: "11-56", gates: [11,56], centres: ["ajna","throat"] },
  { channel: "28-38", gates: [28,38], centres: ["spleen","root"] },
  { channel: "32-54", gates: [32,54], centres: ["spleen","root"] },
  { channel: "34-57", gates: [34,57], centres: ["sacral","spleen"] },
  { channel: "42-53", gates: [42,53], centres: ["sacral","root"] }
];

const chart = buildCanonicalChart({
  chartId: "golden-chart-2",
  birth: { local_datetime: "1982-04-15T07:38:00", timezone: "Europe/Amsterdam" },
  calculation: { engine_name: "ky-hd-engine", engine_version: "1.0.0", ephemeris_provider: "swiss_ephemeris" },
  activations,
  channelCatalog: catalog,
  sources: ["SRC_DEFINITIVE_BOOK"]
});

assert.equal(chart.contract_version, "1.0.0");
assert.equal(chart.structure.type, "generator");
assert.equal(chart.structure.authority, "sacral");
assert.equal(chart.structure.profile, "5/1");
assert.deepEqual(chart.structure.channels, ["3-60","11-56","28-38","32-54","34-57","42-53"]);
assert.equal(chart.evidence.version, "1.0.0");
assert.equal(chart.evidence.records.length, 9);
console.log("canonical chart: PASS");
