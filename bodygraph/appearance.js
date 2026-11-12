/* Know Yourself visual-only BodyGraph appearance layer.
   Geometry, gate/channel mechanics and activation semantics remain owned by MMI + the canonical engine. */
(function () {
  const theme = Object.freeze({
    name: "celestial-mystic",
    palette: Object.freeze({
      "#FDFAF3": "#101329", // deep indigo canvas
      "#FFFDF7": "#293052", // midnight-violet channel underlay
      "#D8CDB8": "#A98A60", // antique-gold border
      "#1E2A44": "#E7C98A", // luminous gold structure
      "#3A4A6B": "#F4E8C7", // warm ivory gate labels
      "#C9A86A": "#D9A9F5", // amethyst defined-centre detail
      "#A9834B": "#EBC46F", // radiant gold centre detail
      "#A83226": "#FF637E"  // vivid rose-red Design activations
    })
  });

  const celestialDefs = `
    <defs>
      <radialGradient id="kyCosmicBg" cx="50%" cy="43%" r="72%">
        <stop offset="0%" stop-color="#30234F"/>
        <stop offset="48%" stop-color="#171B3B"/>
        <stop offset="100%" stop-color="#080D20"/>
      </radialGradient>
      <radialGradient id="kyNebula" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#8B55C7" stop-opacity=".28"/>
        <stop offset="58%" stop-color="#4B6FB9" stop-opacity=".12"/>
        <stop offset="100%" stop-color="#171B3B" stop-opacity="0"/>
      </radialGradient>
      <pattern id="kyStars" width="73" height="83" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="13" r=".8" fill="#F9E7B8" opacity=".8"/>
        <circle cx="46" cy="29" r=".55" fill="#C9B8FF" opacity=".8"/>
        <circle cx="25" cy="68" r=".7" fill="#FFFFFF" opacity=".7"/>
        <path d="M61 57v4m-2-2h4" stroke="#F5D995" stroke-width=".45" opacity=".65"/>
      </pattern>
      <filter id="kyGoldGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.1" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="kySoftGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.1" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect x="-18" y="-18" width="372" height="601" fill="url(#kyCosmicBg)"/>
    <rect x="-18" y="-18" width="372" height="601" fill="url(#kyNebula)"/>
    <rect x="-18" y="-18" width="372" height="601" fill="url(#kyStars)" opacity=".9"/>
    <g fill="none" stroke="#C9A8F4" opacity=".18" stroke-width=".65">
      <circle cx="168" cy="280" r="172"/>
      <circle cx="168" cy="280" r="184" stroke="#E6C77F" opacity=".65"/>
      <circle cx="168" cy="280" r="194" stroke-dasharray="1.2 5"/>
      <path d="M-5 280H341M168 -10V578M30 40L306 520M306 40L30 520"/>
    </g>
  `;

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) {
      throw new TypeError("Expected an MMI SVG string");
    }
    let styled = svg;
    // Replace the original paper canvas with the layered celestial scene.
    styled = styled.replace(/<rect x="-18" y="-18" width="372" height="601" rx="14" fill="#FDFAF3" stroke="#D8CDB8" stroke-width="1"\/>/, "");
    styled = styled.replace("<defs>", celestialDefs + "<defs>");
    for (const [from, to] of Object.entries(theme.palette)) {
      styled = styled.replaceAll(from, to);
    }
    styled = styled.replace("<svg ", '<svg class="ky-bodygraph-svg" ');
    styled = styled.replace("</svg>", `
      <style>
        .ky-bodygraph-svg text { paint-order: stroke; stroke: #171329; stroke-width: .32px; }
        .ky-bodygraph-svg polygon, .ky-bodygraph-svg path { filter: url(#kySoftGlow); }
        .ky-bodygraph-svg [stroke="#E7C98A"] { filter: url(#kyGoldGlow); }
      </style>
    </svg>`);
    return styled;
  }

  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();
