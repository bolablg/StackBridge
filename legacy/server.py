#!/usr/bin/env python3
"""Legacy local server with file-backed progress persistence.

The legacy dashboard is a static frontend. This tiny server only adds two local
endpoints so the browser can read and write progress.json beside the fallback.
It never calls an external service.
"""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
PROGRESS_FILE = APP_DIR / "progress.json"
API_PATH = f"/{APP_DIR.name}/api/progress"
CONFIG_PATH = f"/{APP_DIR.name}/api/config"


class DashboardHandler(SimpleHTTPRequestHandler):
    """Serve the project and persist only the dashboard's JSON state."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def _is_progress_endpoint(self) -> bool:
        return urlsplit(self.path).path.rstrip("/") == API_PATH.rstrip("/")

    def _is_config_endpoint(self) -> bool:
        return urlsplit(self.path).path.rstrip("/") == CONFIG_PATH.rstrip("/")

    def _send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Progress-Storage", "file")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - stdlib handler API
        if self._is_config_endpoint():
            return self._send_json({"clerkPublishableKey": None, "clerkFrontendApiUrl": None})
        if not self._is_progress_endpoint():
            return super().do_GET()

        if not PROGRESS_FILE.exists():
            return self._send_json(None)

        try:
            payload = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            return self._send_json({"error": f"Could not read progress file: {exc}"}, 500)
        return self._send_json(payload)

    def do_PUT(self) -> None:  # noqa: N802 - stdlib handler API
        if not self._is_progress_endpoint():
            self.send_error(405, "Only the progress endpoint accepts PUT")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_error(400, "Invalid Content-Length")
            return

        if content_length <= 0 or content_length > 2_000_000:
            self.send_error(413, "Progress payload is empty or too large")
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            self.send_error(400, f"Invalid JSON: {exc}")
            return

        if not isinstance(payload, dict) or "weekStatus" not in payload:
            self.send_error(400, "Expected dashboard state with weekStatus")
            return

        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=APP_DIR,
                prefix=".progress-",
                suffix=".tmp",
                delete=False,
            ) as temporary:
                json.dump(payload, temporary, ensure_ascii=False, indent=2)
                temporary.write("\n")
                temporary.flush()
                os.fsync(temporary.fileno())
                temporary_path = Path(temporary.name)
            os.replace(temporary_path, PROGRESS_FILE)
        except OSError as exc:
            if temporary_path:
                temporary_path.unlink(missing_ok=True)
            self.send_error(500, f"Could not write progress file: {exc}")
            return

        self._send_json({"ok": True, "file": str(PROGRESS_FILE.name)})

    def log_message(self, format: str, *args: object) -> None:
        # Keep the launcher readable while still logging API errors and writes.
        if "api/progress" in self.path or (args and str(args[1]) not in {"200", "304"}):
            super().log_message(format, *args)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the StackBridge local learning dashboard.")
    parser.add_argument("--host", default="127.0.0.1", help="Bind address (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8765, help="Port (default: 8765)")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    print(f"StackBridge dashboard: http://{args.host}:{args.port}/{APP_DIR.name}/")
    print(f"Progress file: {PROGRESS_FILE}")
    print("Press Ctrl-C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping dashboard server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
