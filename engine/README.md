# Deterministic chart engine — Step 1

This module is isolated from the current UI.

Boundary:
- Upstream ephemeris calculation produces timestamped planetary activations.
- This module deterministically derives gates, channels, centres, definition, type, authority, profile and Incarnation Cross.
- Every derivation emits an inspectable evidence record.
- Downstream knowledge/source retrieval and AI interpretation are separate.

The module does not invent teaching and does not calculate planetary positions itself.

Golden acceptance test:
deriveStructuralChart(golden-chart).compareExpected(...) must return ok=true.
A mismatch blocks interpretation work until the mechanics are reconciled.
