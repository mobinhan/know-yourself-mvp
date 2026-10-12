# Canonical Chart Validation Protocol

## Purpose
Prevent incorrect planetary gate/line activations from passing because structural checks (type, authority, profile, channels) still pass.

## Source of truth and architecture
- Repository: `mobinhan/know-yourself-mvp`
- Canonical calculation engine: `engine/ephemeris.py` (Swiss Ephemeris)
- Golden reference fixture: `engine/golden-chart.json`
- Golden/temporal acceptance tests: `engine/test_temporal_golden.py` and the other tests under `engine/test_*.py` / `engine/test_*.mjs`
- Validation policy: `engine/VALIDATION_MODEL.md`
- Validation status: `engine/VALIDATION_STATUS.md`
- Project continuity: `PROJECT_STATE.md`

The Lovable UI is not the owner of chart mechanics or validation. Do not use frontend code as a parallel calculation engine.

## Required Golden Chart regression coverage
For the Golden Chart #2 (1982-04-15 07:38, Europe/Amsterdam), compare calculated output with the verified reference fixture:
- all planetary activations on Personality and Design sides where fixture values are verified;
- each activation's gate and line at minimum;
- Colour, Tone, and Base only where the mapping specification/reference is independently verified;
- derived channels, centres, definition, type, authority, profile and Incarnation Cross where grounded.
A passing type/channel check alone is insufficient.

Current known node reference in `engine/golden-chart.json`:
- Personality North Node: longitude 106.97891608599889°, Gate 53 line 2.
- Personality South Node: longitude 286.9789160859989°, Gate 54 line 2.
The fixture is a regression reference; it must not override calculation mechanics. If the calculation disagrees, report the discrepancy and investigate ephemeris, node convention, timezone, gate mapping, and boundary math. Never add a birth-specific override.

## Boundary tests
Test `gate_from_longitude` (or its current equivalent) at:
- 0° / 360° wraparound;
- each gate start and values immediately below/above it;
- each of the six line boundaries within gates and values immediately below/above them;
- normalized negative and >360° longitudes if the public contract supports them;
- invalid/non-finite input behavior.
Expected results must be derived from the documented gate order and angular widths, not copied from outputs under test.

## Change protocol
1. Inspect this protocol, `engine/VALIDATION_MODEL.md`, `engine/VALIDATION_STATUS.md`, `engine/golden-chart.json`, and the existing tests before changing calculation code.
2. Keep calculation logic in `engine/ephemeris.py`; tests/fixtures must validate it, not replace it.
3. Add a regression test for every verified discrepancy before or alongside the fix.
4. Run the relevant focused tests, then the full engine validation suite and GitHub Actions.
5. Update `engine/VALIDATION_STATUS.md` with actual evidence and commit SHA. Do not claim tests passed unless a run confirms it.
6. Do not modify Lovable, deploy, add dependencies, or change other planetary algorithms unless necessary and explicitly within scope.
7. Preserve unresolved discrepancies as documented findings. Do not silently label a one-chart match as proof of universal accuracy.

## Current work item
Strengthen Golden Chart activation regression coverage and gate/line boundary tests. Validate all reference values against the checked-in Golden Chart fixture and the available MMI report. The North Node line discrepancy previously seen in the separate Lovable prototype must be checked against this canonical engine; do not assume the two codebases are the same.
