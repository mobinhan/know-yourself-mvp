import assert from "node:assert/strict";
import fs from "node:fs";
const registry = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
const contract = JSON.parse(fs.readFileSync(new URL("./external-knowledge-contract.json", import.meta.url), "utf8"));
const records = JSON.parse(fs.readFileSync(new URL("./external-knowledge-records.json", import.meta.url), "utf8"));
assert.equal(registry.version, "1.0.0");
assert.equal(contract.version, "1.0.0");
assert.equal(records.version, "1.0.0");
assert.ok(registry.sources.length >= 6);
const sourceIds = new Set(registry.sources.map(x => x.id));
for (const source of registry.sources) {
  assert.ok(source.id);
  assert.ok(sourceIds.has(source.id));
  assert.match(source.url, /^https?:\\/\\//);
  assert.ok(["P1","P2","P3","P4"].includes(source.tier));
  assert.ok(source.content_types.length > 0);
  assert.ok(source.rights_policy);
}
const claimIds = new Set();
for (const record of records.records) {
  assert.ok(record.id && !claimIds.has(record.id));
  claimIds.add(record.id);
  assert.ok(sourceIds.has(record.source_id));
  assert.ok(contract.claim_types.includes(record.claim_type));
  assert.ok(contract.claim_status.includes(record.status));
  assert.ok(record.locator);
  assert.ok(record.allowed_use.every(x => contract.allowed_use.includes(x)));
}
assert.ok(records.records.some(x => x.claim_type === "critical"));
assert.ok(records.records.some(x => x.claim_type === "teaching"));
console.log("EXTERNAL KNOWLEDGE VALIDATION PASS");
