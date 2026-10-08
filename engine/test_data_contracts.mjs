import assert from "node:assert/strict";
import { buildCanonicalChart } from "./canonical-chart.mjs";
import { deriveTemporalState, assertTemporalState } from "./temporal_state.js";
import { deriveConnectionMechanics } from "./connection_mechanics.js";
import { eventKey } from "./time_mechanics.js";

const catalog = [
  { channel:"3-60", gates:[3,60], centres:["sacral","root"] },
  { channel:"11-56", gates:[11,56], centres:["ajna","throat"] },
  { channel:"28-38", gates:[28,38], centres:["spleen","root"] },
  { channel:"32-54", gates:[32,54], centres:["spleen","root"] },
  { channel:"34-57", gates:[34,57], centres:["sacral","spleen"] },
  { channel:"42-53", gates:[42,53], centres:["sacral","root"] }
];
const activations = {
  personality:[{body:"sun",gate:42,line:5},{body:"earth",gate:32,line:5},{body:"moon",gate:38,line:2},{body:"north_node",gate:53,line:2},{body:"south_node",gate:54,line:2},{body:"mercury",gate:3,line:3},{body:"venus",gate:11,line:4},{body:"mars",gate:28,line:6},{body:"uranus",gate:34,line:5},{body:"saturn",gate:57,line:4}],
  design:[{body:"sun",gate:60,line:1},{body:"earth",gate:56,line:1},{body:"moon",gate:50,line:6},{body:"north_node",gate:62,line:2},{body:"south_node",gate:61,line:2},{body:"mercury",gate:13,line:3},{body:"venus",gate:41,line:2},{body:"mars",gate:48,line:4},{body:"jupiter",gate:44,line:1},{body:"uranus",gate:34,line:4},{body:"saturn",gate:32,line:2},{body:"neptune",gate:11,line:4}]
};
const chart = buildCanonicalChart({
  chartId:"contract-test",
  birth:{local_datetime:"1982-04-15T07:38:00",timezone:"Europe/Amsterdam"},
  calculation:{engine_name:"ky-hd-engine",engine_version:"1.0.0",ephemeris_provider:"swiss_ephemeris"},
  activations, channelCatalog:catalog, sources:["SRC_DEFINITIVE_BOOK"]
});
assert.equal(chart.contract_version,"1.0.0");
assert.ok(chart.evidence.records.length > 0);

const temporal = deriveTemporalState({
  natalActivations:[...activations.personality,...activations.design],
  transitActivations:[{body:"transit_sun",gate:34,line:1}],
  channel_catalog:catalog
});
assertTemporalState(temporal);
assert.ok(["natal","transit","temporary","combined"].every(k => temporal[k]));

const connection = deriveConnectionMechanics({
  chartA:{activations:[{gate:3},{gate:34}]},
  chartB:{activations:[{gate:60},{gate:57}]},
  channel_catalog:catalog
});
assert.ok(Array.isArray(connection.shared_gates));
assert.ok(Array.isArray(connection.electromagnetic_channels));
assert.ok(Array.isArray(connection.combined.gates));

const event = {type:"uranus_opposition",timestamp:"2024-04-15T12:00:00Z"};
assert.equal(eventKey(event),"uranus_opposition@2024-04-15T12:00:00.000Z");

console.log("contract integration: PASS");
