/* Know Yourself visual-only BodyGraph appearance layer.
   Geometry, gate/channel mechanics and activation semantics remain owned by MMI + the canonical engine. */
(function () {
  const theme = Object.freeze({
    name: "warm-editorial",
    palette: Object.freeze({
      "#FDFAF3": "#FBF7EF", // canvas: warm ivory
      "#FFFDF7": "#FFFCF6", // channel underlay / neutral fill
      "#D8CDB8": "#E4D8C5", // quiet border
      "#1E2A44": "#243650", // deep navy: outlines and primary labels
      "#3A4A6B": "#6E788A", // muted slate: inactive gate labels
      "#C9A86A": "#D8BD86", // muted gold: defined centre accents
      "#A83226": "#B24D43"  // restrained red: Design activations
      // Personality black (#15151A) and split patterns are intentionally unchanged.
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