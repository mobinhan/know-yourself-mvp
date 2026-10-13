"""Standalone Render entry point for the Know Yourself v1 API.

Keeps the deterministic chart engine and existing request handler unchanged.
Provides a lightweight root health response for Render's HTTP checks.
"""
import json
import os
from http.server import ThreadingHTTPServer

from index import handler


class RenderHandler(handler):
    def _health(self, include_body: bool = True) -> None:
        body = json.dumps({
            "service": "know-yourself-api",
            "status": "ok",
            "api_version": "v1",
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if include_body:
            self.wfile.write(body)

    def do_HEAD(self) -> None:
        if self.path.split("?", 1)[0] in ("/", "/health"):
            self._health(include_body=False)
            return
        self.send_response(404)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] in ("/", "/health"):
            self._health()
            return
        super().do_GET()


def main() -> None:
    port = int(os.environ.get("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), RenderHandler)
    print(f"Know Yourself API listening on 0.0.0.0:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
