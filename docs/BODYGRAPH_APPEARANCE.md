# Know Yourself — Celestial BodyGraph renderer

## Authority and invariants
The MMI geometry manifest and canonical chart engine remain authoritative. The appearance layer is display-only: it must never calculate, infer, move, add, remove, or relabel gates, channels, centres, activations, or paths. Personality/Design split patterns retain their original semantic distinction.

## Layered composition
`bodygraph/appearance.js` exposes `KYBodygraphAppearance.apply(svg)` and composes:
1. Cosmic background — indigo base, violet/blue/rose nebula fields, atmospheric cloud texture and star grain.
2. Astrological frame — concentric orbital rings, twelve labelled divisions and celestial markers behind the chart.
3. Centre materials — differentiated gold, violet, blue and rose jewel gradients applied to the existing nine MMI centre polygons.
4. Channel light — pearl channel underlays, glowing rose Design activations, black Personality activations, and unchanged MMI split patterns.
5. Gate legibility — warm ivory numerals with a dark keyline.

The composition inserts its backdrop immediately after the first MMI definitions block and before the first geometry element. This ordering is important: later MMI definitions may be interleaved with geometry and must not cause the background to cover earlier shapes.

## Integration
`bodygraph/bootstrap.js` loads the appearance module after the MMI renderer. `index.html` passes the renderer's SVG output into `KYBodygraphAppearance.apply(svg)`.

## Visual verification
A local high-resolution render was generated from the supplied 1980-12-13 Baarn reference SVG and visually compared with the agreed celestial concept. The new render is materially closer: textured cosmic atmosphere, gold orbital frame, differentiated jewel centres, luminous pearl channels and distinct black/red activations.

The transformed SVG was parsed successfully. Regression comparison found:
- 98 polygons in both original and styled SVG.
- All original polygon/path geometry signatures retained.
- Gate text and coordinates identical.
- No gate, channel, centre or activation calculations were changed.

The reference concept image is aesthetic guidance only; its illustrative gate data is not authoritative.

## Remaining limitations and acceptance
The background is still procedural SVG, not the high-resolution nebula photograph used in the local visual exploration. Browser screenshot QA could not be completed in the current runtime; the preview was rendered with CairoSVG. The app has not been deployed. Before release, run the branch in a real browser, compare its screenshot with the approved concept, and repeat the geometry regression test.