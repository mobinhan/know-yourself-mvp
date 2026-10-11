import assert from "node:assert/strict";
import { evaluateCorrectionCandidate, mayMutateCanonicalSource } from "./correction-governance.js";

const reported = evaluateCorrectionCandidate({
  id: "corr-reported-1",
  category: "interpretation",
  scope: "user_specific",
  summary: "The interpretation did not match the user's stated experience.",
  reporter: "user",
  source_ref: "conversation:test-turn-1",
  persistence_consent: true
});
assert.equal(reported.accepted, true);
assert.equal(reported.status, "reported", "feedback must start as reported, not verified");
assert.equal(reported.record.reviewer, null);
assert.equal(reported.canonical_source_mutation_allowed, false);

const noConsent = evaluateCorrectionCandidate({
  category: "user_context", scope: "user_specific", summary: "Prefers more context",
  reporter: "user", source_ref: "conversation:test-turn-2", persistence_consent: false
});
assert.equal(noConsent.accepted, false);
assert.ok(noConsent.issues.includes("persistence_consent_required"));

const unverifiedGlobalClaim = evaluateCorrectionCandidate({
  category: "source_knowledge", scope: "shared_knowledge", summary: "Change a shared teaching claim",
  reporter: "user", source_ref: "conversation:test-turn-3", persistence_consent: true, status: "verified"
});
assert.equal(unverifiedGlobalClaim.accepted, false);
assert.ok(unverifiedGlobalClaim.issues.includes("verified_requires_reviewer"));
assert.ok(unverifiedGlobalClaim.issues.includes("verified_requires_evidence_refs"));

const verifiedKnowledge = evaluateCorrectionCandidate({
  id: "corr-verified-1",
  category: "source_knowledge",
  scope: "shared_knowledge",
  summary: "A sourced record needs a correction.",
  reporter: "assistant",
  source_ref: "incident:regression-42",
  persistence_consent: true,
  status: "verified",
  reviewer: "human-review",
  resolution: "Updated after source review.",
  evidence_refs: ["SRC-PRIMARY-1"],
  related_test_ref: "engine/test-knowledge-regression.mjs"
});
assert.equal(verifiedKnowledge.accepted, true);
assert.equal(verifiedKnowledge.status, "verified");
assert.deepEqual(verifiedKnowledge.record.evidence_refs, ["SRC-PRIMARY-1"]);
assert.equal(verifiedKnowledge.canonical_source_mutation_allowed, false);

const mechanicsWithoutTest = evaluateCorrectionCandidate({
  category: "chart_mechanics", scope: "canonical_mechanics", summary: "Change a calculation rule",
  reporter: "assistant", source_ref: "incident:mechanics-1", persistence_consent: true,
  status: "verified", reviewer: "human-review", resolution: "Reviewed",
  evidence_refs: ["SPEC-1"]
});
assert.equal(mechanicsWithoutTest.accepted, false);
assert.ok(mechanicsWithoutTest.issues.includes("verified_mechanics_change_requires_regression_test_ref"));

const invalidSupersession = evaluateCorrectionCandidate({
  category: "workflow", scope: "engineering_workflow", summary: "Replace an old rule",
  reporter: "assistant", source_ref: "incident:workflow-1", persistence_consent: true,
  status: "superseded"
});
assert.equal(invalidSupersession.accepted, false);
assert.ok(invalidSupersession.issues.includes("superseded_requires_successor"));
assert.equal(mayMutateCanonicalSource(), false);

console.log("CORRECTION GOVERNANCE PASS");
