import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));
const links = JSON.parse(fs.readFileSync(new URL("./knowledge-links.json", import.meta.url), "utf8"));

const sourceMap = new Map(sources.sources.map(x => [x.id, x]));
const knowledgeMap = new Map(knowledge.records.map(x => [x.id, x]));
const linkMap = new Map(links.links.map(x => [x.evidence_id, x]));

export function getKnowledgeForEvidence(evidenceId) {
  const link = linkMap.get(evidenceId);
  if (!link) return [];
  return link.knowledge_ids.map(id => knowledgeMap.get(id)).filter(Boolean);
}

export function getSource(sourceId) {
  return sourceMap.get(sourceId) ?? null;
}

export function buildEvidenceKnowledgePacket(evidenceRecord) {
  if (!evidenceRecord?.id) throw new Error("evidence record is required");

  const records = getKnowledgeForEvidence(evidenceRecord.id);

  return {
    version: "1.0.0",
    evidence: {
      id: evidenceRecord.id,
      claim: evidenceRecord.claim,
      inputs: evidenceRecord.inputs,
      result: evidenceRecord.result,
      calculation: evidenceRecord.calculation
    },
    knowledge: records.map(record => ({
      id: record.id,
      concept: record.concept,
      claim: record.claim,
      source_ids: record.source_ids,
      locator: record.locator,
      use: record.use,
      record_version: record.record_metadata?.record_version ?? null,
      lifecycle_status: record.record_metadata?.lifecycle_status ?? "active",
      epistemic_class: record.record_metadata?.epistemic_class ?? null,
      review_status: record.record_metadata?.review_status ?? "legacy_review_required",
      last_reviewed_at: record.record_metadata?.last_reviewed_at ?? null,
      next_review_due: record.record_metadata?.next_review_due ?? null,
      rights_use_status: record.record_metadata?.rights_use_status ?? "internal_paraphrase_only",
      source_provenance: record.source_ids.map(sourceId => {
        const source = getSource(sourceId);
        return { source_id: sourceId, title: source?.title ?? null, authority_tier: source?.authority_tier ?? null, rights_status: source?.rights_status ?? null };
      })
    })),
    interpretation_allowed: false
  };
}
