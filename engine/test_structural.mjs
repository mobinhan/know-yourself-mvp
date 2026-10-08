import assert from "node:assert/strict";
import { deriveStructuralChart } from "./deterministic.js";

const channels = [
  ["3-60",[3,60],["sacral","root"]],
  ["11-56",[11,56],["ajna","throat"]],
  ["28-38",[28,38],["spleen","root"]],
  ["32-54",[32,54],["spleen","root"]],
  ["34-57",[34,57],["sacral","spleen"]],
  ["42-53",[42,53],["sacral","root"]]
].map(([channel,gates,centres]) => ({channel,gates,centres}));

const personality = [
  ["sun",42,5],["earth",32,5],["moon",38,2],["north_node",53,3],
  ["south_node",54,3],["mercury",3,3],["venus",37,4],["mars",18,2],
  ["jupiter",28,6],["saturn",57,4],["uranus",34,5],["neptune",11,5],["pluto",32,6]
].map(([body,gate,line]) => ({body,gate,line}));

const design = [
  ["sun",60,1],["earth",56,1],["moon",50,6],["north_node",62,2],
  ["south_node",61,2],["mercury",13,3],["venus",41,2],["mars",48,4],
  ["jupiter",44,1],["saturn",32,2],["uranus",34,4],["neptune",11,4],["pluto",50,1]
].map(([body,gate,line]) => ({body,gate,line}));

const r = deriveStructuralChart({activations:{personality,design},channel_catalog:channels});

assert.deepEqual(r.channels.map(x=>x.channel),["3-60","11-56","28-38","32-54","34-57","42-53"]);
assert.deepEqual(r.centres,["ajna","root","sacral","spleen","throat"]);
assert.deepEqual(r.definition,[["ajna","throat"],["root","sacral","spleen"]]);
assert.equal(r.type,"generator");
assert.equal(r.authority,"sacral");
assert.equal(r.profile,"5/1");
assert.equal(r.strategy,"wait_to_respond");
console.log("STRUCTURAL GOLDEN PASS");
