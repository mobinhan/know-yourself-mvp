import assert from "node:assert/strict";
import { understandQuestion } from "./question-understanding.js";

const career = understandQuestion("Why am I struggling with my career lately?");
assert.equal(career.intent, "interpretive");
assert.ok(career.domains.includes("career_purpose"));
assert.equal(career.requires_timing, true);
assert.ok(career.evidence_targets.includes("temporal_state"));

const authority = understandQuestion("What is my authority?");
assert.equal(authority.intent, "factual");
assert.ok(authority.evidence_targets.includes("authority"));
assert.equal(authority.requires_timing, false);

const timing = understandQuestion("When is this transit affecting me?");
assert.equal(timing.intent, "timing");
assert.ok(timing.evidence_targets.includes("lifecycle_event"));

console.log("AI REASONING CONTRACT PASS");
