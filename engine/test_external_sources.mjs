import assert from "node:assert/strict";
import fs from "node:fs";
const registry = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
assert.ok(registry.sources.length >= 6);
assert.equal(registry.sources.find(x => x.id === "EXT_JOVIAN_ARCHIVE").tier, "P1");
assert.equal(registry.sources.find(x => x.id === "EXT_RICHARD_BEAUMONT").tier, "P2");
assert.equal(registry.sources.find(x => x.id === "EXT_IHDS_OFFICIAL").tier, "P1");
assert.ok(registry.sources.find(x => x.id === "EXT_IHDS_OFFICIAL").social_urls.length === 1);
console.log("EXTERNAL SOURCE TEST PASS");
