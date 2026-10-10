# Canonical Chart API Contract — v1 (Proposed, Pre-Implementation)

Status: proposed contract for implementation and tests; not a live API.
Date: 2026-10-10

## Purpose

Expose the deterministic Swiss Ephemeris engine as an independently usable capability. The 3framework is an optional consumer, never a dependency of calculation. This contract does not select or authorize a hosting runtime.

## Endpoint boundary

The future trusted calculation service should expose a versioned route such as `POST /v1/charts/calculate`. This is a contract proposal, not a statement that this endpoint currently exists.

### Request

```json
{
  "contract_version": "1",
  "birth_datetime_local": "1982-04-15T07:38:00",
  "timezone": "Europe/Amsterdam"
}
```

Requirements:
- Accept an ISO local date/time and explicit IANA timezone.
- Validate format, timezone existence, daylight-saving ambiguity/nonexistence, and request size.
- Never trust a client-supplied canonical chart as authoritative.
- Latitude/longitude and place resolution, if required by a calculation implementation, must be resolved/validated in the trusted calculation boundary and represented in calculation provenance. The service must not guess coordinates from a place string.
- Do not require an AI key, logged-in user, user memories, or 3framework context to calculate a chart.
- Saved-chart operations are a separate authenticated boundary and must enforce ownership.

### Response

```json
{
  "contract_version": "1",
  "chart": {
    "birth_datetime_utc": "1982-04-15T05:38:00Z",
    "timezone": "Europe/Amsterdam",
    "ephemeris": {
      "provider": "Swiss Ephemeris",
      "version": "engine-reported-version",
      "node": "true",
      "design_offset_degrees": 88.0
    },
    "activations": {
      "personality": [],
      "design": []
    }
  },
  "provenance": {
    "engine_name": "ky-hd-engine",
    "engine_version": "explicit-version",
    "contract_version": "1"
  }
}
```

The arrays above are schema placeholders only; a real response must contain the complete deterministic engine output. The current Python engine's `calculate_chart()` output includes local birth date/time and timezone as well as UTC and activations. Before exposing it to consumers, explicitly decide whether birth-data fields should be returned. Never send direct birth fields to the AI provider merely because the engine artifact contains them.

## Invariants

1. **Standalone:** calculation succeeds without AI provider, Layer 2 context, or the 3framework.
2. **Deterministic:** same validated inputs and exact engine/calculation settings return the same canonical chart fields. Volatile calculation timestamp, if present, is metadata and must not be part of the deterministic equality assertion.
3. **Immutable result:** interpretation cannot modify canonical activations, channels, centres, definition, type, authority, profile, or cross.
4. **Transit separation:** transits are separate timestamped overlay results and cannot mutate natal results.
5. **Versioned:** engine, contract, ephemeris provider/version, timezone database/version (when available), and calculation settings are explicit.
6. **Evidence:** derived structural claims include stable references to the underlying canonical fields and derivation rule/version.
7. **Optional interpretation:** provider missing/failure returns an explicit provider status for interpretation while chart calculation remains available.
8. **Privacy:** Layer 2 is fetched only in an authenticated, owner-scoped request and included only when the user's relevant consent permits it.
9. **No fourth layer:** no separate critic model is added to the agreed 3framework.

## Errors

Use stable machine-readable error codes and sanitized messages:
- `invalid_request`
- `invalid_timezone`
- `ambiguous_local_time`
- `nonexistent_local_time`
- `calculation_failed`
- `provider_not_configured` (interpretation only)
- `provider_unavailable` (interpretation only)
- `unauthorized`
- `forbidden`
- `rate_limited`

Do not return stack traces, secrets, upstream provider bodies, or internal paths to clients.

## Acceptance suite

- Golden Chart #2, including six expected channels: 3–60, 11–56, 28–38, 32–54, 34–57, 42–53.
- Engine-only calculation with AI key unset and no 3framework/context imported.
- Deterministic equality for canonical fields across repeated requests.
- Timezone/DST boundary behavior and invalid input cases.
- Natal output unchanged by transit requests and by Layer 2/Layer 3 availability.
- Exact frontend response compatibility for all required chart and knowledge routes before switching frontend calls.
- Authentication and owner-scope tests for saved data.
- Provider absent/failure tests.
- CI must run on the branch intended for integration.

## Runtime gate

The current Supabase Edge Function runtime is Deno and currently hosts persistence, not Python Swiss Ephemeris calculation. No approved existing Python service/runtime has been verified in repository inspection. Therefore this contract must not be mistaken for implementation or deployment. Before implementing a live endpoint, confirm an existing approved runtime or request permission to establish one; do not silently introduce a host.
