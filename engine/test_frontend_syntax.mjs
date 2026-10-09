import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1].trim())
  .filter(Boolean);
assert.ok(scripts.length > 0, "page must contain inline JavaScript");
for (const [index, source] of scripts.entries()) {
  assert.doesNotThrow(() => new vm.Script(source, { filename: `index-inline-${index}.js` }), `inline script ${index} must parse`);
}
console.log(`FRONTEND INLINE SYNTAX PASS (${scripts.length} scripts)`);
