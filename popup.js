const summaryEl = document.getElementById("summary");
const treeEl = document.getElementById("tree");
const refreshBtn = document.getElementById("refresh");
const themeToggleBtn = document.getElementById("theme-toggle");
const langToggleBtn = document.getElementById("lang-toggle");
const langMenu = document.getElementById("lang-menu");
const switchRowEl = document.querySelector(".switch-row");

const BRIDGE_URL = "http://127.0.0.1:8765";
const UI_STATE_KEY = "chrome-tabs-bridge-ui-state";

const I18N = {
  en: {
    eyebrow: "AI Chrome Tabs Bridge",
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
    themeDark: "dark",
    preferences: "Preferences",
    languageOptions: "Language options",
    chromeWindows: "Chrome windows"
  },
  ru: {
    eyebrow: "AI Chrome Tabs Bridge",
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
    themeDark: "тёмная",
    preferences: "Настройки",
    languageOptions: "Языки",
    chromeWindows: "Окна Chrome"
  },
  es: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "Acceso en vivo a pestañas",
    loading: "Cargando...",
    refreshAndSync: "Actualizar y sincronizar",
    bridgeOnline: "puente en línea",
    bridgeOffline: "puente fuera de línea",
    queued: "en cola",
    windows: "ventanas",
    tabs: "pestañas",
    groups: "grupos",
    id: "ID",
    window: "Ventana",
    active: "activa",
    pinned: "fijada",
    muted: "silenciada",
    showWindow: "Mostrar ventana",
    collapse: "Contraer",
    expand: "Expandir",
    open: "abierta",
    collapsed: "contraída",
    noActiveWindow: "No hay ventana activa",
    stateNotLoaded: "Aún no se cargó el estado. Pulsa «Actualizar y sincronizar» o comprueba si el bridge está en ejecución.",
    ungrouped: "Sin grupo",
    tabsOutsideGroups: "pestañas fuera de grupos",
    ungroupedInfo: "Pestañas que todavía no están agrupadas",
    noTabsOutsideGroups: "No hay pestañas fuera de grupos",
    themeLight: "claro",
    themeDark: "oscuro",
    preferences: "Preferencias",
    languageOptions: "Idiomas",
    chromeWindows: "Ventanas de Chrome"
  },
  fr: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "Accès en direct aux onglets",
    loading: "Chargement...",
    refreshAndSync: "Actualiser et synchroniser",
    bridgeOnline: "pont en ligne",
    bridgeOffline: "pont hors ligne",
    queued: "en file",
    windows: "fenêtres",
    tabs: "onglets",
    groups: "groupes",
    id: "ID",
    window: "Fenêtre",
    active: "active",
    pinned: "épinglée",
    muted: "muette",
    showWindow: "Afficher la fenêtre",
    collapse: "Réduire",
    expand: "Développer",
    open: "ouverte",
    collapsed: "réduite",
    noActiveWindow: "Aucune fenêtre active",
    stateNotLoaded: "L’état n’a pas encore été chargé. Appuie sur « Actualiser et synchroniser » ou vérifie que le bridge est en cours d’exécution.",
    ungrouped: "Sans groupe",
    tabsOutsideGroups: "onglets hors groupes",
    ungroupedInfo: "Onglets qui ne sont pas encore groupés",
    noTabsOutsideGroups: "Aucun onglet hors groupe",
    themeLight: "clair",
    themeDark: "sombre",
    preferences: "Préférences",
    languageOptions: "Langues",
    chromeWindows: "Fenêtres Chrome"
  },
  de: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "Live-Zugriff auf Tabs",
    loading: "Lädt...",
    refreshAndSync: "Aktualisieren und synchronisieren",
    bridgeOnline: "Bridge online",
    bridgeOffline: "Bridge offline",
    queued: "in Warteschlange",
    windows: "Fenster",
    tabs: "Tabs",
    groups: "Gruppen",
    id: "ID",
    window: "Fenster",
    active: "aktiv",
    pinned: "angeheftet",
    muted: "stumm",
    showWindow: "Fenster anzeigen",
    collapse: "Einklappen",
    expand: "Ausklappen",
    open: "geöffnet",
    collapsed: "eingeklappt",
    noActiveWindow: "Kein aktives Fenster",
    stateNotLoaded: "Der Zustand wurde noch nicht geladen. Drücke „Aktualisieren und synchronisieren“ oder prüfe, ob der Bridge läuft.",
    ungrouped: "Ohne Gruppe",
    tabsOutsideGroups: "Tabs außerhalb von Gruppen",
    ungroupedInfo: "Tabs, die noch nicht gruppiert sind",
    noTabsOutsideGroups: "Keine Tabs außerhalb von Gruppen",
    themeLight: "hell",
    themeDark: "dunkel",
    preferences: "Einstellungen",
    languageOptions: "Sprachen",
    chromeWindows: "Chrome-Fenster"
  },
  pt: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "Acesso ao vivo às abas",
    loading: "Carregando...",
    refreshAndSync: "Atualizar e sincronizar",
    bridgeOnline: "bridge online",
    bridgeOffline: "bridge offline",
    queued: "na fila",
    windows: "janelas",
    tabs: "abas",
    groups: "grupos",
    id: "ID",
    window: "Janela",
    active: "ativa",
    pinned: "fixada",
    muted: "silenciada",
    showWindow: "Mostrar janela",
    collapse: "Recolher",
    expand: "Expandir",
    open: "aberta",
    collapsed: "recolhida",
    noActiveWindow: "Nenhuma janela ativa",
    stateNotLoaded: "O estado ainda não foi carregado. Clique em «Atualizar e sincronizar» ou verifique se o bridge está em execução.",
    ungrouped: "Sem grupo",
    tabsOutsideGroups: "abas fora de grupos",
    ungroupedInfo: "Abas que ainda não foram agrupadas",
    noTabsOutsideGroups: "Nenhuma aba fora de grupos",
    themeLight: "claro",
    themeDark: "escuro",
    preferences: "Preferências",
    languageOptions: "Idiomas",
    chromeWindows: "Janelas do Chrome"
  },
  it: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "Accesso live alle schede",
    loading: "Caricamento...",
    refreshAndSync: "Aggiorna e sincronizza",
    bridgeOnline: "bridge online",
    bridgeOffline: "bridge offline",
    queued: "in coda",
    windows: "finestre",
    tabs: "schede",
    groups: "gruppi",
    id: "ID",
    window: "Finestra",
    active: "attiva",
    pinned: "bloccata",
    muted: "silenziosa",
    showWindow: "Mostra finestra",
    collapse: "Comprimi",
    expand: "Espandi",
    open: "aperta",
    collapsed: "compressa",
    noActiveWindow: "Nessuna finestra attiva",
    stateNotLoaded: "Lo stato non è ancora stato caricato. Premi «Aggiorna e sincronizza» o controlla se il bridge è in esecuzione.",
    ungrouped: "Senza gruppo",
    tabsOutsideGroups: "schede fuori dai gruppi",
    ungroupedInfo: "Schede che non sono ancora raggruppate",
    noTabsOutsideGroups: "Nessuna scheda fuori dai gruppi",
    themeLight: "chiaro",
    themeDark: "scuro",
    preferences: "Preferenze",
    languageOptions: "Lingue",
    chromeWindows: "Finestre di Chrome"
  },
  ja: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "タブへのライブアクセス",
    loading: "読み込み中...",
    refreshAndSync: "更新して同期",
    bridgeOnline: "bridge オンライン",
    bridgeOffline: "bridge オフライン",
    queued: "キュー中",
    windows: "ウィンドウ",
    tabs: "タブ",
    groups: "グループ",
    id: "ID",
    window: "ウィンドウ",
    active: "アクティブ",
    pinned: "固定",
    muted: "ミュート",
    showWindow: "ウィンドウを表示",
    collapse: "折りたたむ",
    expand: "展開",
    open: "開いている",
    collapsed: "折りたたみ",
    noActiveWindow: "アクティブなウィンドウがありません",
    stateNotLoaded: "状態はまだ読み込まれていません。「更新して同期」を押すか、bridge が動作しているか確認してください。",
    ungrouped: "グループなし",
    tabsOutsideGroups: "グループ外のタブ",
    ungroupedInfo: "まだグループ化されていないタブ",
    noTabsOutsideGroups: "グループ外のタブはありません",
    themeLight: "ライト",
    themeDark: "ダーク",
    preferences: "設定",
    languageOptions: "言語",
    chromeWindows: "Chrome ウィンドウ"
  },
  ko: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "탭 실시간 접근",
    loading: "불러오는 중...",
    refreshAndSync: "새로고침 및 동기화",
    bridgeOnline: "브리지 온라인",
    bridgeOffline: "브리지 오프라인",
    queued: "대기 중",
    windows: "창",
    tabs: "탭",
    groups: "그룹",
    id: "ID",
    window: "창",
    active: "활성",
    pinned: "고정됨",
    muted: "음소거",
    showWindow: "창 표시",
    collapse: "접기",
    expand: "펼치기",
    open: "열림",
    collapsed: "접힘",
    noActiveWindow: "활성 창이 없습니다",
    stateNotLoaded: "상태가 아직 로드되지 않았습니다. «새로고침 및 동기화»를 누르거나 bridge 실행 여부를 확인하세요.",
    ungrouped: "그룹 없음",
    tabsOutsideGroups: "그룹 밖의 탭",
    ungroupedInfo: "아직 그룹화되지 않은 탭",
    noTabsOutsideGroups: "그룹 밖의 탭이 없습니다",
    themeLight: "라이트",
    themeDark: "다크",
    preferences: "환경설정",
    languageOptions: "언어",
    chromeWindows: "Chrome 창"
  },
  zh: {
    eyebrow: "AI Chrome Tabs Bridge",
    title: "标签实时访问",
    loading: "加载中...",
    refreshAndSync: "刷新并同步",
    bridgeOnline: "桥接在线",
    bridgeOffline: "桥接离线",
    queued: "排队中",
    windows: "窗口",
    tabs: "标签页",
    groups: "分组",
    id: "ID",
    window: "窗口",
    active: "活动",
    pinned: "已固定",
    muted: "静音",
    showWindow: "显示窗口",
    collapse: "折叠",
    expand: "展开",
    open: "已展开",
    collapsed: "已折叠",
    noActiveWindow: "没有活动窗口",
    stateNotLoaded: "状态尚未加载。请点击“刷新并同步”，或检查 bridge 是否正在运行。",
    ungrouped: "未分组",
    tabsOutsideGroups: "分组外标签页",
    ungroupedInfo: "尚未分组的标签页",
    noTabsOutsideGroups: "没有分组外标签页",
    themeLight: "浅色",
    themeDark: "深色",
    preferences: "偏好设置",
    languageOptions: "语言",
    chromeWindows: "Chrome 窗口"
  }
};

