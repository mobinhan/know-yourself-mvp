# Know Yourself — MMI Bodygraph integration

## Renderer boundary
The Bodygraph renderer is display-only. It receives Personality gate IDs, Design gate IDs, and completed channel IDs from the deterministic chart engine. It does not calculate planetary positions, gates, lines, channels, centres, type, authority, or definition.

The renderer's geometry is extracted from `Stratogos.MMI.Renderer.dll` and stored as the compressed, immutable MMI manifest. The browser bootstrap decompresses the manifest and renderer and exposes them as `KY_BODYGRAPH_MANIFEST` and `KYBodygraphRenderer`.

## Geometry invariants
- Preserve the MMI native coordinate system. Spleen is on the left; Solar Plexus is on the right. Do not mirror or horizontally flip.
- Personality activations are black; Design activations are red; gates activated on both sides use the MMI split pattern.
- The four integration gates (10, 20, 34, 57) are drawn from auxiliary shapes 65–70 according to the decoded MMI combination table. Do not invent independent channel paths for these gates.
- The renderer maps engine-supplied completed channel IDs to the corresponding centre geometry only. It does not infer channel completion from gate activations.
- The canonical engine's centre/channel result is authoritative.

## Gate wheel and ephemeris
The deterministic engine's existing wheel is verified against the decompiled MMI gate table. Gate 41 begins at 2°00′00″ Aquarius (302.0° absolute longitude); the current `MANDALA_OFFSET_DEG = 58.0` is intentional. Do not replace this with a 0° Aquarius anchor or change `GATE_ORDER`, substructure math, or the ephemeris wheel.

The engine currently uses Swiss Ephemeris `TRUE_NODE` for North Node and derives South Node as its opposite. MMI's node output appears to follow the mean node convention (the report notes a roughly 1.75° difference for nodes only). This is recorded as a known convention difference; no node-flag change is authorised.

## Acceptance
Test chart: 13 Dec 1980, 14:32, Baarn, Europe/Amsterdam.
- Personality gates: 5, 14, 18, 19, 26, 32, 33, 43, 45, 54, 55.
- Design gates: 4, 6, 9, 26, 33, 36, 43, 44, 46, 47, 48, 49, 57.
- Defined channels: 19-49, 26-44, 32-54.
- Both-side split gates: 26, 33, 43.
- SVG must match the supplied reference exactly (SHA-256 `2d8b4dc53f735ffff6c00e5fadb6c658a0e60cd4f9f15260c6f54cee7316323d`).

Run: `node engine/test_bodygraph_renderer.cjs`.
