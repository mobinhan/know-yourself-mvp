/* Know Yourself visual-only BodyGraph appearance layer.
   MMI geometry and canonical chart/activation semantics are immutable. */
(function () {
  const theme = Object.freeze({
    name: "celestial-mystic",
    palette: Object.freeze({
      "#FDFAF3": "#11142B",
      "#FFFDF7": "#292D50",
      "#D8CDB8": "#C49A5B",
      "#1E2A44": "#E8C879",
      "#3A4A6B": "#F6E9C9",
      "#C9A86A": "#C9A0F2",
      "#A9834B": "#F0C36D",
      "#A83226": "#FF667F"
    })
  });

  const celestial = `
    <defs>
      <radialGradient id="kyCosmicBg" cx="49%" cy="43%" r="75%">
        <stop offset="0" stop-color="#35234F"/>
        <stop offset=".42" stop-color="#1B2042"/>
        <stop offset="1" stop-color="#080D20"/>
      </radialGradient>
      <radialGradient id="kyNebulaViolet">
        <stop offset="0" stop-color="#A65CE0" stop-opacity=".34"/>
        <stop offset=".55" stop-color="#714DAB" stop-opacity=".15"/>
        <stop offset="1" stop-color="#714DAB" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="kyNebulaBlue">
        <stop offset="0" stop-color="#438DD4" stop-opacity=".28"/>
        <stop offset="1" stop-color="#438DD4" stop-opacity="0"/>
      </radialGradient>
      <pattern id="kyStarField" width="67" height="79" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="13" r=".85" fill="#FFF0C9" opacity=".9"/>
        <circle cx="46" cy="29" r=".55" fill="#C7B8FF" opacity=".9"/>
        <circle cx="25" cy="68" r=".7" fill="#FFFFFF" opacity=".8"/>
        <path d="M59 54v7m-3.5-3.5h7" stroke="#F4D68D" stroke-width=".55" opacity=".85"/>
      </pattern>
      <filter id="kyGlowGold" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2.6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="kyGlowSoft" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.15" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect x="-18" y="-18" width="372" height="601" fill="url(#kyCosmicBg)"/>
    <ellipse cx="30" cy="150" rx="155" ry="210" fill="url(#kyNebulaViolet)"/>
    <ellipse cx="310" cy="340" rx="160" ry="235" fill="url(#kyNebulaBlue)"/>
    <ellipse cx="170" cy="540" rx="170" ry="110" fill="url(#kyNebulaViolet)" opacity=".75"/>
    <rect x="-18" y="-18" width="372" height="601" fill="url(#kyStarField)" opacity=".94"/>
    <g fill="none" stroke="#C7A2F0" stroke-width=".55" opacity=".25">
      <circle cx="168" cy="280" r="176"/>
      <circle cx="168" cy="280" r="187" stroke="#E8C879" opacity=".9"/>
      <circle cx="168" cy="280" r="198" stroke-dasharray="1.2 5"/>
      <circle cx="168" cy="280" r="208" stroke-dasharray=".7 8"/>
      <path d="M-8 280H344M168 -12V578M18 82L318 478M318 82L18 478"/>
    </g>
    <g fill="#EACB8C" font-family="Georgia,serif" font-size="10" text-anchor="middle" opacity=".65">
      <text x="168" y="87">✦</text><text x="168" y="474">✧</text>
      <text x="9" y="284">✧</text><text x="327" y="284">✧</text>
      <text x="48" y="115">☽</text><text x="288" y="445">☼</text>
    </g>
    <g fill="none" stroke="#F0CB82" stroke-width=".8" opacity=".58">
      <path d="M168 7l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2z"/>
      <path d="M168 550l2.2 6 6 2.2-6 2.2-2.2 6-2.2-6-6-2.2 6-2.2z"/>
    </g>
  `;

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) {
      throw new TypeError("Expected an MMI SVG string");
    }
    let styled = svg;
    styled = styled.replace(/<rect x="-18" y="-18" width="372" height="601" rx="14" fill="#FDFAF3" stroke="#D8CDB8" stroke-width="1"\/>/, "");
    styled = styled.replace("<defs>", celestial + "<defs>");
    for (const [from, to] of Object.entries(theme.palette)) styled = styled.replaceAll(from, to);
    styled = styled.replace("<svg ", '<svg class="ky-bodygraph-svg" ');
    styled = styled.replace("</svg>", `
      <style>
        .ky-bodygraph-svg text { paint-order: stroke; stroke: #15142B; stroke-width: .24px; }
        .ky-bodygraph-svg polygon, .ky-bodygraph-svg path { filter: url(#kyGlowSoft); }
        .ky-bodygraph-svg polygon[stroke="#E8C879"],
        .ky-bodygraph-svg path[stroke="#E8C879"] { filter: url(#kyGlowGold); }
      </style>
    </svg>`);
    return styled;
  }
  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();
