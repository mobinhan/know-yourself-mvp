import fs from "node:fs";

const registry = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
const contract = JSON.parse(fs.readFileSync(new URL("./external-knowledge-contract.json", import.meta.url), "utf8"));
const records = JSON.parse(fs.readFileSync(new URL("./external-knowledge-records.json", import.meta.url), "utf8"));

const sourceById = new Map(registry.sources.map(source => [source.id, source]));
const recordById = new Map(records.records.map(record => [record.id, record]));

const tierRank = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };

export function getExternalSource(sourceId) {
  return sourceById.get(sourceId) ?? null;
}

export function getExternalRecord(recordId) {
  return recordById.get(recordId) ?? null;
}

export function listExternalSources({ tier = null, contentType = null } = {}) {
  return registry.sources.filter(source =>
    (!tier || source.tier === tier) &&
    (!contentType || source.content_types.includes(contentType))
  );
}

export function rankExternalSource(sourceId) {
  const source = getExternalSource(sourceId);
  return source ? tierRank[source.tier] ?? 99 : 99;
}

export function canEnrichInterpretation(record, { purpose = "explain" } = {}) {
  if (!record || record.status === "rejected") return false;
  return (record.allowed_use ?? []).includes(purpose) &&
    (contract.allowed_use ?? []).includes(purpose);
}

export function compareExternalAuthority(a, b) {
  const ta = rankExternalSource(a?.source_id);
  const tb = rankExternalSource(b?.source_id);
  return ta - tb;
}

export function buildConflictSets(recordsToCheck = []) {
  const groups = new Map();
  for (const record of recordsToCheck) {
    if (!record?.conflict_group) continue;
    if (!groups.has(record.conflict_group)) groups.set(record.conflict_group, []);
    groups.get(record.conflict_group).push(record);
  }

  return [...groups.entries()]
    .map(([conflict_group, group]) => {
      const distinctClaims = new Map();
      for (const record of group) {
        const normalized = String(record.claim ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        if (!distinctClaims.has(normalized)) distinctClaims.set(normalized, []);
        distinctClaims.get(normalized).push(record);
      }
      if (distinctClaims.size < 2) return null;
      return {
        conflict_group,
        status: "conflict_requires_review",
        needs_review: true,
        claims: group.map(record => ({
          id: record.id,
          source_id: record.source_id,
          status: record.status,
          claim: record.claim,
          locator: record.locator
        })),
        instruction: "Preserve each claim and its provenance separately. Do not silently merge or select a winner; disclose the disagreement and uncertainty."
      };
    })
    .filter(Boolean);
}

export function buildExternalKnowledgePacket({ topics = [], purpose = "explain" } = {}) {
  const selected = records.records
    .filter(record => canEnrichInterpretation(record, { purpose }))
    .filter(record => !topics.length || record.topics.some(topic => topics.includes(topic)))
    .map(record => ({
      id: record.id,
      source_id: record.source_id,
      source: getExternalSource(record.source_id),
      title: record.title,
      claim: record.claim,
      claim_type: record.claim_type,
      status: record.status,
      locator: record.locator,
      allowed_use: record.allowed_use,
      topics: record.topics,
      conflict_group: record.conflict_group ?? null
    }))
    .sort(compareExternalAuthority);

  return {
    contract_version: contract.version,
    records: selected,
    conflict_sets: buildConflictSets(selected),
    interpretation_only: true
  };
}
