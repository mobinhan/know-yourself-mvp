import assert from "node:assert/strict";
import { deriveStructuralChart } from "./deterministic.js";

const act = (...gates) => ({
  personality: gates.map((gate, i) => ({ body: "x" + i, gate, line: 1 })),
  design: []
});

const run = (catalog, gates) =>
  deriveStructuralChart({ activations: act(...gates), channel_catalog: catalog });

const channel = (name, a, b, centres) => ({ channel: name, gates: [a, b], centres });

/* Authority hierarchy */
assert.equal(
  run([channel("emotional", 1, 2, ["solar_plexus","throat"])], [1,2]).authority,
  "emotional"
);
assert.equal(
  run([channel("sacral", 3, 4, ["sacral","root"])], [3,4]).authority,
  "sacral"
);
assert.equal(
  run([channel("spleen", 5, 6, ["spleen","root"])], [5,6]).authority,
  "splenic"
);
assert.equal(
  run([channel("ego", 7, 8, ["heart","throat"])], [7,8]).authority,
  "ego"
);
assert.equal(
  run([channel("self", 9, 10, ["g","throat"])], [9,10]).authority,
  "self_projected"
);

/* Type / strategy */
const mg = run([channel("motor-throat", 20, 34, ["throat","sacral"])], [20,34]);
assert.equal(mg.type, "manifesting_generator");
assert.equal(mg.strategy, "wait_to_respond");

const manifestor = run([channel("motor-throat", 21, 45, ["heart","throat"])], [21,45]);
assert.equal(manifestor.type, "manifestor");
assert.equal(manifestor.strategy, "inform");

const projector = run([channel("projector", 11, 56, ["ajna","throat"])], [11,56]);
assert.equal(projector.type, "projector");
assert.equal(projector.strategy, null);

/* No defined centres */
const reflector = deriveStructuralChart({ activations: { personality: [], design: [] }, channel_catalog: [] });
assert.equal(reflector.type, "reflector");
assert.equal(reflector.authority, "lunar_or_none");

console.log("MECHANICAL EDGE CASES PASS");
