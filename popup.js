const summaryEl = document.getElementById("summary");
const treeEl = document.getElementById("tree");
const refreshBtn = document.getElementById("refresh");
const themeToggleBtn = document.getElementById("theme-toggle");
const langEnBtn = document.getElementById("lang-en");
const langRuBtn = document.getElementById("lang-ru");

const BRIDGE_URL = "http://127.0.0.1:8765";
const UI_STATE_KEY = "chrome-tabs-bridge-ui-state";

const I18N = {
  en: {
    eyebrow: "Chrome Tabs Bridge",
    title: "Live access to tabs",
    loading: "Loading...",
    refreshAndSync: "Refresh and sync",
    bridgeOnline: "bridge online",
    bridgeOffline: "bridge offline",
    queued: "queued",
    windows: "windows",
    tabs: "tabs",
    groups: "groups",
    id: "ID",
    window: "Window",
    active: "active",
    pinned: "pinned",
    muted: "muted",
    showWindow: "Show window",
    collapse: "Collapse",
    expand: "Expand",
    open: "open",
    collapsed: "collapsed",
    noActiveWindow: "No active window",
    stateNotLoaded: "State has not been loaded yet. Press “Refresh and sync” or check whether bridge is running.",
    ungrouped: "Ungrouped",
    tabsOutsideGroups: "Tabs outside groups",
    ungroupedInfo: "Tabs that are not grouped yet",
    noTabsOutsideGroups: "No tabs outside groups",
    themeLight: "light",
    themeDark: "dark"
  },
  ru: {
    eyebrow: "Chrome Tabs Bridge",
    title: "Живой доступ к вкладкам",
    loading: "Загрузка...",
    refreshAndSync: "Обновить и синхронизировать",
    bridgeOnline: "мост онлайн",
    bridgeOffline: "мост офлайн",
    queued: "в очереди",
    windows: "окон",
    tabs: "вкладок",
    groups: "групп",
    id: "ID",
    window: "Окно",
    active: "активно",
    pinned: "закреплено",
    muted: "без звука",
    showWindow: "Показать окно",
    collapse: "Свернуть",
    expand: "Развернуть",
    open: "открыто",
    collapsed: "свернуто",
    noActiveWindow: "Нет активного окна",
    stateNotLoaded: "Состояние еще не получено. Нажми «Обновить и синхронизировать» или проверь, запущен ли bridge.",
    ungrouped: "Без группы",
    tabsOutsideGroups: "вкладки вне таб-групп",
    ungroupedInfo: "Вкладки, которые еще не разложены по группам",
    noTabsOutsideGroups: "Нет вкладок вне групп",
    themeLight: "светлая",
    themeDark: "тёмная"
  }
};

let lastState = null;
let uiState = loadUiState();

function currentLang() {
  return I18N[uiState.lang] ? uiState.lang : "en";
}

function currentTheme() {
  return uiState.theme === "dark" ? "dark" : "light";
}

function t(key) {
  const lang = currentLang();
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function translateWindowState(state) {
  const key = String(state || "normal");
  const map = {
    en: {
      normal: "normal",
      minimized: "minimized",
      maximized: "maximized",
      fullscreen: "fullscreen"
    },
    ru: {
      normal: "обычное",
      minimized: "свернутое",
      maximized: "развернутое",
      fullscreen: "полный экран"
    }
  };
  return map[currentLang()][key] || key;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${BRIDGE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  return payload;
}

async function sendCommand(command) {
  return fetchJson("/command", {
    method: "POST",
    body: command
  });
}

function loadUiState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(UI_STATE_KEY) || "{}");
    return {
      activeWindowId: parsed.activeWindowId ?? null,
      collapsedGroups: parsed.collapsedGroups || {},
      lang: parsed.lang === "ru" ? "ru" : "en",
      theme: parsed.theme === "dark" ? "dark" : "light"
    };
  } catch {
    return {
      activeWindowId: null,
      collapsedGroups: {},
      lang: "en",
      theme: "light"
    };
  }
}

function saveUiState() {
  localStorage.setItem(UI_STATE_KEY, JSON.stringify(uiState));
}

