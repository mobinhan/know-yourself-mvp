import assert from "node:assert/strict";
import { evaluateMemoryCandidate, selectActiveMemoryForPrompt } from "./user-memory-governance.js";

const explicit = evaluateMemoryCandidate({
  id: "mem-explicit",
  category: "preference",
  value: "Explain Human Design in advanced detail",
  origin: "explicit",
  user_confirmed: true,
  source_turn_id: "turn-12",
  expires_at: "2030-01-01T00:00:00.000Z"
}, { personalizationConsent: true });
assert.equal(explicit.accepted, true);
assert.equal(explicit.status, "active");

const inferred = evaluateMemoryCandidate({
  id: "mem-inferred",
  category: "communication_style",
  value: "May prefer concise answers",
  origin: "inferred",
  confidence: 0.93,
  user_consent: true,
  source_turn_id: "turn-13"
}, { personalizationConsent: true });
assert.equal(inferred.accepted, true);
assert.equal(inferred.status, "proposed", "inferred memories must not silently become active");

const lowConfidence = evaluateMemoryCandidate({
  category: "preference", value: "Prefers short answers", origin: "inferred",
  confidence: 0.79, user_consent: true, source_turn_id: "turn-14"
}, { personalizationConsent: true });
assert.equal(lowConfidence.accepted, false);
assert.ok(lowConfidence.issues.includes("inferred_confidence_below_threshold"));

const chartTruth = evaluateMemoryCandidate({
  category: "chart_truth", value: "Authority is emotional", origin: "explicit",
  user_confirmed: true, source_turn_id: "turn-15"
}, { personalizationConsent: true });
assert.equal(chartTruth.accepted, false);
assert.ok(chartTruth.issues.includes("category_not_allowed"));

const noConsent = evaluateMemoryCandidate({
  category: "goal", value: "Understand decision patterns", origin: "explicit",
  user_confirmed: true, source_turn_id: "turn-16"
}, { personalizationConsent: false });
assert.equal(noConsent.accepted, false);

const promptMemory = selectActiveMemoryForPrompt([
  explicit.record,
  inferred.record,
  { id: "expired", category: "goal", value: "Old goal", origin: "explicit", status: "active", user_consent: true, user_confirmed: true, source_turn_id: "turn-1", expires_at: "2020-01-01T00:00:00.000Z" },
  { id: "unconfirmed", category: "goal", value: "Inference", origin: "inferred", status: "active", user_consent: true, user_confirmed: false, source_turn_id: "turn-2" }
], { now: "2026-10-09T00:00:00.000Z" });
assert.deepEqual(promptMemory.map(item => item.id), ["mem-explicit"]);
console.log("USER MEMORY GOVERNANCE PASS");
