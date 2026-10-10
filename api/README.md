# Know Yourself Python API

This is the Python transport boundary for the existing deterministic Swiss Ephemeris engine. It is source code only; adding it to GitHub does not deploy or expose a live API.

## Local run

From the repository root, install the pinned dependencies and start the server:

```bash
python -m pip install -r requirements.txt -r engine/requirements.txt
KY_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173 python api/index.py
```

The server listens on `0.0.0.0:$PORT`, defaulting to port 8000. The frontend can point at the server using its non-secret runtime configuration:

```js
window.KY_CONFIG = {
  apiBaseUrl: "http://localhost:8000",
  demoFixtures: false
};
```

Configure `KY_ALLOWED_ORIGINS` with the exact frontend origins that should be allowed to read cross-origin responses. Do not use `*` in production.

## Key routes

- `POST /v1/charts/calculate` — standalone canonical chart artifact. Requires `birth_datetime_local` and an IANA `timezone`. Does not require login, AI credentials, user context, or the 3framework.
- `POST /v1/charts` — frontend-compatible chart creation response, including the canonical artifact and the chart foundation.
- `POST /v1/charts/{chart_id}/today` — calculates a timestamped transit overlay separately from natal mechanics.
- `POST /v1/charts/{chart_id}/questions/context` — contextual question endpoint; AI interpretation is server-side and reports an explicit unavailable status when no provider key is configured.
- `GET /v1/birthplaces/search` and `GET /v1/birthplaces/timezone` — birthplace resolution helpers.

## Runtime and production boundary

- No production runtime has been selected or deployed as part of this change.
- The Python service is intentionally separate from the Supabase Deno `user-data-api`, which remains responsible for authenticated persistence and user-owned records.
- Before production use, configure exact CORS origins, enforce platform-level request/rate limits, validate trusted proxy/IP handling, configure server-side AI secrets if desired, and run authenticated and end-to-end tests.
- Never put `OPENAI_API_KEY` or database service-role credentials in frontend code.
- Do not route chart calculation through an unverified endpoint. The chart engine must remain usable without AI credentials or user-context services.
