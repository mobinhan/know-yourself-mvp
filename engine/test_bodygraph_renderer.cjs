const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.join(__dirname, "..");
const rendererSource = zlib.gunzipSync(fs.readFileSync(path.join(root, "bodygraph/know-your-bodygraph-renderer.js.gz"))).toString("utf8");
const moduleShim = { exports: {} };
new Function("module", "exports", rendererSource)(moduleShim, moduleShim.exports);
const renderer = moduleShim.exports;
const manifest = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, "bodygraph/mmi-geometry-manifest.json.gz"))).toString("utf8"));
const chart = {
  personalityGates: [5, 14, 18, 19, 26, 32, 33, 43, 45, 54, 55],
  designGates: [4, 6, 9, 26, 33, 36, 43, 44, 46, 47, 48, 49, 57],
  definedChannels: ["19-49", "26-44", "32-54"]
};
const validation = renderer.validate(manifest, chart);
assert.equal(validation.ok, true, validation.issues.join("; "));
const svg = renderer.render(manifest, chart, { width: 420, title: "13 Dec 1980 · 14:32 CET · Baarn — activations" });
const hash = crypto.createHash("sha256").update(svg).digest("hex");
assert.equal(hash, "2d8b4dc53f735ffff6c00e5fadb6c658a0e60cd4f9f15260c6f54cee7316323d", "SVG must exactly reproduce approved reference");
assert.equal((svg.match(/<text /g) || []).length, 64, "all gate labels must render");
assert.equal((svg.match(/url\(#kySplit[HV]\)/g) || []).length, 3, "gates 26, 33 and 43 must use split fills");
const avgX = key => manifest.centres[key].outline.reduce((sum, p) => sum + p[0], 0) / manifest.centres[key].outline.length;
assert.ok(avgX("spleen") < avgX("solarPlexus"), "native MMI orientation must keep Spleen left of Solar Plexus");
assert.equal(Object.keys(manifest.centres).length, 9);
assert.equal(Object.keys(manifest.gates).length, 64);
assert.equal(Object.keys(manifest.channels).length, 36);
console.log("PASS MMI bodygraph acceptance: reference hash, 64 labels, split gates, 9 centres, 36 channels, native orientation");
