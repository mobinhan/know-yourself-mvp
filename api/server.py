"""Standalone Render entry point for the Know Yourself v1 API.

Keeps the deterministic chart engine and existing request handler unchanged.
"""
import os
from http.server import ThreadingHTTPServer

from index import handler


def main() -> None:
    port = int(os.environ.get("PORT", "10000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), handler)
    print(f"Know Yourself API listening on 0.0.0.0:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