function applyPreferences() {
  document.documentElement.lang = currentLang();
  document.documentElement.dataset.theme = currentTheme();

  const eyebrowEl = document.querySelector(".eyebrow");
  const titleEl = document.querySelector("h1");
  if (eyebrowEl) {
    eyebrowEl.textContent = t("eyebrow");
  }
  if (titleEl) {
    titleEl.textContent = t("title");
  }
  if (refreshBtn) {
    refreshBtn.textContent = t("refreshAndSync");
  }
  if (themeToggleBtn) {
    themeToggleBtn.textContent = currentTheme() === "dark" ? t("themeDark") : t("themeLight");
    themeToggleBtn.setAttribute("aria-pressed", currentTheme() === "dark" ? "true" : "false");
  }
  if (langEnBtn && langRuBtn) {
    langEnBtn.classList.toggle("is-active", currentLang() === "en");
    langRuBtn.classList.toggle("is-active", currentLang() === "ru");
  }
  document.title = t("title");
}

function setLang(lang) {
  uiState.lang = lang === "ru" ? "ru" : "en";
  saveUiState();
  applyPreferences();
}

function setTheme(theme) {
  uiState.theme = theme === "dark" ? "dark" : "light";
  saveUiState();
  applyPreferences();
}

function isGroupCollapsed(groupId, defaultCollapsed = false) {
  const key = String(groupId);
  if (key in uiState.collapsedGroups) {
    return Boolean(uiState.collapsedGroups[key]);
  }
  return Boolean(defaultCollapsed);
}

function toggleGroupView(groupId, defaultCollapsed = false) {
  const key = String(groupId);
  uiState.collapsedGroups[key] = !isGroupCollapsed(groupId, defaultCollapsed);
  saveUiState();
}

function selectWindowView(windowId) {
  uiState.activeWindowId = String(windowId);
  saveUiState();
}

function getActiveWindowId(windows) {
  const stored = uiState.activeWindowId == null ? null : String(uiState.activeWindowId);
  if (stored && windows.some((window) => String(window.id) === stored)) {
    return stored;
  }

  const focusedWindow = windows.find((window) => window.focused);
  const fallbackWindowId = focusedWindow?.id ?? windows[0]?.id ?? null;
  const nextWindowId = fallbackWindowId == null ? null : String(fallbackWindowId);

  if (nextWindowId !== stored) {
    uiState.activeWindowId = nextWindowId;
    saveUiState();
  }

  return nextWindowId;
}

function groupTabsByWindow(window) {
  const groups = new Map();
  const ungrouped = [];

  for (const tab of window.tabs || []) {
    if (tab.groupId !== -1) {
      if (!groups.has(tab.groupId)) {
        groups.set(tab.groupId, {
          id: tab.groupId,
          title: tab.groupTitle || "(без названия)",
          color: tab.groupColor || "unknown",
          collapsed: Boolean(tab.groupCollapsed),
          tabs: []
        });
      }

      const group = groups.get(tab.groupId);
      group.collapsed = Boolean(group.collapsed || tab.groupCollapsed);
      group.tabs.push(tab);
    } else {
      ungrouped.push(tab);
    }
  }

  const sortedGroups = [...groups.values()].sort((a, b) => {
    const aIndex = Math.min(...a.tabs.map((tab) => tab.index));
    const bIndex = Math.min(...b.tabs.map((tab) => tab.index));
    return aIndex - bIndex;
  });

  return { groups: sortedGroups, ungrouped };
}

function renderTab(tab) {
  const stateBits = [];
  if (tab.active) stateBits.push(t("active"));
  if (tab.pinned) stateBits.push(t("pinned"));
  if (tab.muted) stateBits.push(t("muted"));

  return `
    <button
      type="button"
      class="tab tab-button"
      data-action="activate-tab"
      data-tab-id="${escapeHtml(tab.id)}"
      title="${escapeHtml(tab.title)}"
    >
      <div class="tab-icon" aria-hidden="true"></div>
      <div class="tab-main">
        <div class="tab-title">${escapeHtml(tab.title)}</div>
        <div class="tab-url">${escapeHtml(tab.host)} · ${escapeHtml(tab.url)}</div>
      </div>
      <div class="tab-state">${escapeHtml(stateBits.join(" · "))}</div>
    </button>
  `;
}

