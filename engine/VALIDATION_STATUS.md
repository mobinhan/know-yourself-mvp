# Know Yourself Engine Validation Status

## Current status

The deterministic engine validation pipeline is operational and passing on `main`.

### Step 1 — Deterministic Human Design Chart Engine
**PASS**

Validated by the Python and structural test suites, including Golden Chart #2 and the multi-chart/invariant checks.

### Step 2 — Transit Overlay and Temporal Mechanics
**PASS — revalidated**

The current `main` branch passes the original Step 2 acceptance surface:

- deterministic transit overlay
- natal/transit/temporary/combined separation
- natal immutability
- temporal state integration
- time and life-cycle mechanics
- transit invariants
- temporal ephemeris and gate-crossing mechanics
- Golden Chart temporal checks

### Step 3 — Canonical Data Contracts
**PASS — CI verified**

The canonical chart, temporal state, life-cycle event, connection and evidence contracts pass validation, including:

- `validate_data_contracts.mjs`
- `test_data_contracts.mjs`

## Latest validation evidence

GitHub Actions run **#77** completed successfully.

- JavaScript contract validation: **PASS**
- Python engine validation: **PASS**

Commit validated: `ec6e4183bcd57b478121ecb5b8db0ee79017fcff`

## Rule

Do not proceed to downstream interpretation or production integration by silently changing deterministic mechanics. Any future mechanics change must trigger the relevant acceptance suite again.

## Golden activation regression update — 2026-10-12

The Golden activation regression test is now included in the Python engine validation workflow.

- Workflow run **#460**: [successful run](https://github.com/mobinhan/know-yourself-mvp/actions/runs/38195618665)
- Commit validated: `2ff004533677a33da682c27fe26ce36fafc5f63e`
- Python engine validation: **PASS — 32 tests passed**
- JavaScript contract validation: **PASS**
- Added coverage: all fixture-backed Personality and Design gate/line activations, explicit Golden Chart lunar-node checks, every gate boundary, internal line boundaries, longitude wraparound, and non-finite longitude rejection.
- Validation protocol: `engine/CHART_VALIDATION_PROTOCOL.md`
- Regression suite: `engine/test_golden_activation_regression.py`

This confirms agreement with the checked-in regression fixture for the tested cases. It does not independently certify the fixture against an external authority, nor implement Colour/Tone/Base calculations.
