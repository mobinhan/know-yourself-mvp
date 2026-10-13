"""Render entry point for the existing Know Yourself v1 API.

This adapter leaves the API and deterministic engine implementation unchanged.
It only provides a long-running HTTP server and a platform health-check route.
"""
from __future__ import annotations

import os
from http.server import ThreadingHTTPServer

from api.index import handler as ExistingAPIHandler


class RenderAPIHandler(ExistingAPIHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] == "/health":
            return self._send(200, {
                "status": "ok",
                "service": "know-yourself-engine",
                "engine": "ky-hd-engine",
                "engine_version": "1.0.0",
            })
        return super().do_GET()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), RenderAPIHandler)
    print(f"Know Yourself API listening on 0.0.0.0:{port}", flush=True)
    server.serve_forever()
