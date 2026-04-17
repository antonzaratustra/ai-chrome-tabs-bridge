# AI Chrome Tabs Bridge Skill Guide

This repository is a Chrome extension plus a local Python bridge for live tab management.

## Purpose

- Read live Chrome windows, tabs, and tab groups.
- Let an AI agent reorganize tabs through the extension and bridge.
- Keep browser state separate from the repository.

## Setup

1. Clone the repository.
2. Load the unpacked extension from the repo folder in `chrome://extensions`.
3. Start the bridge:

```bash
python3 bridge.py
```

4. Open the popup and click `Refresh and sync`.

## Runtime data

- Bridge state lives outside the repository by default in `~/.chrome-tabs-bridge`.
- Runtime files such as `state.json`, `queue.json`, and `results.jsonl` should not be committed.

## Agent workflow

- Read the latest state before suggesting changes.
- Prefer grouping inside one window first.
- Avoid creating or closing tabs unless the user asks.
- Use the popup only as the live control surface; do not rely on raw Chrome profile files.

## Notes

- The active Codex skill is stored in the user's Codex skills directory.
- This file is the repository-local reference copy for people and tools reading the repo directly.
