/** Know Yourself — deterministic temporal mechanics.
 * Step 2: transit overlay.
 * This module consumes already-calculated natal and transit activations.
 * It does not calculate planetary positions; that remains the ephemeris boundary.
 */

function unique(xs) {
  return [...new Set(xs)];
}

function normaliseChannel(c) {
  return String(c).split("-").map(Number).sort((a,b) => a-b).join("-");
}

function normaliseActivations(activations = []) {
  return activations
    .map(a => ({ body: String(a.body), gate: Number(a.gate), line: Number(a.line) }))
    .filter(a => Number.isFinite(a.gate) && Number.isFinite(a.line))
    .sort((a,b) => a.gate-b.gate || a.line-b.line || a.body.localeCompare(b.body));
}

function deriveCompletedChannels(gates, catalog = []) {
  const gateSet = new Set(gates.map(Number));
  return catalog
    .map(c => ({
      channel: normaliseChannel(c.channel),
      gates: c.gates.map(Number),
      centres: [...c.centres]
    }))
    .filter(c => c.gates.length === 2 && c.gates.every(g => gateSet.has(g)))
    .sort((a,b) => a.channel.localeCompare(b.channel));
}

function deriveCentres(channels) {
  return unique(channels.flatMap(c => c.centres)).sort();
}

/**
 * Derive the temporary transit overlay.
 *
 * natal activations remain immutable. Transit activations are never merged
 * into the natal chart object; combined mechanics are explicitly labelled.
 */
export function deriveTransitOverlay({ natalActivations = [], transitActivations = [], channel_catalog = [] }) {
  const natal = normaliseActivations(natalActivations);
  const transit = normaliseActivations(transitActivations);

  const natalGates = unique(natal.map(a => a.gate)).sort((a,b) => a-b);
  const transitGates = unique(transit.map(a => a.gate)).sort((a,b) => a-b);
  const combinedGates = unique([...natalGates, ...transitGates]).sort((a,b) => a-b);

  const natalChannels = deriveCompletedChannels(natalGates, channel_catalog);
  const transitChannels = deriveCompletedChannels(transitGates, channel_catalog);
  const combinedChannels = deriveCompletedChannels(combinedGates, channel_catalog);

  const natalCentres = deriveCentres(natalChannels);
  const transitCentres = deriveCentres(transitChannels);
  const combinedCentres = deriveCentres(combinedChannels);

  const temporaryGates = transitGates.filter(g => !natalGates.includes(g));
  const completedByTransit = combinedChannels
    .filter(c => !natalChannels.some(n => n.channel === c.channel))
    .map(c => c.channel);

  const temporaryCentres = combinedCentres.filter(c => !natalCentres.includes(c));

  return {
    mode: "transit_overlay",
    natal: {
      gates: natalGates,
      channels: natalChannels.map(c => c.channel),
      centres: natalCentres
    },
    transit: {
      gates: transitGates,
      channels: transitChannels.map(c => c.channel),
      centres: transitCentres
    },
    temporary: {
      gates: temporaryGates,
      channels: completedByTransit,
      centres: temporaryCentres
    },
    combined: {
      gates: combinedGates,
      channels: combinedChannels.map(c => c.channel),
      centres: combinedCentres
    }
  };
}

export function compareTransitOverlay(actual, expected) {
  const fields = [
    "natal.gates","natal.channels","natal.centres",
    "transit.gates","transit.channels","transit.centres",
    "temporary.gates","temporary.channels","temporary.centres",
    "combined.gates","combined.channels","combined.centres"
  ];
  const get = (obj, path) => path.split(".").reduce((x,k) => x?.[k], obj);
  const mismatches = [];
  for (const field of fields) {
    const got = get(actual, field);
    const want = get(expected, field);
    if (JSON.stringify(got) !== JSON.stringify(want)) mismatches.push({ field, got, want });
  }
  return { ok: mismatches.length === 0, mismatches };
}
