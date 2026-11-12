/* Know Yourself — static celestial BodyGraph skin.
   Display-only: the MMI renderer owns all geometry and activations. */
(function () {
  const theme = Object.freeze({
    name: "celestial-atlas",
    layers: Object.freeze(["static-celestial-plate", "centre-materials", "channel-light", "gate-legibility"])
  });

  function defs() {
    return `
      <defs>
        <radialGradient id="kyGemGold"><stop stop-color="#FFF4C4"/><stop offset=".22" stop-color="#F2C45F"/><stop offset=".72" stop-color="#8C5638"/><stop offset="1" stop-color="#352044"/></radialGradient>
        <radialGradient id="kyGemViolet"><stop stop-color="#FFE0FF"/><stop offset=".23" stop-color="#B66DDB"/><stop offset=".72" stop-color="#583778"/><stop offset="1" stop-color="#211B3C"/></radialGradient>
        <radialGradient id="kyGemBlue"><stop stop-color="#E0FFFF"/><stop offset=".22" stop-color="#55A9E8"/><stop offset=".72" stop-color="#29467D"/><stop offset="1" stop-color="#121B38"/></radialGradient>
        <radialGradient id="kyGemRose"><stop stop-color="#FFE0F7"/><stop offset=".24" stop-color="#D17AD8"/><stop offset=".72" stop-color="#713F8B"/><stop offset="1" stop-color="#2C2048"/></radialGradient>
        <filter id="kyGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>`;
  }

  function background() {
    return '<image id="ky-celestial-backdrop" href="/bodygraph/assets/ky-celestial-backdrop.webp" x="-18" y="-18" width="372" height="601" preserveAspectRatio="none"/>';
  }

  function styleCentres(svg) {
    return svg.replace(/<polygon(?=[^>]*stroke="#1E2A44")(?=[^>]*fill="#FFFDF7")([^>]*)\/>/g,
      (tag, attrs) => {
        const points = (attrs.match(/points="([^"]+)"/)||[])[1] || "";
        let gem = "kyGemViolet";
        if (points.includes("138.8,564.7") || points.includes("0,385.7") || points.includes("264.9,427.8")) gem = "kyGemGold";
        else if (points.includes("138.8,245")) gem = "kyGemBlue";
        else if (points.includes("191.4,362.4") || points.includes("138.8,483.2")) gem = "kyGemRose";
        else if (points.includes("126.3,307.4")) gem = "kyGemGold";
        return tag.replace('fill="#FFFDF7"', 'fill="url(#' + gem + ')"')
          .replace('stroke="#1E2A44"', 'stroke="#E8C77F"')
          .replace('stroke-width="1.4"', 'stroke-width="1.8"');
      });
  }

  function apply(svg) {
    if (typeof svg !== "string" || !svg.includes("<svg")) throw new TypeError("Expected an MMI SVG string");
    let out = svg;
    out = out.replace(/<rect x="-18" y="-18" width="372" height="601" rx="14" fill="#FDFAF3" stroke="#D8CDB8" stroke-width="1"\/>/, "");
    const defsEnd = out.indexOf("</defs>");
    if (defsEnd < 0) throw new Error("MMI SVG definitions not found");
    out = out.slice(0, defsEnd + 7) + defs() + background() + out.slice(defsEnd + 7);
    out = styleCentres(out);
    // Preserve pearl underlay; subtle warm-gold edge stays behind activation overlays.
    out = out.replaceAll('fill="#FFFDF7" stroke="none"',
      'fill="#F3E8D1" fill-opacity="0.20" stroke="#E8C77F" stroke-opacity="0.22" stroke-width="0.42"');
    out = out.replaceAll('fill="#A83226"', 'fill="#FF607C"');
    out = out.replaceAll('fill="#15151A"', 'fill="#171321"');
    out = out.replace('<svg ', '<svg class="ky-bodygraph-svg" ');
    out = out.replace("</svg>", `
      <style>
        .ky-bodygraph-svg text { fill:#FFF0D1; paint-order:stroke; stroke:#15142A; stroke-width:.38px; }
        .ky-bodygraph-svg #ky-celestial-backdrop { pointer-events:none; }
        @media (min-width: 601px) {
          .ky-bodygraph-svg polygon[fill="#FF607C"],
          .ky-bodygraph-svg polygon[fill="#171321"],
          .ky-bodygraph-svg polygon[fill^="url(#kySplit)"],
          .ky-bodygraph-svg circle[fill="#C9A86A"] { filter:url(#kyGlow); }
        }
        @media (max-width: 600px) {
          .ky-bodygraph-svg polygon,
          .ky-bodygraph-svg circle,
          .ky-bodygraph-svg text { filter:none !important; }
        }
      </style>
    </svg>`);
    return out;
  }

  window.KYBodygraphAppearance = Object.freeze({ theme, apply });
})();
