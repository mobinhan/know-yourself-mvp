# Know Yourself — Celestial BodyGraph renderer

## Authority and invariants

The MMI geometry manifest and canonical chart engine remain authoritative. The appearance layer is display-only: it must never calculate, infer, move, add, remove, or relabel gates, channels, centres, activations, or paths. Personality/Design split patterns retain their original semantic distinction.

## Layered composition

`bodygraph/appearance.js` exposes `KYBodygraphAppearance.apply(svg)` and composes:

1. **Static celestial backdrop** — the approved full-bleed WebP at `bodygraph/assets/ky-celestial-backdrop.webp`, mapped to the MMI viewBox rectangle `x=-18, y=-18, width=372, height=601`. The nebula, zodiac ring, glyphs, degree ticks, sun/moon markers and ambient flares are baked into this asset; no procedural cloud texture or astrology frame is generated at render time.
2. **Centre materials** — differentiated gold, violet, blue and rose jewel gradients applied to the existing MMI centre polygons.
3. **Channel light** — pearl channel underlays with subtle warm-gold edging, glowing rose Design activations, black Personality activations, and unchanged MMI split patterns.
4. **Gate legibility** — warm ivory numerals with a dark keyline.

The backdrop image is inserted immediately after the first MMI definitions block and before the first geometry element. It therefore remains behind all MMI geometry.

## Integration

`bodygraph/bootstrap.js` loads the appearance module after the MMI renderer. `index.html` passes the renderer's SVG output into `KYBodygraphAppearance.apply(svg)`.

## Automated verification

Run both checks from the repository root:

```sh
node engine/test_bodygraph_renderer.cjs
node engine/test_bodygraph_appearance_geometry.cjs
```

The renderer acceptance test verifies the approved unstyled SVG SHA-256, 64 gate labels, split gates, nine centres, 36 channels and native orientation. The appearance regression test compares polygon point-sets, line/path coordinates and text positions before and after styling, and checks for the static plate and absence of procedural cloud/frame effects.

The unstyled reference SHA-256 remains:

`2d8b4dc53f735ffff6c00e5fadb6c658a0e60cd4f9f15260c6f54cee7316323d`

## Visual verification and remaining acceptance

A local styled reference-chart render is generated from the accepted test chart (13 December 1980, 14:32 CET, Baarn) with the static WebP backdrop embedded for raster proof. This local render verifies asset loading and visual composition; it is not a browser screenshot.

**Browser/device QA remains pending.** It belongs in the staging smoke test after the owner-approved merge. That smoke test must check mobile browser rendering, scroll performance, image loading, and visual legibility at representative viewport sizes. No deployment or production verification is implied by the local checks.
