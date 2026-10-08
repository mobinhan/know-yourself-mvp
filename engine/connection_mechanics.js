/** Know Yourself — deterministic two-chart / Connection mechanics. */

function unique(xs) { return [...new Set(xs)]; }
function normaliseChannel(c) { return String(c).split("-").map(Number).sort((a,b)=>a-b).join("-"); }

function gateSet(activations=[]) {
  return unique(activations.map(a=>Number(a.gate)).filter(Number.isFinite)).sort((a,b)=>a-b);
}

function channelsFor(gates, catalog=[]) {
  const set = new Set(gates);
  return catalog
    .map(c => ({channel:normaliseChannel(c.channel), gates:c.gates.map(Number), centres:[...c.centres]}))
    .filter(c => c.gates.length===2 && c.gates.every(g=>set.has(g)))
    .sort((a,b)=>a.channel.localeCompare(b.channel));
}

/**
 * Two-chart mechanics:
 * - shared gates = both people activate the same gate
 * - electromagnetic channels = one chart has one channel endpoint and the other has the opposite endpoint
 * - dominance is intentionally not inferred here; interpretation belongs downstream
 * - combined definition is the structural union of both charts
 */
export function deriveConnectionMechanics({ chartA={}, chartB={}, channel_catalog=[] }) {
  const aGates = gateSet(chartA.activations || []);
  const bGates = gateSet(chartB.activations || []);
  const union = unique([...aGates,...bGates]).sort((a,b)=>a-b);

  const aChannels = channelsFor(aGates, channel_catalog);
  const bChannels = channelsFor(bGates, channel_catalog);
  const combinedChannels = channelsFor(union, channel_catalog);

  const aChannelKeys = new Set(aChannels.map(c=>c.channel));
  const bChannelKeys = new Set(bChannels.map(c=>c.channel));

  const electromagnetic = [];
  for (const c of channel_catalog) {
    const gates = c.gates.map(Number);
    if (gates.length !== 2) continue;
    const aHas1=aGates.includes(gates[0]), aHas2=aGates.includes(gates[1]);
    const bHas1=bGates.includes(gates[0]), bHas2=bGates.includes(gates[1]);
    const aComplete = aHas1 && aHas2;
    const bComplete = bHas1 && bHas2;
    const splitAcrossCharts = (aHas1 && bHas2) || (aHas2 && bHas1);
    if (splitAcrossCharts && !aComplete && !bComplete) {
      electromagnetic.push(normaliseChannel(c.channel));
    }
  }

  return {
    mode:"connection",
    chart_a:{gates:aGates, channels:aChannels.map(c=>c.channel)},
    chart_b:{gates:bGates, channels:bChannels.map(c=>c.channel)},
    shared_gates:aGates.filter(g=>bGates.includes(g)),
    electromagnetic_channels:unique(electromagnetic).sort(),
    combined:{
      gates:union,
      channels:combinedChannels.map(c=>c.channel)
    },
    mutual_complete_channels:combinedChannels
      .filter(c=>aChannelKeys.has(c.channel) || bChannelKeys.has(c.channel))
      .map(c=>c.channel)
      .sort()
  };
}
