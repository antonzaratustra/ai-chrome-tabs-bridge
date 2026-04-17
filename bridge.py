#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import threading
import time
from collections import deque
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()) + ".000Z"


class BridgeStore:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.state_path = root / "state.json"
        self.queue_path = root / "queue.json"
        self.results_path = root / "results.jsonl"
        self._lock = threading.Lock()
        self._state: dict[str, Any] | None = None
        self._queue: deque[dict[str, Any]] = deque()
        self._next_id = 1
        self._load()

    def _load(self) -> None:
        if self.state_path.exists():
            try:
                self._state = json.loads(self.state_path.read_text())
            except Exception:
                self._state = None

        if self.queue_path.exists():
            try:
                queued = json.loads(self.queue_path.read_text())
                for item in queued:
                    self._queue.append(item)
                    self._next_id = max(self._next_id, int(item.get("id", 0)) + 1)
            except Exception:
                self._queue.clear()

    def _save_queue(self) -> None:
        self.queue_path.write_text(json.dumps(list(self._queue), indent=2, ensure_ascii=False))

    def set_state(self, state: dict[str, Any] | None) -> None:
        with self._lock:
            self._state = state
            if state is None:
                if self.state_path.exists():
                    self.state_path.unlink()
            else:
                self.state_path.write_text(json.dumps(state, indent=2, ensure_ascii=False))

    def get_state(self) -> dict[str, Any] | None:
        with self._lock:
            return self._state

    def enqueue(self, command: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            item = {
                "id": self._next_id,
                "queuedAt": now_iso(),
                **command,
            }
            self._next_id += 1
            self._queue.append(item)
            self._save_queue()
            return item

    def next_command(self) -> dict[str, Any] | None:
        with self._lock:
            if not self._queue:
                return None
            item = self._queue.popleft()
            self._save_queue()
            return item

    def queue(self) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._queue)

    def append_result(self, result: dict[str, Any]) -> None:
        with self._lock:
            with self.results_path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(result, ensure_ascii=False) + "\n")


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: Any) -> None:
  body = json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
  handler.send_response(status)
  handler.send_header("Content-Type", "application/json; charset=utf-8")
  handler.send_header("Content-Length", str(len(body)))
  handler.send_header("Access-Control-Allow-Origin", "*")
  handler.send_header("Access-Control-Allow-Headers", "Content-Type")
  handler.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
  handler.end_headers()
  handler.wfile.write(body)


class BridgeHandler(BaseHTTPRequestHandler):
  server_version = "ChromeTabsBridge/1.0"

  @property
  def store(self) -> BridgeStore:
    return self.server.store  # type: ignore[attr-defined]

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    self.end_headers()

  def do_GET(self) -> None:
    if self.path in {"/", "/health"}:
      json_response(self, HTTPStatus.OK, {
        "ok": True,
        "timestamp": now_iso(),
        "queued": len(self.store.queue()),
        "hasState": self.store.get_state() is not None,
      })
      return

    if self.path == "/state":
      state = self.store.get_state()
      if state is None:
        json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "No state yet"})
      else:
        json_response(self, HTTPStatus.OK, state)
      return

    if self.path == "/next-command":
      command = self.store.next_command()
      json_response(self, HTTPStatus.OK, {"ok": True, "command": command})
      return

    if self.path == "/queue":
      json_response(self, HTTPStatus.OK, {"ok": True, "queue": self.store.queue()})
      return

    json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})

  def do_POST(self) -> None:
    length = int(self.headers.get("Content-Length", "0"))
    raw = self.rfile.read(length) if length else b"{}"
    try:
      payload = json.loads(raw.decode("utf-8") or "{}")
    except Exception as exc:
      json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
      return

    if self.path == "/state":
      self.store.set_state(payload)
      json_response(self, HTTPStatus.OK, {"ok": True})
      return

    if self.path == "/command":
      command = self.store.enqueue(payload)
      json_response(self, HTTPStatus.OK, {"ok": True, "command": command})
      return

    if self.path == "/result":
      self.store.append_result({
        "receivedAt": now_iso(),
        **payload,
      })
      json_response(self, HTTPStatus.OK, {"ok": True})
      return

    if self.path == "/clear":
      self.store.set_state(None)
      json_response(self, HTTPStatus.OK, {"ok": True})
      return

    json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})

  def log_message(self, fmt: str, *args: Any) -> None:
    return


def main() -> int:
  parser = argparse.ArgumentParser(description="Chrome tabs bridge server")
  parser.add_argument("--host", default="127.0.0.1")
  parser.add_argument("--port", type=int, default=8765)
  parser.add_argument(
    "--root",
    default=str(Path.home() / ".chrome-tabs-bridge"),
    help="Directory used to persist bridge state, queued commands, and results.",
  )
  args = parser.parse_args()

  root = Path(args.root).resolve()
  root.mkdir(parents=True, exist_ok=True)

  store = BridgeStore(root)
  server = ThreadingHTTPServer((args.host, args.port), BridgeHandler)
  server.store = store  # type: ignore[attr-defined]

  print(f"Chrome tabs bridge listening on http://{args.host}:{args.port}")
  print(f"State file: {store.state_path}")
  print(f"Queue file: {store.queue_path}")
  print("Press Ctrl+C to stop.")

  try:
    server.serve_forever()
  except KeyboardInterrupt:
    pass
  finally:
    server.server_close()
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
