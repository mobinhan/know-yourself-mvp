import fs from "node:fs";

const controlledSources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const controlledKnowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));
const externalSources = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
const externalKnowledge = JSON.parse(fs.readFileSync(new URL("./external-knowledge-records.json", import.meta.url), "utf8"));

const ACTION_BY_EVENT = {
  content_changed: "revalidate_claim_locators_and_relationship_dependents",
  source_unavailable: "mark_source_unavailable_and_review_dependent_claims",
  rights_changed: "pause_use_and_review_rights_for_dependent_claims",
  conflict_detected: "open_conflict_set_and_revalidate_dependent_relationships",
  url_changed: "verify_new_locator_and_revalidate_dependent_claims"
};

export function buildSourceImpactIndex() {
  const by_source_id = {};
  const add = (sourceId, record) => {
    if (!by_source_id[sourceId]) by_source_id[sourceId] = [];
    by_source_id[sourceId].push(record);
  };

  for (const record of controlledKnowledge.records) {
    for (const sourceId of record.source_ids ?? []) {
      add(sourceId, {
        record_id: record.id,
        registry: "controlled",
        record_version: record.record_metadata?.record_version ?? null,
        review_status: record.record_metadata?.review_status ?? "legacy_review_required"
      });
    }
  }

  for (const record of externalKnowledge.records) {
    add(record.source_id, {
      record_id: record.id,
      registry: "external",
      record_version: record.record_metadata?.record_version ?? null,
      review_status: record.record_metadata?.review_status ?? "legacy_review_required"
    });
  }

  for (const records of Object.values(by_source_id)) {
    records.sort((a,b) => a.record_id.localeCompare(b.record_id));
  }

  return {
    version: "1.0.0",
    controlled_source_count: controlledSources.sources.length,
    external_source_count: externalSources.sources.length,
    by_source_id
  };
}

export function buildReviewQueue({ asOfDate } = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(asOfDate ?? ""))) {
    throw new Error("asOfDate must be an explicit YYYY-MM-DD date");
  }
  const records = [
    ...controlledKnowledge.records.map(record => ({
      record_id: record.id,
      registry: "controlled",
      source_ids: record.source_ids,
      metadata: record.record_metadata
    })),
    ...externalKnowledge.records.map(record => ({
      record_id: record.id,
      registry: "external",
      source_ids: [record.source_id],
      metadata: record.record_metadata
    }))
  ];

  return records
    .filter(record => {
      const metadata = record.metadata ?? {};
      return metadata.review_status !== "reviewed" ||
        (metadata.next_review_due && metadata.next_review_due <= asOfDate);
    })
    .map(record => ({
      record_id: record.record_id,
      registry: record.registry,
      source_ids: record.source_ids,
      record_version: record.metadata?.record_version ?? null,
      review_status: record.metadata?.review_status ?? "legacy_review_required",
      next_review_due: record.metadata?.next_review_due ?? null,
      required_action: "review_claim_provenance_rights_and_relationship_dependents"
    }))
    .sort((a,b) => a.record_id.localeCompare(b.record_id));
}

export function buildSourceChangeImpact({ sourceId, eventType } = {}) {
  if (!sourceId || typeof sourceId !== "string") throw new Error("sourceId is required");
  const action = ACTION_BY_EVENT[eventType];
  if (!action) throw new Error(`Unsupported source event type: ${eventType}`);
  const impactIndex = buildSourceImpactIndex();
  const affected_records = impactIndex.by_source_id[sourceId] ?? [];
  return {
    source_id: sourceId,
    event_type: eventType,
    affected_record_count: affected_records.length,
    affected_records,
    action,
    requires_review: true,
    note: affected_records.length
      ? "All records citing this source are queued for claim, provenance, rights and dependent-relationship review."
      : "No registered records currently cite this source; verify source registry and dependency completeness."
  };
}