const LANG_OPTIONS = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "it", flag: "🇮🇹", label: "Italiano" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "zh", flag: "🇨🇳", label: "中文" }
];

const WINDOW_STATE_LABELS = {
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
  },
  es: {
    normal: "normal",
    minimized: "minimizada",
    maximized: "maximizada",
    fullscreen: "pantalla completa"
  },
  fr: {
    normal: "normale",
    minimized: "réduite",
    maximized: "agrandie",
    fullscreen: "plein écran"
  },
  de: {
    normal: "normal",
    minimized: "minimiert",
    maximized: "maximiert",
    fullscreen: "Vollbild"
  },
  pt: {
    normal: "normal",
    minimized: "minimizada",
    maximized: "maximizada",
    fullscreen: "tela cheia"
  },
  it: {
    normal: "normale",
    minimized: "ridotta",
    maximized: "ingrandita",
    fullscreen: "schermo intero"
  },
  ja: {
    normal: "通常",
    minimized: "最小化",
    maximized: "最大化",
    fullscreen: "全画面"
  },
  ko: {
    normal: "보통",
    minimized: "최소화됨",
    maximized: "최대화됨",
    fullscreen: "전체 화면"
  },
  zh: {
    normal: "普通",
    minimized: "已最小化",
    maximized: "已最大化",
    fullscreen: "全屏"
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

function isSupportedLang(lang) {
  return LANG_OPTIONS.some((option) => option.code === lang);
}

function t(key) {
  const lang = currentLang();
  return I18N[lang][key] ?? I18N.en[key] ?? key;
}

function translateWindowState(state) {
  const key = String(state || "normal");
  const labels = WINDOW_STATE_LABELS[currentLang()] || WINDOW_STATE_LABELS.en;
  return labels[key] || key;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeFavIconUrl(url) {
  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "data:") {
      return url;
    }
  } catch {
    return "";
  }

  return "";
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
      lang: isSupportedLang(parsed.lang) ? parsed.lang : "en",
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

function renderLanguageMenu() {
  if (!langMenu) {
    return;
  }

  langMenu.innerHTML = LANG_OPTIONS.map(
    (option) => `
      <button
        type="button"
        class="switch-pill lang-option ${option.code === currentLang() ? "is-active" : ""}"
        data-lang="${escapeHtml(option.code)}"
        aria-pressed="${option.code === currentLang() ? "true" : "false"}"
      >
        <span class="lang-flag" aria-hidden="true">${escapeHtml(option.flag)}</span>
        <span class="lang-label">${escapeHtml(option.label)}</span>
      </button>
    `
  ).join("");
}

function applyPreferences() {
  document.documentElement.lang = currentLang();
  document.documentElement.dataset.theme = currentTheme();
  document.title = t("title");

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
  if (langToggleBtn) {
    langToggleBtn.textContent = currentLang();
    langToggleBtn.setAttribute("aria-expanded", langMenu && !langMenu.hidden ? "true" : "false");
    langToggleBtn.setAttribute("title", currentLang().toUpperCase());
  }
  if (switchRowEl) {
    switchRowEl.setAttribute("aria-label", t("preferences"));
  }
  if (langMenu) {
    langMenu.setAttribute("aria-label", t("languageOptions"));
  }
  renderLanguageMenu();
  setLangMenuOpen(false);
}

function setLang(lang) {
  uiState.lang = isSupportedLang(lang) ? lang : "en";
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
  const faviconUrl = safeFavIconUrl(tab.favIconUrl);
  const faviconStyle = faviconUrl
    ? ` style="${escapeHtml(`background-image: url(${JSON.stringify(faviconUrl)})`)}"`
    : "";
  const faviconClass = faviconUrl ? " has-favicon" : "";

  return `
    <button
      type="button"
      class="tab tab-button"
      data-action="activate-tab"
      data-tab-id="${escapeHtml(tab.id)}"
      title="${escapeHtml(tab.title)}"
    >
      <div class="tab-icon${faviconClass}" aria-hidden="true"${faviconStyle}></div>
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
          <span
            class="group-color-swatch"
            data-color="${escapeHtml(group.color)}"
            title="${escapeHtml(group.color)}"
            aria-label="${escapeHtml(group.color)}"
          ></span>
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
      <section class="window-tabs" aria-label="${escapeHtml(t("chromeWindows"))}">
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

  const outerScroll = treeEl;
  if (outerScroll) {
    outerScroll.scrollTop += deltaY;
  }
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

function setLangMenuOpen(open) {
  if (!langMenu || !langToggleBtn) {
    return;
  }
  langMenu.hidden = !open;
  langToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

if (langToggleBtn && langMenu) {
  langToggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setLangMenuOpen(langMenu.hidden);
  });

  langMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-lang]");
    if (!option) {
      return;
    }

    setLang(option.dataset.lang);
    setLangMenuOpen(false);
    if (lastState) {
      renderState(lastState);
    }
  });

  document.addEventListener("click", (event) => {
    if (!langMenu.hidden && !event.target.closest(".lang-picker")) {
      setLangMenuOpen(false);
    }
  });
}

applyPreferences();

refresh().catch((error) => {
  treeEl.innerHTML = `<div class="notice">${escapeHtml(error.message || String(error))}</div>`;
});
