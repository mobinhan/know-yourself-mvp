import fs from "node:fs";
const c = JSON.parse(fs.readFileSync(new URL("./ai-reasoning-contract.json", import.meta.url), "utf8"));
if (c.version !== "1.0.0") throw new Error("Unsupported AI reasoning contract version");
for (const section of ["question","reasoning_input","answer"]) {
  if (!c[section] || !Array.isArray(c[section].required)) throw new Error(`Invalid AI contract section: ${section}`);
}
const intents = new Set(c.question.intent_values);
const domains = new Set(c.question.domain_values);
const targets = new Set(c.question.evidence_targets);
for (const x of c.question.intent_values) if (!intents.has(x)) throw new Error("Invalid intent");
for (const x of c.question.domain_values) if (!domains.has(x)) throw new Error("Invalid domain");
for (const x of c.question.evidence_targets) if (!targets.has(x)) throw new Error("Invalid evidence target");
console.log("AI REASONING CONTRACT VALIDATION PASS");
