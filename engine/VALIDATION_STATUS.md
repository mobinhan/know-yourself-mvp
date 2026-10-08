# Step 1 Validation Status

## Current status

The deterministic engine implementation and multi-chart invariant tests are committed.

The repository currently contains:
- Swiss Ephemeris calculation layer
- deterministic structural derivation
- Golden Chart #2 fixture and acceptance test
- five-chart invariant test suite
- GitHub Actions workflow intended to execute the tests

## Blocking verification

The available GitHub connector is not returning workflow runs for the validation commits, while the repository status currently exposes only the Vercel status check.

Therefore Step 1 is **not yet certified as passing**.

We must execute the Python test suite in a real Python environment before treating the ephemeris mapping/design calculation as validated.

## Do not proceed to production evidence integration until runtime validation passes.

## Acceptance criteria

1. Golden Chart #2 reproduces the expected activation gates/lines.
2. All five independent charts pass activation invariants.
3. Earth/South Node are exact opposites.
4. Structural derivation produces valid channels, centres, definition, type, authority, profile and incarnation cross.
5. No UI fixture is used as the calculation source.

Once these pass, proceed to the deterministic evidence layer.
