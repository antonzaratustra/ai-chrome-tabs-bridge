---
name: chrome-tabs-bridge
description: Use when working with the user's live Chrome tab/window bridge, including cloning the public AI Chrome Tabs Bridge repository, starting the local bridge server, and organizing tabs through the Chrome extension.
---

# Chrome Tabs Bridge

Use this skill when the user wants help with live Chrome tabs, windows, or groups on their Mac.

Repository: `https://github.com/antonzaratustra/ai-chrome-tabs-bridge`

## What this setup is

- Chrome extension reads the live browser state.
- Local bridge process stores state and command queue.
- Codex talks to the bridge over `http://127.0.0.1:8765`.
- Do not rely on raw Chrome profile files for live control.
- The repository can be cloned anywhere; runtime files live outside the repo by default.
- By default, `bridge.py` stores runtime data in `~/.chrome-tabs-bridge`.

## Required pieces

1. Google Chrome is open.
2. The public AI Chrome Tabs Bridge repository is cloned locally from GitHub.
3. The unpacked extension is loaded from the cloned repository folder.
4. The local bridge is running from that clone:
   `python3 bridge.py`

## Fast check

Run:

```bash
curl http://127.0.0.1:8765/health
curl http://127.0.0.1:8765/state
```

If the bridge is offline, start it with:

```bash
python3 bridge.py
```

If Chrome Tabs Bridge is also not responding, reload the unpacked extension at
`chrome://extensions` and then click Refresh and sync in the popup.

If you need a fresh install, clone the repository first:

```bash
git clone https://github.com/antonzaratustra/ai-chrome-tabs-bridge.git
```

Then open Chrome and load the unpacked extension from that clone.

## Working style

- First read the current state from the bridge.
- Propose a grouping plan before moving tabs.
- Prefer grouping inside one window first.
- Keep `New Tab` / inbox tabs as a safe landing zone.
- Avoid creating or closing extra tabs unless the user asks.
- Treat Chrome group collapse as a UI/display concern unless the user explicitly asks to change real Chrome group state.

## Useful bridge actions

- `focus_window`
- `activate_tab`
- `close_tab`
- `create_tab`
- `move_tab`
- `duplicate_tab`
- `reload_tab`
- `pin_tab`
- `unpin_tab`
- `mute_tab`
- `unmute_tab`
- `group_tabs`
- `ungroup_tabs`
- `rename_group`
- `move_group`
- `close_window`

## When helping the user

- Read the latest state before suggesting a structure.
- If the bridge is running but the extension is not, tell the user to reload the unpacked extension.
- If the user wants a one-window setup, consolidate windows only after the internal grouping looks sane.
- Keep the popup UI readable: stacked windows, scrollable long groups, and collapsible display sections.
- Point the user to the localized info icon in the popup header for a quick usage hint; the tooltip text should match the active UI language.
- When the user opens a fresh Codex chat, tell them to enable this skill by name (`chrome-tabs-bridge`) and then ask for live tab management or a grouping plan.
- If the user asks for installation, describe clone -> load unpacked extension -> start `bridge.py` -> click `Refresh and sync`.
