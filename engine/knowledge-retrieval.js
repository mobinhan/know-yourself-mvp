import fs from "node:fs";

const sources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));
const links = JSON.parse(fs.readFileSync(new URL("./knowledge-links.json", import.meta.url), "utf8"));
const ontology = JSON.parse(fs.readFileSync(new URL("./knowledge-ontology.json", import.meta.url), "utf8"));

const byId = new Map(knowledge.records.map(record => [record.id, record]));
const sourceById = new Map(sources.sources.map(source => [source.id, source]));
const linksByEvidence = new Map(links.links.map(link => [link.evidence_id, link]));

export function getKnowledgeForEvidence(evidenceId, { depth = null } = {}) {
  const link = linksByEvidence.get(evidenceId);
  if (!link) return [];
  return link.knowledge_ids
    .map(id => byId.get(id))
    .filter(Boolean)
    .filter(record => !depth || (record.depth ?? []).includes(depth));
}

export function getSource(sourceId) {
  return sourceById.get(sourceId) ?? null;
}

export function getConcept(id) {
  return byId.get(id) ?? null;
}

export function getOntology() {
  return ontology;
}

export function buildEvidenceKnowledgePacket(evidenceRecord, options = {}) {
  const records = getKnowledgeForEvidence(evidenceRecord?.id, options);
  return {
    evidence: evidenceRecord ?? null,
    knowledge: records.map(record => ({
      id: record.id,
      concept: record.concept,
      claim: record.claim,
      source_ids: record.source_ids,
      locator: record.locator,
      use: record.use,
      depth: record.depth ?? [],
      related_concepts: record.related_concepts ?? []
    })),
    interpretation_allowed: false
  };
}
