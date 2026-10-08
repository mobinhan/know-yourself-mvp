import assert from "node:assert/strict";
import { buildEvidence, getEvidence } from "./evidence.js";

const structure = {
  gateSet:[3,11,28,32,34,38,42,53,54,56,57,60],
  channels:[{channel:"3-60"},{channel:"11-56"}],
  centres:["ajna","root","sacral","spleen","throat"],
  definition:[["ajna","throat"],["root","sacral","spleen"]],
  type:"generator",
  authority:"sacral",
  profile:"5/1",
  incarnation_cross:{
    personality_sun:{gate:42,line:5},
    personality_earth:{gate:32,line:5},
    design_sun:{gate:60,line:1},
    design_earth:{gate:56,line:1}
  }
};

const evidence = buildEvidence({
  activations:{personality:[],design:[]},
  structure,
  calculation:{engine_name:"ky-hd-engine",engine_version:"1.0.0",ephemeris_provider:"Swiss Ephemeris",ephemeris_version:"2.10.03"},
  sources:["SRC_KY_ENGINE"]
});

assert.equal(evidence.version,"1.0.0");
assert.equal(evidence.records.length,9);
assert.equal(getEvidence(evidence,"E-AUTHORITY").result,"sacral");
assert.equal(getEvidence(evidence,"E-TYPE").result,"generator");
assert.equal(getEvidence(evidence,"E-PROFILE").result,"5/1");
assert.equal(getEvidence(evidence,"E-CROSS").result.design_sun.gate,60);
console.log("EVIDENCE LAYER PASS");
