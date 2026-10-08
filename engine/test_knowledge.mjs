import assert from "node:assert/strict";
import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));

const sourceIds = new Set(sources.sources.map(x => x.id));
const concepts = new Set(knowledge.records.map(x => x.concept));

assert.equal(sources.sources.length, 4);
assert.equal(sourceIds.has("SRC_HD_DEFINITIVE_BOOK_2011"), true);
assert.equal(sourceIds.has("SRC_RAVE_ABC"), true);
assert.equal(sourceIds.has("SRC_CARTOGRAPHY_COURSE"), true);
assert.equal(sourceIds.has("SRC_LIFE_FORCE_CHANNELS_2008"), true);
assert.ok(knowledge.records.length >= 30);
assert.equal(concepts.has("BodyGraph foundation"), true);
assert.equal(concepts.has("Generator"), true);
assert.equal(concepts.has("Sacral Authority"), true);
assert.equal(concepts.has("Channels"), true);
assert.equal(concepts.has("Gates"), true);
assert.equal(concepts.has("Incarnation Cross"), true);
assert.equal(concepts.has("Holistic chart analysis"), true);
assert.equal(concepts.has("Experimentation"), true);

for (const record of knowledge.records) {
  assert.ok(record.source_ids.every(id => sourceIds.has(id)));
  assert.equal(record.use, "educational");
  assert.ok(record.depth.every(level => ["L1","L2","L3","L4"].includes(level)));
}

console.log("KNOWLEDGE LAYER PASS");
