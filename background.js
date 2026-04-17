const BRIDGE_URL = "http://127.0.0.1:8765";
const OFFSCREEN_PATH = "offscreen.html";
const BRIDGE_ALARM = "bridge-sync";
const OFFSCREEN_POLL_MS = 2000;

let creatingOffscreen = null;
let syncInFlight = null;

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  );
}

function normalizeUrl(tab) {
  return tab.url || tab.pendingUrl || "";
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname || "unknown";
  } catch {
    return "unknown";
  }
}

async function ensureOffscreenDocument() {
  if (!chrome.offscreen || !chrome.runtime.getContexts) {
    return;
  }

  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen.createDocument({
      url: OFFSCREEN_PATH,
      reasons: ["WORKERS"],
      justification: "Keep the local Chrome tab bridge alive and synchronized."
    });
  }

  await creatingOffscreen;
  creatingOffscreen = null;
}

async function fetchJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 3000);

  try {
    const response = await fetch(`${BRIDGE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(payload?.error || `Bridge request failed: ${response.status}`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function postJson(path, body) {
  return fetchJson(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

async function collectState() {
  const windows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ["normal"]
  });

  const snapshot = [];

  for (const window of windows) {
    const groups = await chrome.tabGroups.query({ windowId: window.id });
    const groupMap = new Map(groups.map((group) => [group.id, group]));
    const tabs = [];

    for (const tab of window.tabs || []) {
      const url = normalizeUrl(tab);
      const group = tab.groupId !== -1 ? groupMap.get(tab.groupId) : null;

      tabs.push({
        id: tab.id,
        index: tab.index,
        active: tab.active,
        audible: tab.audible || false,
        pinned: tab.pinned || false,
        highlighted: tab.highlighted || false,
        discarded: tab.discarded || false,
        incognito: tab.incognito || false,
        groupId: tab.groupId,
        title: tab.title || "(без названия)",
        url,
        host: hostFromUrl(url),
        favIconUrl: tab.favIconUrl || "",
        groupTitle: group?.title || "",
        groupColor: group?.color || "",
        groupCollapsed: group?.collapsed || false,
        muted: tab.mutedInfo?.muted || false
      });
    }

    snapshot.push({
      id: window.id,
      focused: window.focused,
      state: window.state,
      incognito: window.incognito,
      type: window.type,
      left: window.left,
      top: window.top,
      width: window.width,
      height: window.height,
      tabs
    });
  }

  return {
    capturedAt: new Date().toISOString(),
    windowCount: snapshot.length,
    tabCount: snapshot.reduce((sum, window) => sum + window.tabs.length, 0),
    windows: snapshot
  };
}

async function executeCommand(command) {
  const action = command?.action;
  const result = { action, commandId: command?.id || null };

  switch (action) {
    case "focus_window": {
      const windowId = command.windowId ?? (await chrome.windows.getLastFocused()).id;
      await chrome.windows.update(windowId, { focused: true });
      result.windowId = windowId;
      break;
    }
    case "activate_tab": {
      const tab = await chrome.tabs.get(command.tabId);
      await chrome.tabs.update(command.tabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      result.tabId = command.tabId;
      result.windowId = tab.windowId;
      break;
    }
    case "close_tab": {
      await chrome.tabs.remove(command.tabId);
      result.tabId = command.tabId;
      break;
    }
    case "create_tab": {
      const created = await chrome.tabs.create(compactObject({
        windowId: command.windowId,
        index: command.index,
        url: command.url || "chrome://newtab",
        active: command.active !== false
      }));
      result.tabId = created.id;
      result.windowId = created.windowId;
      break;
    }
    case "move_tab": {
      await chrome.tabs.move(command.tabId, compactObject({
        windowId: command.windowId,
        index: command.index
      }));
      result.tabId = command.tabId;
      break;
    }
    case "duplicate_tab": {
      const duplicated = await chrome.tabs.duplicate(command.tabId);
      result.tabId = duplicated?.id || null;
      break;
    }
    case "reload_tab": {
      await chrome.tabs.reload(command.tabId, {
        bypassCache: Boolean(command.bypassCache)
      });
      result.tabId = command.tabId;
      break;
    }
    case "pin_tab": {
      await chrome.tabs.update(command.tabId, { pinned: true });
      result.tabId = command.tabId;
      break;
    }
    case "unpin_tab": {
      await chrome.tabs.update(command.tabId, { pinned: false });
      result.tabId = command.tabId;
      break;
    }
    case "mute_tab": {
      await chrome.tabs.update(command.tabId, { muted: true });
      result.tabId = command.tabId;
      break;
    }
    case "unmute_tab": {
      await chrome.tabs.update(command.tabId, { muted: false });
      result.tabId = command.tabId;
      break;
    }
    case "group_tabs": {
      const tabIds = Array.isArray(command.tabIds) ? command.tabIds : [command.tabId].filter(Boolean);
      if (!tabIds.length) {
        throw new Error("group_tabs requires tabIds or tabId");
      }
      const groupId = await chrome.tabs.group(compactObject({
        groupId: command.groupId,
        tabIds
      }));
      const updatedGroup = await chrome.tabGroups.update(groupId, compactObject({
        title: command.title,
        color: command.color,
        collapsed: command.collapsed
      }));
      result.groupId = updatedGroup.id;
      result.tabIds = tabIds;
      break;
    }
    case "ungroup_tabs": {
      const tabIds = Array.isArray(command.tabIds) ? command.tabIds : [command.tabId].filter(Boolean);
      if (!tabIds.length) {
        throw new Error("ungroup_tabs requires tabIds or tabId");
      }
      await chrome.tabs.ungroup(tabIds);
      result.tabIds = tabIds;
      break;
    }
    case "rename_group": {
      const updatedGroup = await chrome.tabGroups.update(command.groupId, compactObject({
        title: command.title,
        color: command.color,
        collapsed: command.collapsed
      }));
      result.groupId = updatedGroup.id;
      break;
    }
    case "set_group_collapsed": {
      const updatedGroup = await chrome.tabGroups.update(command.groupId, {
        collapsed: Boolean(command.collapsed)
      });
      result.groupId = updatedGroup.id;
      result.collapsed = updatedGroup.collapsed;
      break;
    }
    case "move_group": {
      const movedGroup = await chrome.tabGroups.move(command.groupId, compactObject({
        windowId: command.windowId,
        index: command.index
      }));
      result.groupId = movedGroup?.id || command.groupId;
      break;
    }
    case "close_window": {
      await chrome.windows.remove(command.windowId);
      result.windowId = command.windowId;
      break;
    }
    default:
      throw new Error(`Unsupported action: ${action}`);
  }

  return result;
}

async function syncOnce() {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    await ensureOffscreenDocument();

    const state = await collectState();
    await postJson("/state", state);

    const processed = [];
    for (let i = 0; i < 20; i += 1) {
      const next = await fetchJson("/next-command", { method: "GET" });
      if (!next?.command) {
        break;
      }

      const command = next.command;
      try {
        const result = await executeCommand(command);
        await postJson("/result", {
          commandId: command.id || null,
          ok: true,
          result,
          executedAt: new Date().toISOString()
        });
        processed.push({ id: command.id || null, action: command.action, ok: true });
      } catch (error) {
        const failure = {
          commandId: command.id || null,
          ok: false,
          error: error?.message || String(error),
          executedAt: new Date().toISOString()
        };
        await postJson("/result", failure);
        processed.push({ id: command.id || null, action: command.action, ok: false, error: failure.error });
      }
    }

    return {
      capturedAt: state.capturedAt,
      windows: state.windowCount,
      tabs: state.tabCount,
      processed
    };
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(BRIDGE_ALARM, { periodInMinutes: 0.5 });
  syncOnce().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(BRIDGE_ALARM, { periodInMinutes: 0.5 });
  syncOnce().catch(() => {});
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === BRIDGE_ALARM) {
    syncOnce().catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "BRIDGE_POLL") {
    syncOnce()
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
    return true;
  }

  if (message?.type === "BRIDGE_SYNC_NOW") {
    syncOnce()
      .then((result) => sendResponse({ ok: true, ...result }))
      .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));
    return true;
  }

  return false;
});
