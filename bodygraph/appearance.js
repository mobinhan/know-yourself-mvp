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
        <radialGradient id="kySpace" cx="50%" cy="43%" r="78%">
          <stop offset="0" stop-color="#30224D"/><stop offset=".48" stop-color="#151936"/><stop offset="1" stop-color="#070B1B"/>
        </radialGradient>
        <radialGradient id="kyVioletCloud"><stop stop-color="#B85AE8" stop-opacity=".65"/><stop offset=".48" stop-color="#7042B0" stop-opacity=".3"/><stop offset="1" stop-color="#7042B0" stop-opacity="0"/></radialGradient>
        <radialGradient id="kyBlueCloud"><stop stop-color="#459FE8" stop-opacity=".5"/><stop offset=".5" stop-color="#355DAE" stop-opacity=".22"/><stop offset="1" stop-color="#355DAE" stop-opacity="0"/></radialGradient>
        <radialGradient id="kyRoseCloud"><stop stop-color="#D86BCB" stop-opacity=".38"/><stop offset="1" stop-color="#D86BCB" stop-opacity="0"/></radialGradient>
        <linearGradient id="kyGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF5CC"/><stop offset=".42" stop-color="#E9BD62"/><stop offset=".72" stop-color="#A66B37"/><stop offset="1" stop-color="#FFE9A5"/></linearGradient>
        <radialGradient id="kyGemGold"><stop stop-color="#FFF4C4"/><stop offset=".22" stop-color="#F2C45F"/><stop offset=".72" stop-color="#8C5638"/><stop offset="1" stop-color="#352044"/></radialGradient>
        <radialGradient id="kyGemViolet"><stop stop-color="#FFE0FF"/><stop offset=".23" stop-color="#B66DDB"/><stop offset=".72" stop-color="#583778"/><stop offset="1" stop-color="#211B3C"/></radialGradient>
        <radialGradient id="kyGemBlue"><stop stop-color="#E0FFFF"/><stop offset=".22" stop-color="#55A9E8"/><stop offset=".72" stop-color="#29467D"/><stop offset="1" stop-color="#121B38"/></radialGradient>
        <radialGradient id="kyGemRose"><stop stop-color="#FFE0F7"/><stop offset=".24" stop-color="#D17AD8"/><stop offset=".72" stop-color="#713F8B"/><stop offset="1" stop-color="#2C2048"/></radialGradient>
        <pattern id="kyStars" width="53" height="61" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="10" r=".8" fill="#FFF1D0"/><circle cx="35" cy="27" r=".55" fill="#D7C8FF"/><circle cx="18" cy="51" r=".65" fill="#FFFFFF"/>
          <path d="M46 45v5m-2.5-2.5h5" stroke="#F5D995" stroke-width=".55"/>
        </pattern>
        <filter id="kyCloudTexture" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency=".014 .026" numOctaves="3" seed="22" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
          <feComponentTransfer in="mono" result="cloud"><feFuncA type="table" tableValues="0 .18 .34 .48"/></feComponentTransfer>
          <feBlend in="SourceGraphic" in2="cloud" mode="screen"/>
        </filter>
        <filter id="kyGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>`;
  }

  function background() {
    return `
      <g id="ky-cosmic-background">
        <rect x="-18" y="-18" width="372" height="601" fill="url(#kySpace)"/>
        <ellipse cx="26" cy="170" rx="178" ry="220" fill="url(#kyVioletCloud)" filter="url(#kyCloudTexture)"/>
        <ellipse cx="316" cy="300" rx="168" ry="238" fill="url(#kyBlueCloud)" filter="url(#kyCloudTexture)"/>
        <ellipse cx="170" cy="500" rx="170" ry="150" fill="url(#kyRoseCloud)" filter="url(#kyCloudTexture)"/>
        <path d="M-18 115C38 58 72 198 135 147S250 58 370 130M-22 390C48 315 86 465 150 410S270 330 370 395" fill="none" stroke="#B978E7" stroke-width="25" opacity=".13" filter="url(#kyGlow)"/>
        <rect x="-18" y="-18" width="372" height="601" fill="url(#kyStars)" opacity=".92"/>
      </g>`;
  }

  function astrologyFrame() {
    const roman = ["XII","XI","X","IX","VIII","VII","VI","V","IV","III","II","I"];
    const labels = roman.map((s,i) => {
      const a=(-90+i*30)*Math.PI/180, x=168+Math.cos(a)*178, y=280+Math.sin(a)*178;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="ky-zodiac">${s}</text>`;
    }).join("");
    return `
      <g id="ky-astrology-frame" fill="none">
        <circle cx="168" cy="280" r="184" stroke="url(#kyGold)" stroke-width="1.2" opacity=".9"/>
        <circle cx="168" cy="280" r="190" stroke="#C49AEF" stroke-width=".55" stroke-dasharray="1 3" opacity=".8"/>
        <circle cx="168" cy="280" r="198" stroke="url(#kyGold)" stroke-width=".65" opacity=".62"/>
        <circle cx="168" cy="280" r="171" stroke="#C7A1EA" stroke-width=".5" opacity=".3"/>
        <g stroke="#F3D28B" stroke-width=".6" opacity=".7">${Array.from({length:12},(_,i)=>{const a=(-90+i*30)*Math.PI/180,x1=168+Math.cos(a)*184,y1=280+Math.sin(a)*184,x2=168+Math.cos(a)*198,y2=280+Math.sin(a)*198;return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}"/>`;}).join("")}</g>
        <g fill="#F2D18A" stroke="none">${labels}</g>
      </g>`;
  }

  function styleCentres(svg) {
    // Only the nine centre polygons have the MMI centre outline stroke.
    return svg.replace(/<polygon(?=[^>]*stroke="#1E2A44")(?=[^>]*fill="#FFFDF7")([^>]*)\/>/g,
      (tag, attrs) => {
        const points = (attrs.match(/points="([^"]+)"/)||[])[1] || "";
        let gem = "kyGemViolet";
        if (points.includes("138.8,564.7") || points.includes("0,385.7") || points.includes("264.9,427.8")) gem = "kyGemGold";
        else if (points.includes("138.8,245")) gem = "kyGemBlue";
        else if (points.includes("191.4,362.4") || points.includes("138.8,483.2")) gem = "kyGemRose";
        else if (points.includes("126.3,307.4")) gem = "kyGemGold";
        return tag.replace('fill="#FFFDF7"', 'fill="url(#' + gem + ')"')
                  .replace('stroke="#1E2A44"', 'stroke="url(#kyGold)"')
                  .replace('stroke-width="1.4"', 'stroke-width="1.8"')
                  .replace('/>', ' filter="url(#kyGlow)"/>');
      });
  }

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) throw new TypeError("Expected an MMI SVG string");
    let out = svg;
    out = out.replace(/<rect x="-18" y="-18" width="372" height="601" rx="14" fill="#FDFAF3" stroke="#D8CDB8" stroke-width="1"\/>/, "");
    // Definitions and background must be inserted before the first geometry element,
    // not before an arbitrary later polygon: this preserves all MMI draw order.
    const firstDefsEnd = out.indexOf("</defs>");
    if (firstDefsEnd < 0) throw new Error("MMI SVG definitions not found");
    out = out.slice(0, firstDefsEnd + 7) + defs() + background() + astrologyFrame() + out.slice(firstDefsEnd + 7);
    out = styleCentres(out);
    // Channel underlays become pearl light; split, black and red activation fills stay distinct.
    out = out.replaceAll('fill="#FFFDF7" stroke="none"', 'fill="#D8D0EE" stroke="#EADFFF" stroke-width=".35"');
    out = out.replaceAll('fill="#A83226"', 'fill="#FF607C"');
    out = out.replaceAll('fill="#15151A"', 'fill="#171321"');
    out = out.replace('<svg ', '<svg class="ky-bodygraph-svg" ');
    out = out.replace("</svg>", `
      <style>
        .ky-bodygraph-svg .ky-zodiac { font: 5px Georgia,serif; letter-spacing:.5px; filter:url(#kyGlow); }
        .ky-bodygraph-svg polygon[fill="#FF607C"],
        .ky-bodygraph-svg polygon[fill="#171321"],
        .ky-bodygraph-svg polygon[fill^="url(#kySplit)"] { filter:url(#kyGlow); }
        .ky-bodygraph-svg text { fill:#FFF0D1; paint-order:stroke; stroke:#15142A; stroke-width:.38px; }
        .ky-bodygraph-svg circle[fill="#C9A86A"] { fill:#F3C96F; stroke:#FFF1BD; stroke-width:.55px; filter:url(#kyGlow); }
        .ky-bodygraph-svg #ky-astrology-frame { pointer-events:none; }
      </style>
    </svg>`);
    return out;
  }

  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();