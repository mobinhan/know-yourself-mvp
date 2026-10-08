/** Know Yourself — deterministic life-cycle and time mechanics. */

/** Return the exact calendar age in fractional years for an ISO timestamp. */
export function ageAt(birthIso, atIso) {
  const birth = new Date(birthIso);
  const at = new Date(atIso);
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(at.getTime())) throw new Error("Invalid timestamp");
  if (at.getTime() < birth.getTime()) throw new Error("Timestamp precedes birth");
  const yearMs = 365.2425 * 24 * 60 * 60 * 1000;
  return (at.getTime() - birth.getTime()) / yearMs;
}

/**
 * Time navigation is an ordered query over deterministic chart states.
 * It deliberately does not calculate ephemeris positions.
 */
export function makeTimeCursor({ birthIso, atIso }) {
  const birth = new Date(birthIso);
  const at = new Date(atIso);
  if (!Number.isFinite(birth.getTime()) || !Number.isFinite(at.getTime())) throw new Error("Invalid timestamp");
  if (at.getTime() < birth.getTime()) throw new Error("Timestamp precedes birth");
  return {
    at: at.toISOString(),
    age_years: ageAt(birthIso, atIso)
  };
}

/**
 * Life-cycle definitions are named deterministic windows. Their exact event
 * timestamp must come from the appropriate astronomical/event calculator.
 */
export const LIFE_CYCLE_DEFINITIONS = Object.freeze([
  { id:"saturn_return", name:"Saturn Return", nominal_age_years:29.5, source_body:"saturn" },
  { id:"uranus_opposition", name:"Uranus Opposition", nominal_age_years:42, source_body:"uranus" },
  { id:"chiron_return", name:"Chiron Return", nominal_age_years:50, source_body:"chiron" },
  { id:"second_saturn_return", name:"Second Saturn Return", nominal_age_years:59, source_body:"saturn" },
  { id:"nodal_return", name:"Nodal Return", nominal_age_years:18.6, source_body:"north_node" }
]);

/**
 * Select events whose exact timestamps fall within a requested time window.
 * Event objects are expected to be produced by the upstream astronomical layer.
 */
export function selectLifeCycleEvents(events = [], fromIso = null, toIso = null) {
  const from = fromIso ? new Date(fromIso).getTime() : -Infinity;
  const to = toIso ? new Date(toIso).getTime() : Infinity;
  if (from > to) throw new Error("Invalid time window");
  return events
    .filter(e => {
      const t = new Date(e.timestamp).getTime();
      return Number.isFinite(t) && t >= from && t <= to;
    })
    .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/** Stable event identity for persistence and comparison. */
export function eventKey(event) {
  if (!event?.type || !event?.timestamp) throw new Error("Event type and timestamp required");
  return `${event.type}@${new Date(event.timestamp).toISOString()}`;
}
