# Step 3 — Canonical Data Contracts

Status: implementation complete; CI verification required.

## Purpose
Freeze the deterministic interface between the Know Yourself calculation/mechanics layer and all downstream consumers.

## Contract boundary
Downstream systems may consume canonical data but must not recalculate or mutate deterministic mechanics.
Interpretation is explicitly outside these contracts.

## Contract families

### Chart
Version 1.0.0.
The canonical chart contains identity, birth context, calculation provenance, personality/design activations, structural output, and evidence.

### Temporal State
Version 1.0.0.
A temporal state contains natal, transit, temporary, combined, and invariants proving natal preservation and temporary-state separation.

### Life-Cycle Event
Version 1.0.0.
Exact event timestamps are authoritative. Nominal ages are descriptive and must never substitute for astronomical event timestamps.

### Connection
Version 1.0.0.
A connection contains chart A/B mechanics, shared gates, electromagnetic channels, combined mechanics, and mutual complete channels.
Interpretive concepts such as dominance, compatibility, attraction, or relationship quality are forbidden in this layer.

### Evidence
Version 1.0.0.
Evidence records preserve the mechanical claim, inputs, result, source identifiers, and calculation provenance.

## Versioning rule
Contract versions are explicit. A downstream consumer must reject an unsupported contract version rather than silently reinterpret it.

## Acceptance rule
Step 3 is complete when GitHub Actions passes the existing deterministic suite plus validate_data_contracts.mjs and test_data_contracts.mjs.
After that, the contract boundary is frozen unless a deliberate versioned change is made.
