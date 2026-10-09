import fs from "node:fs";

const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));
const knowledgeSources = JSON.parse(fs.readFileSync(new URL("./knowledge-sources.json", import.meta.url), "utf8"));
const externalRegistry = JSON.parse(fs.readFileSync(new URL("./external-source-registry.json", import.meta.url), "utf8"));
const externalKnowledge = JSON.parse(fs.readFileSync(new URL("./external-knowledge-records.json", import.meta.url), "utf8"));
const quarterGateMap = JSON.parse(fs.readFileSync(new URL("./quarter-gate-map.json", import.meta.url), "utf8"));
const graph = JSON.parse(fs.readFileSync(new URL("./knowledge-relationships.json", import.meta.url), "utf8"));

const nodesById = new Map(graph.nodes.map(node => [node.id, node]));
const externalSourcesById = new Map(externalRegistry.sources.map(source => [source.id, source]));
const knowledgeSourcesById = new Map(knowledgeSources.sources.map(source => [source.id, source]));
const externalRecordsById = new Map(externalKnowledge.records.map(record => [record.id, record]));
const normalize = value => String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

function resolveNode(value) {
  const query = normalize(value);
  return graph.nodes.find(node =>
    normalize(node.id) === query ||
    normalize(node.label) === query ||
    (node.aliases ?? []).some(alias => normalize(alias) === query)
  ) ?? null;
}

function getQuarterForGate(gateNumber) {
  const gate = Number(gateNumber);
  if (!Number.isInteger(gate) || gate < 1 || gate > 64) return null;
  const quarter = quarterGateMap.quarters.find(item => item.gates.includes(gate));
  if (!quarter) return null;
  return {
    gate,
    quarter_id: quarter.id,
    quarter: quarter.name,
    quarter_theme: quarter.theme,
    mapping_status: quarterGateMap.status,
    mapping_source_id: quarterGateMap.source_id,
    mapping_source_title: knowledgeSourcesById.get(quarterGateMap.source_id)?.title ?? externalSourcesById.get(quarterGateMap.source_id)?.name ?? null,
    mapping_source_type: knowledgeSourcesById.get(quarterGateMap.source_id)?.source_type ?? null,
    mapping_source_locator: quarterGateMap.source_locator ?? null,
    secondary_crosscheck_source_id: quarterGateMap.secondary_crosscheck_source_id ?? null,
    framework_source_id: quarterGateMap.official_framework_source_id,
    framework_record_id: "EXT-KNOW-QUARTERS-001",
    mapping_record_id: "HD-KNOW-QUARTER-GATE-MAP-001"
  };
}

function relationshipApplies(edge, { personalitySunColour = null, personalityNodeColours = [] } = {}) {
  if (!edge.applies_when) return true;
  const condition = edge.applies_when;
  if (condition.personality_sun_colour != null && Number(personalitySunColour) !== Number(condition.personality_sun_colour)) return false;
  if (condition.personality_node_colour != null && !(personalityNodeColours ?? []).some(value => Number(value) === Number(condition.personality_node_colour))) return false;
  return true;
}

export function getKnowledgeRelationships() {
  return graph;
}

export function getQuarterGateMap() {
  return quarterGateMap;
}