function renderWindowTab(window, index, active) {
  const { groups, ungrouped } = groupTabsByWindow(window);
  const tabCount = window.tabs?.length || 0;
  const groupCount = groups.length + (ungrouped.length ? 1 : 0);

  return `
    <button
      type="button"
      class="window-tab ${active ? "is-active" : ""}"
      data-action="select-window"
      data-window-id="${escapeHtml(window.id)}"
      aria-pressed="${active ? "true" : "false"}"
      title="${escapeHtml(t("window"))} ${index + 1}"
    >
      <div class="window-tab-title">${escapeHtml(t("window"))} ${index + 1}${window.focused ? ` · ${escapeHtml(t("active"))}` : ""}</div>
      <div class="window-tab-meta">
        <span>${escapeHtml(tabCount)} ${escapeHtml(t("tabs"))}</span>
        <span>${escapeHtml(groupCount)} ${escapeHtml(t("groups"))}</span>
        <span>${escapeHtml(t("id"))} ${escapeHtml(window.id)}</span>
      </div>
    </button>
  `;
}

function renderGroup(group) {
  const collapsed = isGroupCollapsed(group.id, group.collapsed);
  const tabsHtml = collapsed
    ? ""
    : `
      <div class="group-body">
        <div class="tab-list">
          ${group.tabs.map((tab) => renderTab(tab)).join("")}
        </div>
      </div>
    `;

  return `
    <section class="group ${collapsed ? "is-collapsed" : ""}" data-group-id="${escapeHtml(group.id)}">
      <div class="group-head">
        <div class="group-head-main">
          <span class="badge">${escapeHtml(group.tabs.length)}</span>
          <span class="group-name">${escapeHtml(group.title)}</span>
          <span class="badge badge-color">${escapeHtml(group.color)}</span>
          <span class="group-state">${collapsed ? t("collapsed") : t("open")}</span>
        </div>
        <div class="group-actions">
          <button
            type="button"
            class="ghost"
            data-action="toggle-group-view"
            data-group-id="${escapeHtml(group.id)}"
            data-default-collapsed="${group.collapsed ? "true" : "false"}"
          >${collapsed ? t("expand") : t("collapse")}</button>
        </div>
      </div>
      <div class="group-info">${escapeHtml(t("id"))} ${escapeHtml(group.id)}</div>
      ${tabsHtml}
    </section>
  `;
}

function renderWindowPanel(window, index) {
  const { groups, ungrouped } = groupTabsByWindow(window);
  const groupsHtml = groups.map((group) => renderGroup(group)).join("");
  const ungroupedHtml = ungrouped.length
    ? `
    <section class="group ungrouped">
        <div class="group-head">
          <div class="group-head-main">
            <span class="badge">${escapeHtml(ungrouped.length)}</span>
            <span class="group-name">${escapeHtml(t("ungrouped"))}</span>
            <span class="group-state">${escapeHtml(t("tabsOutsideGroups"))}</span>
          </div>
        </div>
        <div class="group-info">${escapeHtml(t("ungroupedInfo"))}</div>
        <div class="group-body">
          <div class="tab-list">
            ${ungrouped.map((tab) => renderTab(tab)).join("")}
          </div>
        </div>
      </section>
    `
    : "";

  return `
    <article class="window" data-window-id="${escapeHtml(window.id)}">
      <div class="window-head">
        <div class="window-head-main">
          <div class="window-title">${escapeHtml(t("window"))} ${index + 1}${window.focused ? ` · ${escapeHtml(t("active"))}` : ""}</div>
          <div class="window-meta">
            ${escapeHtml(translateWindowState(window.state || "normal"))} · ${escapeHtml(t("id"))} ${escapeHtml(window.id)} · ${escapeHtml(window.tabs?.length || 0)} ${escapeHtml(t("tabs"))}
          </div>
        </div>
        <div class="window-actions">
          <button
            type="button"
            class="ghost"
            data-action="focus-window"
            data-window-id="${escapeHtml(window.id)}"
          >${escapeHtml(t("showWindow"))}</button>
        </div>
      </div>
      <div class="window-body">
      ${groupsHtml || ""}
        ${ungroupedHtml || `<div class="empty">${escapeHtml(t("noTabsOutsideGroups"))}</div>`}
      </div>
    </article>
  `;
}

