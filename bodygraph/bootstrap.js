/* Load the immutable MMI geometry and display-only renderer. */
(function () {
  async function gunzipText(path) {
    const response = await fetch(path, { cache: "force-cache" });
    if (!response.ok) throw new Error("Bodygraph asset unavailable: " + path);
    const compressed = await response.arrayBuffer();
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).text();
  }
  window.KY_BODYGRAPH_READY = Promise.all([
    gunzipText("/bodygraph/mmi-geometry-manifest.json.gz"),
    gunzipText("/bodygraph/know-your-bodygraph-renderer.js.gz"),
    fetch("/bodygraph/appearance.js", { cache: "force-cache" }).then(function (r) {
      if (!r.ok) throw new Error("Bodygraph appearance layer unavailable");
      return r.text();
    })
  ]).then(function (values) {
    window.KY_BODYGRAPH_MANIFEST = JSON.parse(values[0]);
    [values[1], values[2]].forEach(function (source) {
      const script = document.createElement("script");
      script.textContent = source;
      document.head.appendChild(script);
    });
    if (!window.KYBodygraphRenderer) throw new Error("Bodygraph renderer failed to initialise");
    if (!window.KYBodygraphAppearance) throw new Error("Bodygraph appearance failed to initialise");
    window.dispatchEvent(new Event("ky-bodygraph-ready"));
  }).catch(function (error) {
    console.error("Know Yourself Bodygraph could not initialise", error);
    window.KY_BODYGRAPH_ERROR = error;
    window.dispatchEvent(new Event("ky-bodygraph-ready"));
  });
})();
