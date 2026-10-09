import assert from "node:assert/strict";
import { buildConflictSets, buildExternalKnowledgePacket } from "./external-knowledge.js";

const conflicting = buildConflictSets([
  { id: "REC-A", source_id: "EXT_JOVIAN_ARCHIVE", status: "provisional", claim: "Gate 34 is assigned to Quarter A.", locator: "source A", conflict_group: "TEST-QUARTER-MAPPING" },
  { id: "REC-B", source_id: "EXT_HUMAN_DESIGN_SO", status: "disputed", claim: "Gate 34 is assigned to Quarter B.", locator: "source B", conflict_group: "TEST-QUARTER-MAPPING" }
]);
assert.equal(conflicting.length, 1);
assert.equal(conflicting[0].status, "conflict_requires_review");
assert.equal(conflicting[0].needs_review, true);
assert.deepEqual(conflicting[0].claims.map(x => x.id), ["REC-A","REC-B"]);
assert.ok(conflicting[0].instruction.includes("Do not silently merge"));

const sameClaim = buildConflictSets([
  { id: "REC-C", source_id: "EXT_JOVIAN_ARCHIVE", status: "accepted", claim: "Same claim.", locator: "source C", conflict_group: "TEST-SAME" },
  { id: "REC-D", source_id: "EXT_IHDS_OFFICIAL", status: "accepted", claim: "Same claim.", locator: "source D", conflict_group: "TEST-SAME" }
]);
assert.equal(sameClaim.length, 0);

const packet = buildExternalKnowledgePacket({ topics: ["rave_psychology"] });
assert.equal(packet.interpretation_only, true);
assert.ok(Array.isArray(packet.conflict_sets));
assert.ok(packet.records.some(x => x.id === "EXT-KNOW-RP-VIEW-001"));
console.log("EXTERNAL KNOWLEDGE CONFLICT TEST PASS");
