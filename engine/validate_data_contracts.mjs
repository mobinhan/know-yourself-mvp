import fs from "node:fs";
import assert from "node:assert/strict";

const c = JSON.parse(fs.readFileSync(new URL("./data-contracts.json", import.meta.url)));

assert.equal(c.contract_version, "1.0.0");
for (const section of ["chart","temporal_state","lifecycle_event","connection","evidence"]) {
  assert.equal(c[section].contract_version, "1.0.0", section + " contract version");
}
assert.equal(c.chart.required.includes("structure"), true);
assert.deepEqual(c.temporal_state.states, ["natal","transit","temporary","combined"]);
assert.equal(c.lifecycle_event.timestamp_rule.includes("Exact astronomical event timestamp"), true);
assert.equal(c.connection.interpretation_forbidden.includes("dominance"), true);
assert.equal(c.connection.interpretation_forbidden.includes("compatibility"), true);
assert.equal(c.evidence.required.includes("records"), true);

console.log("data contracts: PASS");
