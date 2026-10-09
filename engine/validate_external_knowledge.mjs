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
  assert.match(source.url, /^https?:\/\//);
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
  if (record.conflict_group != null) assert.ok(typeof record.conflict_group === "string" && record.conflict_group.length > 0);
  assert.ok(record.allowed_use.every(x => contract.allowed_use.includes(x)));
  const metadata = record.record_metadata;
  assert.ok(metadata && metadata.record_version === "1.0.0" && metadata.lifecycle_status === "active");
  assert.ok(["foundational","interpretive","experiential","critical_contested"].includes(metadata.epistemic_class));
  assert.ok(["reviewed","legacy_review_required","review_due","conflict_requires_review"].includes(metadata.review_status));
  assert.ok(metadata.metadata_registered_at && metadata.rights_use_status && metadata.source_change_action);
  assert.ok(Array.isArray(metadata.supersedes));
  if (metadata.review_status === "reviewed") {
    assert.ok(metadata.last_reviewed_at);
    assert.ok(metadata.next_review_due);
  }
  if (metadata.conflict_group != null) assert.equal(metadata.conflict_group, record.conflict_group ?? null);
}
assert.ok(records.records.some(x => x.claim_type === "critical"));
assert.ok(records.records.some(x => x.claim_type === "teaching"));
console.log("EXTERNAL KNOWLEDGE VALIDATION PASS");
