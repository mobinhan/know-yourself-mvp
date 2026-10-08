# Deterministic chart engine — Step 1

This module is isolated from the current UI.

Boundary:
- Upstream ephemeris calculation produces timestamped planetary activations.
- The Rave Mandala uses Gate 41 as its starting gate with the canonical 58° zodiac-to-I'Ching offset.
- Each Gate is subdivided into 6 Lines, each Line into 6 Colours, each Colour into 6 Tones, and each Tone into 5 Bases.
- The deterministic layer derives gates, channels, centres, definition, type, authority, profile and Incarnation Cross.
- Every derivation emits an inspectable evidence record.
- Downstream knowledge/source retrieval and AI interpretation are separate.

The ephemeris implementation uses Swiss Ephemeris and the true lunar node. The Design calculation is based on the Sun being 88 degrees behind the birth Sun.

The legacy KY fixture is a regression reference, not the authority for mechanics.

Golden acceptance test:
- Golden Chart #2 must reproduce its verified Gate/Line/Colour/Tone/Base activations.
- Structural derivation must reproduce the expected channels, centres, definition, type, authority, profile and cross.
- A mismatch blocks interpretation work until the mechanics are reconciled.
