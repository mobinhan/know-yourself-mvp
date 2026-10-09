import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const api = fs.readFileSync(new URL("../api/index.py", import.meta.url), "utf8");
const vercel = JSON.parse(fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));

assert.ok(html.includes("get('fixtures')==='1'"), "fixture interception must be opt-in");
assert.ok(html.includes("state.chart=raw.foundation"), "chart creation must use deterministic API response");
assert.ok(html.includes("JSON.stringify({birth:state.chart.birth_data,at})"), "transit requests must supply birth data for stateless recalculation");
assert.ok(html.includes("birth:state.chart.birth_data"), "question context requests must supply birth data");
assert.ok(html.includes("No AI reading has been generated."), "UI must not present local template text as live AI output");
assert.ok(!html.includes("const fr=await fetch('/v1/charts/'+raw.id+'/foundation')"), "UI must not depend on server-side guest chart storage");
assert.ok(api.includes("provider_not_configured"), "API must be explicit about missing live AI provider");
assert.ok(api.includes("mechanics_only") || api.includes("mechanical_values_only"), "unverified PHS teaching must remain unasserted");
assert.ok(vercel.rewrites.some(r => r.source === "/v1/:path*" && r.destination.includes("/api/index?route=/v1/:path*")), "V1 routes must reach the Python API handler");
console.log("V1 FRONTEND/API CONTRACT PASS");
