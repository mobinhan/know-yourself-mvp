# Premium entitlement enforcement — implementation checkpoint

**Status: BLOCKED for production enforcement.** This branch adds a reusable, fail-closed capability policy and focused policy tests. It does not yet protect a live AI route because the trusted subscription source and active AI route are not present together in the repository's default-branch implementation.

## Implemented on this branch

- `supabase/functions/_shared/entitlements.ts`: explicit capability map; server-supplied identity/entitlement inputs; user-ID match; active/trial/grace status checks; expiry checks; fail-closed behavior for missing or unverifiable entitlement; generic denial status mapping.
- `supabase/functions/_shared/entitlements.test.ts`: 10 policy cases covering basic guide, missing authentication, missing entitlement, user mismatch, valid Premium, Free denial, expiry, grace window, unknown capability, and malformed time.

## Security limitations — do not mark the gate PASS

1. The policy helper is not yet called by a protected AI/knowledge route. A helper that is not wired into a route does not enforce a paywall.
2. A trusted entitlement repository/provider has not been identified or integrated. Client-supplied plan/tier flags must never be used as the source of truth.
3. Route-level tests have not yet demonstrated that denied requests skip protected retrieval and skip the model call.
4. Authenticated Free/Premium integration tests, data-isolation tests, and live deployment checks have not been run.
5. The Lovable app snapshot inspected earlier has an `/api/ask` route, but that project is not the repository's default-branch application. No Lovable edits were made as part of this branch.

## Required next implementation steps

1. Confirm the production application/API route and the authentication provider used by it.
2. Select or identify the trusted subscription source. If none exists yet, keep all Premium capabilities denied by default; do not invent an entitlement record from client state.
3. Wire authentication → trusted entitlement lookup → capability decision → consent/ownership checks → permitted retrieval → model invocation, in that order.
4. Add route tests that spy on retrieval and model-provider calls and assert neither runs after a denial.
5. Add authenticated tests for Free, active Premium, expired/canceled, grace-window, spoofed client claims, and cross-user data access.
6. Run tests and inspect the deployed service. Only then can P1–P15 be marked from observed evidence.

## Capability policy

- `guide.basic`: explicitly public/basic material only.
- `explore.advanced_sources`
- `transits.advanced_analysis`
- `lifecycles.full`
- `insights.history`
- `insights.pattern_recognition`
- `connection.comparison`

The last six capabilities require a valid server-verified Premium entitlement. The basic-guide route must independently constrain the knowledge payload; the capability decision must never be treated as permission to send arbitrary source material.

## Test command

With Deno available in the repository environment:

```sh
deno test supabase/functions/_shared/entitlements.test.ts
```

Record the actual result before claiming the tests pass. The tests have been authored but have **not** been executed in this change.
