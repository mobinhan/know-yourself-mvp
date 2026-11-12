/* Know Yourself — layered celestial BodyGraph skin.
   Display-only: MMI owns every coordinate, path, gate, channel and activation. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const theme = Object.freeze({
    name: "celestial-atlas",
    layers: Object.freeze(["cosmic-background", "zodiac-frame", "centre-materials", "channel-light", "gate-legibility"])
  });

  function defs() {
    return `
      <defs>
        <radialGradient id="kySpace" cx="50%" cy="42%" r="78%">
          <stop offset="0" stop-color="#28264F"/><stop offset=".48" stop-color="#151A3A"/><stop offset="1" stop-color="#070B1B"/>
        </radialGradient>
        <radialGradient id="kyNebulaPurple">
          <stop offset="0" stop-color="#B05CE8" stop-opacity=".48"/><stop offset=".42" stop-color="#7046B9" stop-opacity=".27"/><stop offset="1" stop-color="#7046B9" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="kyNebulaBlue">
          <stop offset="0" stop-color="#3C9CEB" stop-opacity=".42"/><stop offset=".5" stop-color="#3557A8" stop-opacity=".2"/><stop offset="1" stop-color="#3557A8" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="kyNebulaRose">
          <stop offset="0" stop-color="#E36DBA" stop-opacity=".3"/><stop offset="1" stop-color="#E36DBA" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="kyGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFF4C9"/><stop offset=".38" stop-color="#E8BD65"/><stop offset=".7" stop-color="#A96C35"/><stop offset="1" stop-color="#FFE9A4"/>
        </linearGradient>
        <linearGradient id="kyCrystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#E9D8FF"/><stop offset=".48" stop-color="#6F55A9"/><stop offset="1" stop-color="#201F48"/>
        </linearGradient>
        <radialGradient id="kyCenterGold"><stop offset="0" stop-color="#FFF1B1"/><stop offset=".25" stop-color="#E9B95B"/><stop offset=".7" stop-color="#8F5A38"/><stop offset="1" stop-color="#342449"/></radialGradient>
        <radialGradient id="kyCenterViolet"><stop offset="0" stop-color="#F4B8F5"/><stop offset=".25" stop-color="#A65ED0"/><stop offset=".72" stop-color="#49336E"/><stop offset="1" stop-color="#211D42"/></radialGradient>
        <radialGradient id="kyCenterBlue"><stop offset="0" stop-color="#B8F3FF"/><stop offset=".25" stop-color="#438DD6"/><stop offset=".72" stop-color="#273B75"/><stop offset="1" stop-color="#151B3D"/></radialGradient>
        <radialGradient id="kyCenterRose"><stop offset="0" stop-color="#FFD1F4"/><stop offset=".28" stop-color="#C46AD8"/><stop offset=".72" stop-color="#653C85"/><stop offset="1" stop-color="#2C204A"/></radialGradient>
        <pattern id="kyStarGrain" width="47" height="59" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="9" r=".75" fill="#FFF1C9"/><circle cx="33" cy="22" r=".55" fill="#DCCBFF"/>
          <circle cx="19" cy="49" r=".65" fill="#FFFFFF"/><path d="M42 43v4m-2-2h4" stroke="#F2D28C" stroke-width=".5"/>
        </pattern>
        <filter id="kyNebulaTexture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".018 .032" numOctaves="3" seed="18" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
          <feComponentTransfer in="mono" result="clouds"><feFuncA type="table" tableValues="0 .10 .24 .36"/></feComponentTransfer>
          <feBlend in="SourceGraphic" in2="clouds" mode="screen"/>
        </filter>
        <filter id="kyChannelGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="kyCentreGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="kyCanvas"><rect x="-18" y="-18" width="372" height="601" rx="14"/></clipPath>
      </defs>`;
  }

  function background() {
    return `
      <g id="ky-cosmic-background" clip-path="url(#kyCanvas)">
        <rect x="-18" y="-18" width="372" height="601" fill="url(#kySpace)"/>
        <ellipse cx="24" cy="160" rx="180" ry="220" fill="url(#kyNebulaPurple)" filter="url(#kyNebulaTexture)"/>
        <ellipse cx="320" cy="300" rx="170" ry="240" fill="url(#kyNebulaBlue)" filter="url(#kyNebulaTexture)"/>
        <ellipse cx="174" cy="500" rx="170" ry="160" fill="url(#kyNebulaRose)"/>
        <path d="M-20 110C45 50 70 190 132 146S244 50 370 124M-30 380C50 310 86 450 148 408S260 330 370 390" fill="none" stroke="#A878DF" stroke-width="22" opacity=".075" filter="url(#kyCentreGlow)"/>
        <rect x="-18" y="-18" width="372" height="601" fill="url(#kyStarGrain)" opacity=".88"/>
      </g>`;
  }

  function astrologyFrame() {
    const symbols = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
    const labels = symbols.map((s, i) => {
      const a = (-90 + i * 30) * Math.PI / 180;
      const x = 168 + Math.cos(a) * 176;
      const y = 280 + Math.sin(a) * 176;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="ky-zodiac">${s}</text>`;
    }).join("");
    return `
      <g id="ky-astrology-frame" fill="none">
        <circle cx="168" cy="280" r="184" stroke="url(#kyGold)" stroke-width="1.1" opacity=".78"/>
        <circle cx="168" cy="280" r="190" stroke="#B98AE8" stroke-width=".55" stroke-dasharray="1 4" opacity=".72"/>
        <circle cx="168" cy="280" r="198" stroke="url(#kyGold)" stroke-width=".55" opacity=".5"/>
        <circle cx="168" cy="280" r="170" stroke="#A78BCE" stroke-width=".45" opacity=".22"/>
        <path d="M168 80V82M168 478V480M-12 280H-10M346 280H348" stroke="#F5D995" stroke-width="1"/>
        ${labels}
        <g fill="#FFE4A1" stroke="none" opacity=".9">
          <path d="M168 36l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
          <path d="M168 522l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
        </g>
      </g>`;
  }

  function styleCentres(svg) {
    // Centre polygons are identified by their exact MMI centre outline attributes.
    const centreFills = ["#FFFDF7"];
    let out = svg;
    for (const fill of centreFills) out = out.replaceAll('fill="' + fill + '" stroke="#1E2A44"', 'fill="url(#kyCrystal)" stroke="url(#kyGold)"');
    // Keep all original points and paths. Use selectors to add a restrained inner jewel sheen.
    return out;
  }

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) throw new TypeError("Expected an MMI SVG string");
    let out = svg;
    out = out.replace(/<rect x="-18" y="-18" width="372" height="601" rx="14" fill="#FDFAF3" stroke="#D8CDB8" stroke-width="1"\/>/, "");
    out = out.replace("<defs>", defs() + "<defs>");
    out = out.replace("<polygon", background() + astrologyFrame() + "<polygon");
    out = styleCentres(out);
    out = out.replaceAll('fill="#FFFDF7"', 'fill="#292846"');
    out = out.replaceAll('fill="#1E2A44"', 'fill="url(#kyGold)"');
    out = out.replaceAll('stroke="#1E2A44"', 'stroke="url(#kyGold)"');
    out = out.replaceAll('fill="#A83226"', 'fill="#FF5F7E"');
    out = out.replaceAll('fill="#15151A"', 'fill="#171321"');
    out = out.replace('<svg ', '<svg class="ky-bodygraph-svg" ');
    out = out.replace("</svg>", `
      <style>
        .ky-bodygraph-svg .ky-zodiac { fill:#F2D18A; font-family:Georgia,serif; font-size:13px; opacity:.88; filter:url(#kyCentreGlow); }
        .ky-bodygraph-svg polygon[stroke^="url(#kyGold)"] { filter:url(#kyCentreGlow); }
        .ky-bodygraph-svg polygon[fill="#FF5F7E"], .ky-bodygraph-svg polygon[fill="#171321"] { filter:url(#kyChannelGlow); }
        .ky-bodygraph-svg text { fill:#FFF0CE; paint-order:stroke; stroke:#17152E; stroke-width:.42px; }
        .ky-bodygraph-svg #ky-astrology-frame { pointer-events:none; }
      </style>
    </svg>`);
    return out;
  }

  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();