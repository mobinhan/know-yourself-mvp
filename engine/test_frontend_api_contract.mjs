import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// The API returns the guest chart foundation in the creation response. Do not
// require the legacy follow-up route when the canonical response is present.
assert.ok(
  html.includes("state.chart=raw.foundation||null"),
  "chart creation must consume the foundation returned by POST /v1/charts"
);
assert.ok(
  html.includes("if(!state.chart){const fr=await fetch(`/v1/charts/${raw.id}/foundation`)"),
  "legacy foundation fallback must only run when the creation response omits it"
);
assert.ok(
  html.includes("if(!fr.ok)throw new Error(await fr.text())"),
  "foundation fallback must surface HTTP errors"
);

// The current API computes transits from the supplied birth payload and time.
assert.ok(
  html.includes("today`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({birth,at})"),
  "transit request must POST the birth payload and selected timestamp"
);

// Contextual questions must carry chart birth fields required by the current
// guest API. The backend must still keep direct birth data out of the AI prompt.
assert.ok(
  html.includes("JSON.stringify({question:q,birth:state.chart.birth_data,at:state.transit?.timestamp_utc||null})"),
  "question request must include birth data for trusted deterministic reconstruction"
);

console.log("Frontend/API request contract checks passed.");


// Live mode must not silently fall back to canned demo responses. Demo fixtures
// are enabled only by an explicit configuration flag.
assert.ok(
  html.includes("if(window.KY_CONFIG.demoFixtures!==true)"),
  "demo fixture interception must be opt-in"
);
assert.ok(
  html.includes("window.KY_CONFIG.apiBaseUrl"),
  "frontend must support an explicitly configured API origin"
);
assert.ok(
  html.includes("if(!apiBase)return KY_ORIGINAL_FETCH(input,opts)"),
  "without API configuration, use normal fetch instead of fabricated results"
);
