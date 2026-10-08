import assert from "node:assert/strict";
import { ageAt, makeTimeCursor, LIFE_CYCLE_DEFINITIONS, selectLifeCycleEvents, eventKey } from "./time_mechanics.js";

const birth = "1982-04-15T05:38:00.000Z";
const now = "2024-04-15T05:38:00.000Z";

const age = ageAt(birth, now);
assert.ok(Math.abs(age - 42) < 0.01);
assert.equal(makeTimeCursor({birthIso:birth, atIso:now}).at, now);
assert.ok(makeTimeCursor({birthIso:birth, atIso:now}).age_years > 41.99);

assert.throws(() => ageAt(now, birth), /precedes birth/);
assert.equal(LIFE_CYCLE_DEFINITIONS.find(x => x.id === "uranus_opposition").nominal_age_years, 42);
assert.equal(LIFE_CYCLE_DEFINITIONS.find(x => x.id === "saturn_return").nominal_age_years, 29.5);

const events = [
  {type:"saturn_return", timestamp:"2012-01-01T00:00:00Z"},
  {type:"uranus_opposition", timestamp:"2024-04-15T05:38:00Z"},
  {type:"chiron_return", timestamp:"2032-01-01T00:00:00Z"}
];

const selected = selectLifeCycleEvents(events, "2020-01-01T00:00:00Z", "2029-01-01T00:00:00Z");
assert.deepEqual(selected.map(e => e.type), ["uranus_opposition"]);
assert.equal(eventKey(selected[0]), "uranus_opposition@2024-04-15T05:38:00.000Z");

console.log("TIME / LIFE-CYCLE MECHANICS PASS");
