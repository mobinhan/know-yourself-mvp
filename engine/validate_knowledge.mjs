import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));

if (!["1.0.0","1.1.0"].includes(sources.version)) throw new Error("Unsupported knowledge source registry version");
if (!["1.0.0","1.1.0"].includes(knowledge.version)) throw new Error("Unsupported knowledge record version");

const sourceIds = new Set();
for (const source of sources.sources) {
  if (!source.id || sourceIds.has(source.id)) throw new Error("Invalid or duplicate source id");
  sourceIds.add(source.id);
  if (!source.title || !source.source_type || !source.rights_status || !source.use_policy || source.authority_tier !== "P1") {
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
  if (record.depth && (!Array.isArray(record.depth) || record.depth.some(x => !["L1","L2","L3","L4"].includes(x)))) {
    throw new Error(`Invalid depth in ${record.id}`);
  }
  if (record.related_concepts && !Array.isArray(record.related_concepts)) {
    throw new Error(`Invalid related_concepts in ${record.id}`);
  }
  const metadata = record.record_metadata;
  if (!metadata || metadata.record_version !== "1.0.0" || metadata.lifecycle_status !== "active") {
    throw new Error(`Missing or invalid record lifecycle metadata: ${record.id}`);
  }
  if (!["foundational","interpretive","experiential","critical_contested"].includes(metadata.epistemic_class)) {
    throw new Error(`Invalid epistemic class in ${record.id}`);
  }
  if (!["reviewed","legacy_review_required","review_due","conflict_requires_review"].includes(metadata.review_status)) {
    throw new Error(`Invalid review status in ${record.id}`);
  }
  if (!metadata.metadata_registered_at || !metadata.rights_use_status || !metadata.source_change_action || !Array.isArray(metadata.supersedes)) {
    throw new Error(`Incomplete record governance metadata: ${record.id}`);
  }
  if (metadata.review_status === "reviewed" && (!metadata.last_reviewed_at || !metadata.next_review_due)) {
    throw new Error(`Reviewed record lacks review dates: ${record.id}`);
  }
  if (metadata.conflict_group != null && typeof metadata.conflict_group !== "string") {
    throw new Error(`Invalid conflict group in ${record.id}`);
  }
}

const links = JSON.parse(fs.readFileSync(new URL("./knowledge-links.json", import.meta.url), "utf8"));

if (!["1.0.0","1.1.0"].includes(links.version)) throw new Error("Unsupported knowledge link version");
const evidenceIds = new Set([
  "E-ACTIVATIONS","E-GATES","E-CHANNELS","E-CENTRES","E-DEFINITION",
  "E-TYPE","E-AUTHORITY","E-PROFILE","E-CROSS","E-TEMPORAL-STATE",
  "E-LIFECYCLE-EVENTS","E-CONNECTION"
]);
const linkIds = new Set();
const linkedEvidenceIds = new Set();
for (const link of links.links) {
  if (!link.id || linkIds.has(link.id)) throw new Error("Invalid or duplicate knowledge link id");
  linkIds.add(link.id);
  if (!evidenceIds.has(link.evidence_id)) throw new Error(`Unknown evidence id: ${link.evidence_id}`);
  if (linkedEvidenceIds.has(link.evidence_id)) throw new Error(`Duplicate evidence link: ${link.evidence_id}`);
  linkedEvidenceIds.add(link.evidence_id);
  if (!Array.isArray(link.knowledge_ids) || link.knowledge_ids.length === 0) {
    throw new Error(`Knowledge link has no records: ${link.id}`);
  }
  const linkedKnowledgeIds = new Set();
  for (const knowledgeId of link.knowledge_ids) {
    if (linkedKnowledgeIds.has(knowledgeId)) throw new Error(`Duplicate knowledge id ${knowledgeId} in ${link.id}`);
    linkedKnowledgeIds.add(knowledgeId);
    if (!recordIds.has(knowledgeId)) throw new Error(`Unknown knowledge id ${knowledgeId} in ${link.id}`);
  }
}
if (linkedEvidenceIds.size !== evidenceIds.size) {
  const missing = [...evidenceIds].filter(id => !linkedEvidenceIds.has(id));
  throw new Error(`Missing evidence links: ${missing.join(",")}`);
}

console.log(`KNOWLEDGE VALIDATION PASS: ${knowledge.records.length} records / ${sources.sources.length} sources`);
