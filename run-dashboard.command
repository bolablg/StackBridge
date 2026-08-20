#!/bin/zsh

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${STACKBRIDGE_PORT:-${AWS_DEA_DASHBOARD_PORT:-3000}}"
URL="http://127.0.0.1:${PORT}/"

cd "$APP_DIR"
npm run dev -- --hostname 127.0.0.1 --port "$PORT" &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM
for attempt in {1..60}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
open "$URL"
wait "$SERVER_PID"
