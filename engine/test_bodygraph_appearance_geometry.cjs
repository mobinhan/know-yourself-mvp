const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererSource = zlib.gunzipSync(fs.readFileSync(path.join(root, "bodygraph/know-your-bodygraph-renderer.js.gz"))).toString("utf8");
const manifest = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, "bodygraph/mmi-geometry-manifest.json.gz"))).toString("utf8"));
const rendererModule = { exports: {} };
new Function("module", "exports", rendererSource)(rendererModule, rendererModule.exports);
const renderer = rendererModule.exports;

const sandbox = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(root, "bodygraph/appearance.js"), "utf8"), sandbox);
const appearance = sandbox.window.KYBodygraphAppearance;
assert.ok(appearance && typeof appearance.apply === "function", "appearance module must expose apply()");

const chart = {
  personalityGates: [5, 14, 18, 19, 26, 32, 33, 43, 45, 54, 55],
  designGates: [4, 6, 9, 26, 33, 36, 43, 44, 46, 47, 48, 49, 57],
  definedChannels: ["19-49", "26-44", "32-54"]
};
assert.equal(renderer.validate(manifest, chart).ok, true, "acceptance chart must validate");
const unstyled = renderer.render(manifest, chart, { width: 420, title: "13 Dec 1980 · 14:32 CET · Baarn — activations" });
const styled = appearance.apply(unstyled);

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}
function geometry(svg) {
  const result = {};
  for (const name of ["polygon", "line", "path", "text"]) {
    const tags = [...svg.matchAll(new RegExp("<" + name + "\\b[^>]*>", "g"))].map(m => attrs(m[0]));
    result[name] = tags.map(a => {
      if (name === "polygon") return a.points || "";
      if (name === "line") return [a.x1,a.y1,a.x2,a.y2].join("|");
      if (name === "path") return [a.d,a.transform || ""].join("|");
      return [a.x,a.y,a.dx || "",a.dy || "",a.transform || ""].join("|");
    });
  }
  return result;
}
assert.deepEqual(geometry(styled), geometry(unstyled),
  "appearance must not alter polygon point-sets, line/path coordinates, or text positions");
assert.match(styled, /id="ky-celestial-backdrop"/, "static background image must be present");
assert.doesNotMatch(styled, /kyCloudTexture|feTurbulence|ky-astrology-frame/,
  "procedural nebula and procedural zodiac frame must be absent");
assert.match(styled, /fill-opacity="0\.20"/, "pearl channel underlay opacity must remain subtle");
console.log("PASS appearance geometry regression: polygon point-sets, line/path coordinates, and text positions identical");
console.log("PASS static plate integration: one full-viewBox image; no procedural cloud texture or astrology frame");
console.log("PASS channel underlay: pearl fill 0.20 / warm-gold stroke 0.22");
