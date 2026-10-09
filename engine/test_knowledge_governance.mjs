import assert from "node:assert/strict";
import { buildReviewQueue, buildSourceChangeImpact, buildSourceImpactIndex } from "./knowledge-governance.js";

const index = buildSourceImpactIndex();
assert.ok(index.controlled_source_count >= 6);
assert.ok(index.external_source_count >= 8);
assert.ok(index.by_source_id.SRC_RP_YEAR1_SEM2.some(record => record.record_id === "HD-KNOW-RP-TRANSFERENCE-3-6-001"));
assert.ok(index.by_source_id.EXT_JOVIAN_ARCHIVE.some(record => record.record_id === "EXT-KNOW-QUARTERS-001"));

const queue = buildReviewQueue({ asOfDate: "2026-10-09" });
assert.ok(queue.some(record => record.record_id === "HD-KNOW-FOUNDATION-001" && record.review_status === "legacy_review_required"));
assert.ok(!queue.some(record => record.record_id === "HD-KNOW-RP-TRANSFERENCE-3-6-001"));
const dueQueue = buildReviewQueue({ asOfDate: "2027-01-09" });
assert.ok(dueQueue.some(record => record.record_id === "HD-KNOW-RP-TRANSFERENCE-3-6-001" && record.review_status === "reviewed"));

const rightsImpact = buildSourceChangeImpact({ sourceId: "SRC_RP_YEAR1_SEM2", eventType: "rights_changed" });
assert.equal(rightsImpact.affected_record_count, 5);
assert.equal(rightsImpact.action, "pause_use_and_review_rights_for_dependent_claims");
assert.ok(rightsImpact.affected_records.some(record => record.record_id === "HD-KNOW-RP-TRANSFERENCE-3-6-001"));
assert.equal(rightsImpact.requires_review, true);

const emptyImpact = buildSourceChangeImpact({ sourceId: "UNKNOWN_SOURCE", eventType: "content_changed" });
assert.equal(emptyImpact.affected_record_count, 0);
assert.ok(emptyImpact.note.includes("dependency completeness"));

assert.throws(() => buildReviewQueue(), /asOfDate must be an explicit/);
console.log("KNOWLEDGE GOVERNANCE PASS");