export function retrieveHolisticContext({ concept, maxHops = 1, includePending = true, gateNumber = null, gateNumbers = [], chartGateSet = [], personalitySunColour = null, personalityNodeColours = [] } = {}) {
  const start = resolveNode(concept);
  if (!start) {
    return { concept: concept ?? null, records: [], external_records: [], relationships: [], unresolved_context: [], gate_quarter_context: [], missing_concept: true };
  }

  const visited = new Set([start.id]);
  let frontier = [start.id];
  const selectedEdges = [];
  const unresolved = [];

  for (let hop = 0; hop < Math.max(1, Math.min(3, Number(maxHops) || 1)); hop += 1) {
    const next = [];
    for (const nodeId of frontier) {
      const edges = graph.edges.filter(edge =>
        edge.status === "validated" &&
        (edge.from === nodeId || edge.to === nodeId) &&
        relationshipApplies(edge, { personalitySunColour, personalityNodeColours })
      );
      for (const edge of edges) {
        if (!selectedEdges.some(existing => existing.id === edge.id)) selectedEdges.push(edge);
        const otherId = edge.from === nodeId ? edge.to : edge.from;
        if (!visited.has(otherId)) {
          visited.add(otherId);
          next.push(otherId);
        }
      }
      if (includePending) {
        for (const edge of graph.edges.filter(edge =>
          edge.status === "pending_evidence" && (edge.from === nodeId || edge.to === nodeId)
        )) {
          if (!unresolved.some(item => item.relationship_id === edge.id)) {
            const targetId = edge.from === nodeId ? edge.to : edge.from;
            const target = nodesById.get(targetId);
            unresolved.push({
              relationship_id: edge.id,
              concept_id: targetId,
              concept: target?.label ?? targetId,
              relationship_type: edge.type,
              reason: "No validated knowledge records currently support this relationship."
            });
          }
        }
      }
    }
    frontier = next;
    if (!frontier.length) break;
  }

  const allowedRecordIds = new Set(selectedEdges.flatMap(edge => edge.knowledge_ids ?? []));
  const allowedExternalRecordIds = new Set(selectedEdges.flatMap(edge => edge.external_knowledge_ids ?? []));
  const records = knowledge.records
    .filter(record => allowedRecordIds.has(record.id) || record.id === "HD-KNOW-HOLISTIC-001")
    .map(record => ({
      id: record.id,
      concept: record.concept,
      claim: record.claim,
      source_ids: record.source_ids,
      locator: record.locator,
      depth: record.depth ?? [],
      record_version: record.record_metadata?.record_version ?? null,
      lifecycle_status: record.record_metadata?.lifecycle_status ?? "active",
      epistemic_class: record.record_metadata?.epistemic_class ?? null,
      review_status: record.record_metadata?.review_status ?? "legacy_review_required",
      last_reviewed_at: record.record_metadata?.last_reviewed_at ?? null,
      next_review_due: record.record_metadata?.next_review_due ?? null,
      rights_use_status: record.record_metadata?.rights_use_status ?? "internal_paraphrase_only",
      source_provenance: record.source_ids.map(sourceId => {
        const source = knowledgeSourcesById.get(sourceId);
        return { source_id: sourceId, title: source?.title ?? null, authority_tier: source?.authority_tier ?? null, rights_status: source?.rights_status ?? null };
      })
    }));
  const external_records = [...allowedExternalRecordIds]
    .map(id => externalRecordsById.get(id))
    .filter(Boolean)
    .map(record => ({
      id: record.id,
      source_id: record.source_id,
      source_tier: externalSourcesById.get(record.source_id)?.tier ?? null,
      title: record.title,
      claim: record.claim,
      claim_type: record.claim_type,
      status: record.status,
      locator: record.locator,
      allowed_use: record.allowed_use,
      topics: record.topics,
      record_metadata: record.record_metadata ?? null,
      rights_use_status: record.record_metadata?.rights_use_status ?? "internal_paraphrase_only"
    }));

  const requestedGates = [...new Set([
    ...(gateNumber == null ? [] : [gateNumber]),
    ...(Array.isArray(gateNumbers) ? gateNumbers : [])
  ])].map(Number).filter(gate => Number.isInteger(gate) && gate >= 1 && gate <= 64);
  const gate_quarter_context = start.id === "gate"
    ? requestedGates.map(getQuarterForGate).filter(Boolean).map(item => ({
        ...item,
        chart_defined: Array.isArray(chartGateSet) ? chartGateSet.includes(item.gate) : false
      }))
    : [];

  return {
    concept: start.id,
    records,
    external_records,
    relationships: selectedEdges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      status: edge.status,
      knowledge_ids: edge.knowledge_ids ?? [],
      external_knowledge_ids: edge.external_knowledge_ids ?? [],
      applies_when: edge.applies_when ?? null
    })),
    gate_quarter_context,
    unresolved_context: unresolved,
    missing_concept: false
  };
}
