# Know Yourself — BodyGraph appearance layer

## Purpose
The `warm-editorial` appearance layer changes presentation only. It does not alter the MMI geometry manifest, gate positions, channel paths, centre coordinates, activation lists, completed-channel results, or chart calculations.

## Visual direction
- Warm ivory canvas and neutral channel underlay
- Deep navy structural outlines and primary labels
- Muted slate for inactive gate labels
- Muted gold for centre accents
- Personality activations remain black
- Design activations remain red (slightly softened)
- Gates active in both retain the original MMI split patterns

## Implementation
- `bodygraph/appearance.js` exposes `KYBodygraphAppearance.apply(svg)` and a frozen `warm-editorial` palette.
- `bodygraph/bootstrap.js` loads the appearance layer after the renderer.
- `index.html` applies the palette to the renderer's SVG string immediately before display.

The layer uses literal palette substitutions and adds a presentation class to the SVG root. It does not parse, reposition, add, remove, or recalculate SVG geometry.

## Verification
The 13 Dec 1980, 14:32 CET, Baarn reference SVG was styled and rasterized at 672px wide. Reversing the palette substitutions and removing the presentation-only class reproduces the supplied reference SVG byte-for-byte. Personality black and both MMI split patterns remain present.

Preview: `know-yourself-bodygraph-warm-editorial.png` (generated outside the repository for review).
