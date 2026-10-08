/** Know Yourself — deterministic evidence layer.
 * Converts calculated activations + structural derivation into auditable evidence.
 * This layer does not interpret Human Design and does not generate prose meaning.
 */

export function buildEvidence({ activations, structure, calculation = null, sources = [] }) {
  const records = [];

  const add = (id, claim, inputs, result, sourceIds = []) => {
    records.push({
      id,
      claim,
      inputs,
      result,
      source_ids: sourceIds,
      calculation: calculation ? {
        engine_name: calculation.engine_name ?? null,
        engine_version: calculation.engine_version ?? null,
        ephemeris_provider: calculation.ephemeris_provider ?? null,
        ephemeris_version: calculation.ephemeris_version ?? null
      } : null
    });
  };

  add(
    "E-ACTIVATIONS",
    "Planetary/body activations are calculation outputs.",
    ["activations"],
    activations,
    sources
  );

  add(
    "E-GATES",
    "Defined gates are the unique gates present in the calculated activations.",
    ["activations.*.gate"],
    structure.gateSet,
    sources
  );

  add(
    "E-CHANNELS",
    "Completed channels are channel-catalog entries whose two endpoint gates are both defined.",
    ["gateSet", "channel_catalog"],
    structure.channels.map(x => x.channel),
    sources
  );

  add(
    "E-CENTRES",
    "Defined centres are the centres connected by completed channels.",
    ["completed_channels"],
    structure.centres,
    sources
  );

  add(
    "E-DEFINITION",
    "Definition components are connected components of the defined-centre graph.",
    ["centres", "completed_channels"],
    structure.definition,
    sources
  );

  add(
    "E-TYPE",
    "Type is derived mechanically from sacral definition and motor-to-throat connectivity.",
    ["sacral", "throat_component"],
    structure.type,
    sources
  );

  add(
    "E-AUTHORITY",
    "Authority is derived mechanically from the defined-centre hierarchy implemented by the engine.",
    ["centres"],
    structure.authority,
    sources
  );

  add(
    "E-PROFILE",
    "Profile is derived from the personality Sun line and design Sun line.",
    ["personality_sun.line", "design_sun.line"],
    structure.profile,
    sources
  );

  add(
    "E-CROSS",
    "Incarnation Cross is derived from personality Sun/Earth and design Sun/Earth activations.",
    ["personality_sun", "personality_earth", "design_sun", "design_earth"],
    structure.incarnation_cross,
    sources
  );

  return {
    version: "1.0.0",
    records
  };
}

export function getEvidence(evidence, id) {
  return evidence?.records?.find(record => record.id === id) ?? null;
}
