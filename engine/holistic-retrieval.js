import fs from "node:fs";

const knowledge = JSON.parse(fs.readFileSync(new URL("./knowledge-records.json", import.meta.url), "utf8"));
const graph = JSON.parse(fs.readFileSync(new URL("./knowledge-relationships.json", import.meta.url), "utf8"));

const nodesById = new Map(graph.nodes.map(node => [node.id, node]));
const normalize = value => String(value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

function resolveNode(value) {
  const query = normalize(value);
  return graph.nodes.find(node =>
    normalize(node.id) === query ||
    normalize(node.label) === query ||
    (node.aliases ?? []).some(alias => normalize(alias) === query)
  ) ?? null;
}

export function getKnowledgeRelationships() {
  return graph;
}

export function retrieveHolisticContext({ concept, maxHops = 1, includePending = true } = {}) {
  const start = resolveNode(concept);
  if (!start) {
    return { concept: concept ?? null, records: [], relationships: [], unresolved_context: [], missing_concept: true };
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
        (edge.from === nodeId || edge.to === nodeId)
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

  const relatedNodeIds = new Set([start.id, ...selectedEdges.flatMap(edge => [edge.from, edge.to])]);
  const aliases = new Set([...relatedNodeIds].flatMap(id => {
    const node = nodesById.get(id);
    return [id, node?.label, ...(node?.aliases ?? [])].filter(Boolean).map(normalize);
  }));
  const allowedRecordIds = new Set(selectedEdges.flatMap(edge => edge.knowledge_ids));
  const records = knowledge.records
    .filter(record => {
      const names = [record.concept, ...(record.related_concepts ?? [])].map(normalize);
      return (allowedRecordIds.has(record.id) || record.id === "HD-KNOW-HOLISTIC-001") &&
        names.some(name => aliases.has(name) || (start.id === "gate" && name === "gates"));
    })
    .map(record => ({
      id: record.id,
      concept: record.concept,
      claim: record.claim,
      source_ids: record.source_ids,
      locator: record.locator,
      depth: record.depth ?? []
    }));

  return {
    concept: start.id,
    records,
    relationships: selectedEdges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      knowledge_ids: edge.knowledge_ids
    })),
    unresolved_context: unresolved,
    missing_concept: false
  };
}
