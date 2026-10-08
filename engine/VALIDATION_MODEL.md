# Validation Model

The old embedded KY_FIXTURE is a regression reference only. It is not treated as an authoritative calculation source.

## Source-of-truth hierarchy

1. Swiss Ephemeris planetary positions
2. Explicit Know Yourself Human Design gate/line mapping specification
3. Deterministic structural derivation
4. Evidence records
5. Legacy program fixture — regression comparison only

## Deliberately unresolved

Colour, Tone and Base are not yet derived by the engine. They require a verified Human Design substructure mapping specification. The engine must not infer these from the legacy fixture.

The legacy fixture contains a known Personality Node line discrepancy against the current equal-angle gate/line mapping. That discrepancy is retained as a regression finding and is not silently "corrected" into the engine.

## Required next validation

- DST and non-DST timezone cases
- UTC/local-time round trips
- gate boundary tests
- line boundary tests
- Design timestamp boundary tests
- verified Colour/Tone/Base specification before implementation
