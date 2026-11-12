# Know Yourself — Celestial BodyGraph renderer

## Authority and invariants
The MMI geometry manifest and canonical chart engine remain authoritative. This visual layer must never calculate, infer, move, add, remove, or relabel gates, channels, centres, activations, or paths. Personality/Design split patterns remain semantically distinct.

## Layered composition
`bodygraph/appearance.js` exposes `KYBodygraphAppearance.apply(svg)` and builds a layered SVG composition:
1. Cosmic background — deep indigo field, multiscale nebula gradients, atmospheric ribbons and star grain.
2. Astrological frame — concentric zodiac orbits, twelve zodiac glyphs and celestial markers, placed behind the graph.
3. Centre materials — jewel-like crystal fill and metallic-gold outlines applied to existing MMI centre polygons without changing their points.
4. Channel light — glow treatments around existing activation paths; Personality black, Design rose-red, and MMI split patterns remain distinguishable.
5. Gate legibility — warm ivory numerals with a dark keyline for contrast.

## Integration
`bodygraph/bootstrap.js` loads the appearance module after the MMI renderer. `index.html` passes the renderer's SVG output into `KYBodygraphAppearance.apply(svg)`.

## Known limitations
The current nebula is procedural SVG artwork, not a photographic background asset. The zodiac frame and jewel effects are vector treatments. This keeps the result resolution-independent and avoids external image dependencies, but a later art-directed raster nebula can replace only the background layer if desired. The centre silhouettes and all channel paths remain the exact MMI geometry.

## Verification status
This is a new visual architecture committed to the isolated `feature/mmi-bodygraph-renderer` branch. It has not been deployed. Browser QA and pixel/geometry regression checks are still required before acceptance.