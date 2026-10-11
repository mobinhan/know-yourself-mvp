# Runtime Feasibility Checkpoint — 2026-10-10

## Read-only Supabase inspection

The connected Supabase project is `mobinhan's Project`, ref `djtpqqjenmcsrdcguttk`, region `ap-south-1`, status `ACTIVE_HEALTHY`.

The project currently reports one active Edge Function:
- `user-data-api`, version 5, `verify_jwt: true`.

I fetched the deployed function source read-only. It authenticates the bearer JWT and supports profile, preferences, charts, conversations/turns, saved insights, transit snapshots and memories. Its deployed response's supported-resource list does **not** include `continuity`; therefore the repository's newer continuity route is not verified as deployed. No function was deployed or changed during this inspection.

The deployed function does not implement the frontend's `/v1/*` API family and does not call the OpenAI reasoning provider. This confirms that the connected Supabase project currently provides authenticated persistence, not the full live chart/answer runtime.

## Runtime implication

The older `feature/live-api-v1` implementation is a Python HTTP handler using `pyswisseph` and `timezonefinder`. The current Supabase Edge Function runtime is Deno. The project has no verified configured Python service/runtime for that handler in the inspected evidence. Therefore, we cannot safely deploy the Python API into the existing Supabase Edge Function as-is, and we must not claim it is already live.

A safe next implementation requires one of:
1. Establish that an already-approved trusted Python runtime exists and can be used without introducing an unapproved platform; or
2. Prove a compatible way to expose the retained Swiss Ephemeris calculation engine through the approved backend, with golden-chart parity tests.

Do not choose a new host, create a service, deploy functions, change secrets, or alter production data without the relevant authorization. The existing live Edge Function remains untouched.

## CI status

A workflow lookup for the latest resume checkpoint commit returned no associated pull-request-triggered workflow runs. That result is not evidence of a pass or failure. Current branch CI must be verified via the repository's Actions interface/tooling that exposes all workflow runs before claiming the latest tests pass.

## Conclusion

- Supabase project exists and is healthy: **verified**.
- Deployed authenticated persistence function exists: **verified**.
- Newer continuity route is deployed: **not verified; deployed source does not include it**.
- Deployed `/v1/*` chart and AI answer API: **not present in the inspected function**.
- Live OpenAI reasoning configured and reachable: **not verified**.
- Approved Python runtime for the older API: **not found in the inspected configuration**.
- No deployment or production changes performed.
