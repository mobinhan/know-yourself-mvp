import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));

if (sources.version !== "1.0.0") throw new Error("Unsupported knowledge source registry version");
if (knowledge.version !== "1.0.0") throw new Error("Unsupported knowledge record version");

const sourceIds = new Set();
for (const source of sources.sources) {
  if (!source.id || sourceIds.has(source.id)) throw new Error("Invalid or duplicate source id");
  sourceIds.add(source.id);
  if (!source.title || !source.source_type || !source.rights_status || !source.use_policy) {
    throw new Error(`Incomplete source registry record: ${source.id}`);
  }
}

const recordIds = new Set();
for (const record of knowledge.records) {
  if (!record.id || recordIds.has(record.id)) throw new Error("Invalid or duplicate knowledge record id");
  recordIds.add(record.id);
  if (!record.concept || !record.claim || !record.locator || !record.use) {
    throw new Error(`Incomplete knowledge record: ${record.id}`);
  }
  if (!Array.isArray(record.source_ids) || record.source_ids.length === 0) {
    throw new Error(`Knowledge record has no provenance: ${record.id}`);
  }
  for (const sourceId of record.source_ids) {
    if (!sourceIds.has(sourceId)) throw new Error(`Unknown source id ${sourceId} in ${record.id}`);
  }
  if (record.claim.length > 600) throw new Error(`Knowledge claim too long: ${record.id}`);
}

console.log(`KNOWLEDGE VALIDATION PASS: ${knowledge.records.length} records / ${sources.sources.length} sources`);
