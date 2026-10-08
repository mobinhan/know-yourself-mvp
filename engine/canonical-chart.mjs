import { deriveStructuralChart } from "./deterministic.js";
import { buildEvidence } from "./evidence.js";

/**
 * Build the transport-safe canonical chart artifact consumed by downstream layers.
 * Calculation/ephemeris output is supplied by the Python engine; this module does
 * not recalculate astronomy or interpret Human Design.
 */
export function buildCanonicalChart({ chartId, birth, calculation, activations, channelCatalog, sources = [] }) {
  if (!chartId) throw new Error("chartId is required");
  if (!calculation) throw new Error("calculation is required");
  if (!activations?.personality || !activations?.design) throw new Error("both activation sets are required");

  const structure = deriveStructuralChart({
    activations,
    channel_catalog: channelCatalog || []
  });

  const evidence = buildEvidence({
    activations,
    structure,
    calculation,
    sources
  });

  return {
    contract_version: "1.0.0",
    chart_id: chartId,
    birth,
    calculation,
    activations,
    structure: {
      channels: structure.channels.map(x => x.channel),
      centres: structure.centres,
      definition: structure.definition,
      type: structure.type,
      strategy: structure.strategy,
      authority: structure.authority,
      profile: structure.profile,
      incarnation_cross: structure.incarnation_cross
    },
    evidence
  };
}
