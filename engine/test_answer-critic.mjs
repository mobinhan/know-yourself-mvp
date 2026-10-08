import assert from "node:assert/strict";
import { criticAnswer, finalizeAnswer } from "./answer-critic.js";

const evidence = [{id:"E-AUTHORITY"},{id:"E-TYPE"}];
const knowledge = [{id:"HD-KNOW-AUTHORITY-001"}];

const good = finalizeAnswer({
  answer:"Your chart evidence identifies sacral authority. The interpretation layer can then discuss how that may relate to your question.",
  factual_basis:["E-AUTHORITY"],
  knowledge_basis:["HD-KNOW-AUTHORITY-001"],
  interpretation:"This is an interpretation rather than a mechanical fact.",
  limitations:"Interpretation depends on the supplied knowledge.",
}, evidence, knowledge);

assert.equal(good.critic.passed,true);
assert.deepEqual(good.critic.issues,[]);

const bad = criticAnswer({
  answer:"The AI calculated your authority.",
  factual_basis:["E-FAKE"],
  knowledge_basis:["HD-FAKE"]
}, evidence, knowledge);
assert.equal(bad.passed,false);
assert.ok(bad.issues.some(x=>x.startsWith("unknown_factual_basis:")));
assert.ok(bad.issues.some(x=>x.startsWith("unknown_knowledge_basis:")));
assert.ok(bad.issues.some(x=>x.startsWith("forbidden_mechanical_claim:")));

console.log("ANSWER CRITIC PASS");