function renderState(state) {
  const windowCount = state?.windowCount || 0;
  const tabCount = state?.tabCount || 0;
  const groupCount = new Set(
    (state?.windows || [])
      .flatMap((window) => (window.tabs || []).filter((tab) => tab.groupId !== -1).map((tab) => tab.groupId))
  ).size;

  summaryEl.innerHTML = `<span class="bridge-status">${windowCount} ${escapeHtml(t("windows"))} · ${tabCount} ${escapeHtml(t("tabs"))} · ${groupCount} ${escapeHtml(t("groups"))}</span>`;

  const windows = state?.windows || [];
  const activeWindowId = getActiveWindowId(windows);
  const activeWindowIndex = activeWindowId == null
    ? -1
    : windows.findIndex((window) => String(window.id) === activeWindowId);
  const activeWindow = activeWindowIndex >= 0 ? windows[activeWindowIndex] : null;

  treeEl.innerHTML = windows.length
    ? `
      <section class="window-tabs" aria-label="Окна Chrome">
        ${windows.map((window, index) => renderWindowTab(window, index, String(window.id) === activeWindowId)).join("")}
      </section>
      ${activeWindow ? renderWindowPanel(activeWindow, activeWindowIndex) : `<div class="notice">${escapeHtml(t("noActiveWindow"))}</div>`}
    `
    : `<div class="notice">${escapeHtml(t("stateNotLoaded"))}</div>`;
}

async function loadState() {
  const state = await fetchJson("/state");
  lastState = state;
  renderState(state);
}

async function refresh() {
  try {
    const health = await fetchJson("/health");
    summaryEl.innerHTML = `<span class="bridge-status">${escapeHtml(t("bridgeOnline"))} · ${escapeHtml(t("queued"))} ${health.queued}</span>`;
  } catch (error) {
    summaryEl.innerHTML = `<span class="bridge-status">${escapeHtml(t("bridgeOffline"))} · ${escapeHtml(error.message || String(error))}</span>`;
  }

  try {
    await loadState();
  } catch (error) {
    treeEl.innerHTML = `<div class="notice">${escapeHtml(error.message || String(error))}</div>`;
  }
}

async function syncNow() {
  const result = await chrome.runtime.sendMessage({ type: "BRIDGE_SYNC_NOW" });
  if (!result?.ok) {
    throw new Error(result?.error || "Sync failed");
  }
}

async function refreshAndSync() {
  await syncNow();
  await refresh();
}

function canScrollElement(element, deltaY) {
  if (!element) {
    return false;
  }

  const maxScrollTop = element.scrollHeight - element.clientHeight;
  if (maxScrollTop <= 0) {
    return false;
  }

  if (deltaY > 0) {
    return element.scrollTop < maxScrollTop - 1;
  }

  if (deltaY < 0) {
    return element.scrollTop > 0;
  }

  return false;
}

function scrollPage(deltaY) {
  if (deltaY === 0) {
    return;
  }

  window.scrollBy({ top: deltaY, left: 0, behavior: "auto" });
}

document.addEventListener(
  "wheel",
  (event) => {
    const deltaY = event.deltaY;
    const innerScrollable = event.target.closest(".window-body, .group-body");

    if (innerScrollable && canScrollElement(innerScrollable, deltaY)) {
      return;
    }

    event.preventDefault();
    scrollPage(deltaY);
  },
  { passive: false, capture: true }
);

treeEl.addEventListener("click", async (event) => {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) {
    return;
  }

  const action = actionEl.dataset.action;

  try {
    switch (action) {
      case "select-window":
        selectWindowView(Number(actionEl.dataset.windowId));
        if (lastState) {
          renderState(lastState);
        } else {
          await loadState();
        }
        return;
      case "focus-window":
        await sendCommand({
          action: "focus_window",
          windowId: Number(actionEl.dataset.windowId)
        });
        break;
      case "activate-tab":
        await sendCommand({
          action: "activate_tab",
          tabId: Number(actionEl.dataset.tabId)
        });
        break;
      case "toggle-group-view":
        toggleGroupView(
          Number(actionEl.dataset.groupId),
          actionEl.dataset.defaultCollapsed === "true"
        );
        renderState(lastState);
        return;
      default:
        return;
    }

    await refresh();
  } catch (error) {
    treeEl.innerHTML = `<div class="notice">${escapeHtml(error.message || String(error))}</div>`;
  }
});

refreshBtn.addEventListener("click", () => {
  refreshAndSync().catch((error) => {
    treeEl.innerHTML = `<div class="notice">${escapeHtml(error.message || String(error))}</div>`;
  });
});

themeToggleBtn.addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
  if (lastState) {
    renderState(lastState);
  }
});

langEnBtn.addEventListener("click", () => {
  setLang("en");
  if (lastState) {
    renderState(lastState);
  }
});

langRuBtn.addEventListener("click", () => {
  setLang("ru");
  if (lastState) {
    renderState(lastState);
  }
});

applyPreferences();

refresh().catch((error) => {
  treeEl.innerHTML = `<div class="notice">${escapeHtml(error.message || String(error))}</div>`;
});
