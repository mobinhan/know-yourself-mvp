/* Know Yourself visual-only BodyGraph appearance layer.
   Geometry, gate/channel mechanics and activation semantics remain owned by MMI + the canonical engine. */
(function () {
  const theme = Object.freeze({
    name: "warm-editorial",
    palette: Object.freeze({
      "#FDFAF3": "#F1EBDD", // parchment canvas
      "#FFFDF7": "#E9E1D4", // visible warm-neutral channel underlay
      "#D8CDB8": "#D5C8B5", // soft border
      "#1E2A44": "#1C3557", // confident deep navy structure
      "#3A4A6B": "#738096", // softened slate gate labels
      "#C9A86A": "#E6C98E", // brighter muted-gold defined centres
      "#A9834B": "#B98B52", // warm ochre centre detail
      "#A83226": "#C65B52"  // richer muted red: Design activations
      // Personality black (#15151A) and MMI split patterns are intentionally unchanged.
    })
  });

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) {
      throw new TypeError("Expected an MMI SVG string");
    }
    let styled = svg;
    for (const [from, to] of Object.entries(theme.palette)) {
      styled = styled.replaceAll(from, to);
    }
    styled = styled.replace("<svg ", '<svg class="ky-bodygraph-svg" ');
    return styled;
  }

  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();