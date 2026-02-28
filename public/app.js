const DEFAULT_PREFERENCES = {
  watchlistSymbols: ["AAPL", "MSFT", "NVDA", "SPY", "TLT", "GLD", "EURUSD=X", "^GSPC"],
  researchPinnedSymbols: [],
  detailSymbol: "AAPL",
  companyMapCompareSymbol: "",
  newsFocus: "",
  sectorFocus: "Technology",
  cryptoProducts: ["BTC-USD", "ETH-USD", "SOL-USD"],
  activePage: "overview",
  screenConfig: {
    symbols: "AAPL,MSFT,NVDA,AMZN,META,GOOGL,TSLA,JPM,XOM,UNH,AVGO,AMD,QQQ,SPY,TLT,GLD",
    maxPe: "",
    minMarketCap: "",
    minVolume: "",
    minChangePct: "",
  },
  portfolio: [],
  panelLayout: [],
  panelSizes: {},
};

const GUEST_PREFERENCES_KEY = "omt-guest-preferences";
const DEFAULT_PANEL_SIZES = {
  "section-market-pulse": 12,
  "section-heatmap": 12,
  "section-sector-board": 12,
  "section-market-events": 12,
  "section-watchlist": 5,
  "section-flow": 7,
  "section-research-rail": 3,
  "section-workbench": 7,
  "section-intelligence": 12,
  "section-company-map": 12,
  "section-macro": 3,
  "section-calendar": 5,
  "section-news": 7,
  "section-portfolio": 3,
  "section-alerts": 3,
  "section-intel-ops": 3,
  "section-workspaces": 3,
  "section-notes": 3,
  "section-activity": 3,
  "section-crypto": 3,
  "section-screening": 12,
  "section-events": 12,
  "section-limitations": 12,
};
const DEFAULT_PANEL_LAYOUT = [
  "section-market-pulse",
  "section-heatmap",
  "section-sector-board",
  "section-market-events",
  "section-watchlist",
  "section-flow",
  "section-research-rail",
  "section-workbench",
  "section-intelligence",
  "section-company-map",
  "section-macro",
  "section-calendar",
  "section-news",
  "section-portfolio",
  "section-alerts",
  "section-intel-ops",
  "section-workspaces",
  "section-notes",
  "section-activity",
  "section-crypto",
  "section-screening",
  "section-events",
  "section-limitations",
];

const PAGE_DEFINITIONS = {
  overview: {
    label: "Markets",
    sectionLabel: "Markets Desk",
    title: "Cross-asset market board with breadth, catalysts, and scheduled risk.",
    description:
      "Keep the heatmap, pulse board, ranked events, watchlists, and flow signals on one cleaner market page.",
    tags: ["Heatmap", "Pulse", "Flow", "Catalysts"],
    sections: [
      "section-market-pulse",
      "section-heatmap",
      "section-market-events",
      "section-watchlist",
      "section-flow",
      "section-macro",
    ],
  },
  sectors: {
    label: "Sectors",
    sectionLabel: "Sector Desk",
    title: "Sector drilldowns with relative movers, weight maps, and linked headlines.",
    description:
      "Open any heatmap sector into its own board with constituent ranks, sector headlines, and direct routes back into single-name research.",
    tags: ["Sector Board", "Leaders", "Weights", "Headlines"],
    sections: [
      "section-sector-board",
    ],
  },
  calendar: {
    label: "Calendar",
    sectionLabel: "Calendar Desk",
    title: "Date-grouped earnings boards with macro and policy events on the same tape.",
    description:
      "Browse upcoming dates as daily boards instead of a flat feed, with earnings grouped by day and macro / policy events stacked beneath.",
    tags: ["Daily Boards", "Earnings", "Fed", "Macro"],
    sections: [
      "section-calendar",
    ],
  },
  map: {
    label: "Map",
    sectionLabel: "Company Map Desk",
    title: "Detailed company relationship mapping across suppliers, customers, indices, holders, and board data.",
    description:
      "Search any symbol and inspect a cleaner detailed map with supplier and output networks, index memberships, competition, holders, and officer coverage.",
    tags: ["Supply Chain", "Customers", "Indices", "Ownership"],
    sections: [
      "section-company-map",
    ],
  },
  news: {
    label: "News",
    sectionLabel: "Newswire Desk",
    title: "Live market headlines with searchable symbol and company coverage.",
    description:
      "Search a ticker, company, or theme and browse a fuller headline board with linked public sources.",
    tags: ["Search", "Headlines", "Sources", "Themes"],
    sections: [
      "section-news",
    ],
  },
  research: {
    label: "Research",
    sectionLabel: "Research Desk",
    title: "Deep security workbench, relationship intelligence, and peer tools.",
    description:
      "Use this page for single-name work, filings, price history, options, supply-chain links, competitor maps, and custom screens.",
    tags: ["Workbench", "Intel", "Filings", "Screening"],
    sections: [
      "section-research-rail",
      "section-workbench",
      "section-intelligence",
      "section-screening",
      "section-events",
    ],
  },
  ops: {
    label: "Ops",
    sectionLabel: "Ops Desk",
    title: "Portfolio state, automation, notes, alerts, crypto, and saved workflows.",
    description:
      "Keep automations and persistence away from the market overview so the desk stays readable during the trading day.",
    tags: ["Portfolio", "Alerts", "Digests", "Workspaces"],
    sections: [
      "section-portfolio",
      "section-alerts",
      "section-intel-ops",
      "section-workspaces",
      "section-notes",
      "section-activity",
      "section-crypto",
      "section-limitations",
    ],
  },
};

const PAGE_PANEL_SPANS = {
  overview: {
    "section-market-pulse": 4,
    "section-market-events": 8,
    "section-watchlist": 5,
    "section-flow": 7,
    "section-heatmap": 12,
    "section-macro": 3,
  },
  sectors: {
    "section-sector-board": 12,
  },
  calendar: {
    "section-calendar": 12,
  },
  map: {
    "section-company-map": 12,
  },
  news: {
    "section-news": 12,
  },
  research: {
    "section-research-rail": 3,
    "section-workbench": 9,
    "section-intelligence": 9,
    "section-screening": 9,
    "section-events": 9,
  },
  ops: {
    "section-portfolio": 4,
    "section-alerts": 4,
    "section-crypto": 4,
    "section-intel-ops": 6,
    "section-activity": 6,
    "section-workspaces": 3,
    "section-notes": 3,
    "section-limitations": 12,
  },
};

const PAGE_PANEL_ORDERS = {
  research: {
    "section-research-rail": 0,
    "section-workbench": 1,
    "section-intelligence": 2,
    "section-events": 3,
    "section-screening": 4,
  },
};

const PAGE_PANEL_COLUMNS = {
  research: {
    "section-research-rail": "1 / span 3",
    "section-workbench": "4 / -1",
    "section-intelligence": "4 / -1",
    "section-events": "4 / -1",
    "section-screening": "4 / -1",
  },
};

const PAGE_PANEL_ROWS = {
  research: {
    "section-research-rail": "1 / span 4",
    "section-workbench": "1",
    "section-intelligence": "2",
    "section-events": "3",
    "section-screening": "4",
  },
};

const SECTION_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_DEFINITIONS).flatMap(([pageId, page]) => page.sections.map((sectionId) => [sectionId, pageId])),
);

const state = {
  authenticated: false,
  user: null,
  counts: null,
  preferences: mergePreferences(loadStore(GUEST_PREFERENCES_KEY, DEFAULT_PREFERENCES)),
  latestQuotes: new Map(),
  cryptoQuotes: new Map(),
  alerts: [],
  destinations: [],
  digests: [],
  notes: [],
  workspaces: [],
  activity: [],
  intelligence: null,
  heatmap: null,
  researchRailItems: [],
  heatmapFocusSymbol: null,
  heatmapContextCache: new Map(),
  heatmapContextToken: 0,
  selectedWorkspaceId: null,
  selectedNoteId: null,
  selectedDigestId: null,
  currentHistoryRange: "1mo",
  profileSyncTimer: null,
  cryptoSource: null,
  cryptoPollTimer: null,
  activitySource: null,
  activityPollTimer: null,
  latestPulseCount: 0,
  lastSyncAt: null,
  feedStatus: "Booting",
  currentDetailQuote: null,
  currentCompany: null,
  currentOptions: null,
  currentEarnings: null,
  calendarEvents: [],
  newsItems: [],
  marketEvents: [],
  sectorBoard: null,
  flow: null,
  companyMap: null,
  companyMapCompare: null,
  calendarPage: 1,
  newsPage: 1,
  marketEventsPage: 1,
  paletteCommands: [],
  commandPaletteOpen: false,
  paletteIndex: 0,
  dragPanelId: null,
  resizePanelId: null,
  earningsDrawerOpen: false,
};

const SECTION_COMMANDS = [
  { id: "section-market-pulse", label: "Jump to Market Pulse", meta: "cross-asset pulse board" },
  { id: "section-heatmap", label: "Jump to S&P 500 Heatmap", meta: "live breadth and hover reasons" },
  { id: "section-sector-board", label: "Jump to Sector Board", meta: "sector drilldown and constituents" },
  { id: "section-watchlist", label: "Jump to Watchlist", meta: "tracked market quotes" },
  { id: "section-flow", label: "Jump to Flow Monitor", meta: "share volume, options flow, short interest" },
  { id: "section-research-rail", label: "Jump to Research Rail", meta: "symbol stack and focus list" },
  { id: "section-workbench", label: "Jump to Security Workbench", meta: "detail, filings, and options" },
  { id: "section-market-events", label: "Jump to Market Events", meta: "ranked event timeline" },
  { id: "section-intelligence", label: "Jump to Relationship Console", meta: "ownership and supply chains" },
  { id: "section-company-map", label: "Jump to Company Map", meta: "suppliers, customers, indices, holders, board" },
  { id: "section-calendar", label: "Jump to Desk Calendar", meta: "earnings, Fed, and macro dates" },
  { id: "section-news", label: "Jump to Market News", meta: "live public headlines" },
  { id: "section-portfolio", label: "Jump to Portfolio", meta: "positions and P/L" },
  { id: "section-alerts", label: "Jump to Alerts", meta: "server-side triggers" },
  { id: "section-intel-ops", label: "Jump to Intel Ops", meta: "webhooks and digests" },
  { id: "section-screening", label: "Jump to Screening", meta: "custom universes and peer tables" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

document.addEventListener("DOMContentLoaded", async () => {
  bindForms();
  bindGlobalActions();
  startHudClock();
  await loadSession();
  initializePanelLayout();
  applyPageState();
  applyPreferencesToInputs();
  renderAuth();
  renderProtectedGuards();
  renderPortfolio();
  renderAlerts();
  renderDestinations();
  renderDigests();
  renderResearchRail();
  renderNotes();
  renderWorkspaces();
  renderActivity();
  renderSymbolRibbon();
  renderHud();
  connectCrypto();
  await Promise.all([
    loadMarketPulse(),
    loadHeatmap(),
    loadSectorBoard(),
    loadMarketEvents(),
    loadWatchlist(state.preferences.watchlistSymbols),
    loadFlow(),
    loadResearchRail(),
    loadDetail(state.preferences.detailSymbol),
    loadCompanyMap(state.preferences.detailSymbol),
    loadMacro(),
    loadYieldCurve(),
    loadDeskCalendar(),
    loadDeskNews(),
    loadOrderBook(currentOrderBookProduct()),
    runScreen(),
    runCompare(),
    loadWatchlistEvents(),
  ]);
  scheduleRefresh();
});

function bindForms() {
  document.querySelector("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: {
          name: document.querySelector("#registerName").value,
          email: document.querySelector("#registerEmail").value,
          password: document.querySelector("#registerPassword").value,
        },
      });
      event.target.reset();
      await loadSession(true);
      showStatus("Account created.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: {
          email: document.querySelector("#loginEmail").value,
          password: document.querySelector("#loginPassword").value,
        },
      });
      event.target.reset();
      await loadSession(true);
      showStatus("Signed in.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#logoutButton").addEventListener("click", async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
      teardownAuthenticatedState();
      renderAuth();
      renderProtectedGuards();
      renderAlerts();
      renderDestinations();
      renderDigests();
      renderResearchRail();
      renderNotes();
      renderWorkspaces();
      renderActivity();
      showStatus("Logged out.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#syncProfileButton").addEventListener("click", async () => {
    await syncPreferences(true);
  });

  document.querySelector("#refreshPulseButton").addEventListener("click", async () => {
    await loadMarketPulse();
  });

  document.querySelector("#refreshHeatmapButton")?.addEventListener("click", async () => {
    await loadHeatmap(true);
  });

  document.querySelector("#refreshSectorBoardButton")?.addEventListener("click", async () => {
    await loadSectorBoard(true);
  });

  document.querySelector("#refreshEventsButton").addEventListener("click", async () => {
    await loadMarketEvents(true);
  });

  document.querySelector("#watchlistForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.watchlistSymbols = splitSymbols(document.querySelector("#watchlistInput").value);
    schedulePreferenceSync();
    await loadWatchlist(state.preferences.watchlistSymbols);
    await Promise.all([loadWatchlistEvents(), loadDeskCalendar(true), loadDeskNews(true), loadMarketEvents(true), loadFlow(true)]);
  });

  document.querySelector("#saveWatchlistButton").addEventListener("click", async () => {
    await syncPreferences(true);
  });

  document.querySelector("#detailForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.currentHistoryRange = document.querySelector("#historyRange").value;
    await selectDetailSymbol(document.querySelector("#detailSymbol").value.trim().toUpperCase());
  });

  document.querySelector("#companyMapForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const primary = document.querySelector("#companyMapSymbol")?.value.trim().toUpperCase() ?? "";
    const compare = document.querySelector("#companyMapCompareSymbol")?.value.trim().toUpperCase() ?? "";
    state.preferences.companyMapCompareSymbol = compare && compare !== primary ? compare : "";
    schedulePreferenceSync();
    await selectDetailSymbol(primary, { page: "map", jump: false });
  });

  document.querySelector("#refreshCompanyMapButton")?.addEventListener("click", async () => {
    await loadCompanyMap(state.preferences.detailSymbol, true);
  });

  document.querySelector("#swapCompanyMapButton")?.addEventListener("click", async () => {
    const primaryInput = document.querySelector("#companyMapSymbol");
    const compareInput = document.querySelector("#companyMapCompareSymbol");
    const primary = primaryInput?.value.trim().toUpperCase() ?? state.preferences.detailSymbol;
    const compare = compareInput?.value.trim().toUpperCase() ?? state.preferences.companyMapCompareSymbol;
    if (!compare) {
      return;
    }
    state.preferences.companyMapCompareSymbol = primary;
    schedulePreferenceSync();
    if (compareInput) {
      compareInput.value = primary;
    }
    await selectDetailSymbol(compare, { page: "map", jump: false });
  });

  document.querySelector("#clearCompanyMapCompareButton")?.addEventListener("click", async () => {
    state.preferences.companyMapCompareSymbol = "";
    state.companyMapCompare = null;
    const compareInput = document.querySelector("#companyMapCompareSymbol");
    if (compareInput) {
      compareInput.value = "";
    }
    renderCompanyMapCompare(null, null);
    schedulePreferenceSync();
    if (normalizePage(state.preferences.activePage) === "map") {
      await loadCompanyMap(state.preferences.detailSymbol, true);
    }
  });

  document.querySelector("#sectorBoardForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await selectSectorFocus(document.querySelector("#sectorBoardSelect")?.value, { page: "sectors", jump: false });
  });

  document.querySelector("#refreshFlowButton")?.addEventListener("click", async () => {
    await loadFlow(true);
  });

  document.querySelector("#workspaceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!guardAuthenticated("Save workspaces")) {
      return;
    }
    try {
      const payload = await api("/api/workspaces", {
        method: "POST",
        body: {
          id: state.selectedWorkspaceId,
          name: document.querySelector("#workspaceName").value,
          isDefault: document.querySelector("#workspaceDefault").checked,
          snapshot: snapshotCurrentWorkspace(),
        },
      });
      state.selectedWorkspaceId = payload.workspace.id;
      await loadWorkspaces();
      renderWorkspaces();
      showStatus("Workspace saved.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#workspaceNewButton").addEventListener("click", () => {
    state.selectedWorkspaceId = null;
    document.querySelector("#workspaceForm").reset();
    renderWorkspaces();
  });

  document.querySelector("#noteForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!guardAuthenticated("Save notes")) {
      return;
    }
    try {
      const payload = await api("/api/notes", {
        method: "POST",
        body: {
          id: state.selectedNoteId,
          title: document.querySelector("#noteTitle").value,
          content: document.querySelector("#noteContent").value,
          workspaceId: state.selectedWorkspaceId,
        },
      });
      state.selectedNoteId = payload.note.id;
      await loadNotes();
      renderNotes();
      showStatus("Note saved.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#noteNewButton").addEventListener("click", () => {
    state.selectedNoteId = null;
    document.querySelector("#noteForm").reset();
    renderNotes();
  });

  document.querySelector("#cryptoForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.cryptoProducts = splitSymbols(document.querySelector("#cryptoProductsInput").value);
    if (!state.preferences.cryptoProducts.length) {
      state.preferences.cryptoProducts = [...DEFAULT_PREFERENCES.cryptoProducts];
    }
    applyCryptoPreferences();
    schedulePreferenceSync();
    connectCrypto();
    await loadOrderBook(currentOrderBookProduct());
  });

  document.querySelector("#orderBookProduct").addEventListener("change", async (event) => {
    await loadOrderBook(event.target.value);
  });

  document.querySelector("#portfolioForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const symbol = document.querySelector("#portfolioSymbol").value.trim().toUpperCase();
    const quantity = Number(document.querySelector("#portfolioQuantity").value);
    const cost = Number(document.querySelector("#portfolioCost").value);

    if (!symbol || !Number.isFinite(quantity) || !Number.isFinite(cost)) {
      showStatus("Portfolio inputs are incomplete.", true);
      return;
    }

    state.preferences.portfolio.push({ id: crypto.randomUUID(), symbol, quantity, cost });
    persistGuestPreferencesIfNeeded();
    schedulePreferenceSync();
    event.target.reset();
    renderPortfolio();
    hydrateMissingPortfolioQuotes();
  });

  document.querySelector("#alertForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!guardAuthenticated("Create alerts")) {
      return;
    }

    const symbol = document.querySelector("#alertSymbol").value.trim().toUpperCase();
    const direction = document.querySelector("#alertDirection").value;
    const price = Number(document.querySelector("#alertPrice").value);

    if (!symbol || !Number.isFinite(price)) {
      showStatus("Alert inputs are incomplete.", true);
      return;
    }

    try {
      await api("/api/alerts", {
        method: "POST",
        body: { symbol, direction, price },
      });
      event.target.reset();
      await loadAlerts();
      renderAlerts();
      showStatus("Alert created.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#destinationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!guardAuthenticated("Save destinations")) {
      return;
    }

    const purposes = [];
    if (document.querySelector("#destinationPurposeAlert").checked) {
      purposes.push("alert");
    }
    if (document.querySelector("#destinationPurposeDigest").checked) {
      purposes.push("digest");
    }

    try {
      await api("/api/destinations", {
        method: "POST",
        body: {
          label: document.querySelector("#destinationLabel").value,
          kind: document.querySelector("#destinationKind").value,
          target: document.querySelector("#destinationTarget").value,
          purposes,
        },
      });
      event.target.reset();
      document.querySelector("#destinationPurposeAlert").checked = true;
      document.querySelector("#destinationPurposeDigest").checked = true;
      await loadDestinations();
      renderDestinations();
      renderDigestDestinationOptions();
      showStatus("Destination saved.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#digestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!guardAuthenticated("Save digests")) {
      return;
    }

    try {
      await api("/api/digests", {
        method: "POST",
        body: {
          id: state.selectedDigestId,
          name: document.querySelector("#digestName").value,
          symbols: splitSymbols(document.querySelector("#digestSymbols").value),
          frequency: document.querySelector("#digestFrequency").value,
          active: document.querySelector("#digestActive").checked,
          destinationIds: [...document.querySelector("#digestDestinations").selectedOptions].map((option) => option.value),
        },
      });
      state.selectedDigestId = null;
      event.target.reset();
      document.querySelector("#digestActive").checked = true;
      await loadDigests();
      renderDigests();
      showStatus("Digest saved.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  });

  document.querySelector("#digestNewButton").addEventListener("click", () => {
    state.selectedDigestId = null;
    document.querySelector("#digestForm").reset();
    document.querySelector("#digestActive").checked = true;
    renderDigests();
  });

  document.querySelector("#screenForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.screenConfig = {
      symbols: document.querySelector("#screenSymbols").value.trim(),
      maxPe: document.querySelector("#screenMaxPe").value,
      minMarketCap: document.querySelector("#screenMinCap").value,
      minVolume: document.querySelector("#screenMinVolume").value,
      minChangePct: document.querySelector("#screenMinChange").value,
    };
    schedulePreferenceSync();
    await runScreen();
  });

  document.querySelector("#compareForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await runCompare();
  });

  document.querySelector("#calendarForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.calendarPage = 1;
    await loadDeskCalendar(true);
  });

  document.querySelector("#calendarPageSize")?.addEventListener("change", () => {
    state.calendarPage = 1;
    rerenderPageScopedPanels();
  });

  document.querySelector("#calendarFilter")?.addEventListener("change", () => {
    state.calendarPage = 1;
    rerenderPageScopedPanels();
  });

  document.querySelector("#calendarWindow")?.addEventListener("change", async () => {
    state.calendarPage = 1;
    await loadDeskCalendar(true);
  });

  document.querySelector("#newsSearchForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.newsFocus = document.querySelector("#newsFocusInput")?.value.trim() ?? "";
    state.newsPage = 1;
    schedulePreferenceSync();
    await loadDeskNews(true);
  });
}

function bindGlobalActions() {
  document.querySelector("#resetLayoutButton")?.addEventListener("click", () => {
    state.preferences.panelLayout = [...DEFAULT_PANEL_LAYOUT];
    state.preferences.panelSizes = { ...DEFAULT_PANEL_SIZES };
    applyPanelLayout();
    schedulePreferenceSync();
    showStatus("Dashboard layout reset.", false);
  });

  document.querySelector("#commandPaletteButton")?.addEventListener("click", () => {
    openCommandPalette("");
  });

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      setActivePage(button.dataset.page, { scroll: true });
    });
  });

  document.querySelectorAll("[data-jump-section]").forEach((button) => {
    button.addEventListener("click", () => {
      jumpToSection(button.dataset.jumpSection);
    });
  });

  document.querySelector("#symbolRibbon")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-symbol]") : null;
    if (!trigger) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.symbol, { jump: true });
  });

  document.querySelector("#sp500Heatmap")?.addEventListener("mouseover", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-heatmap-symbol]") : null;
    if (!trigger || trigger.dataset.heatmapSymbol === state.heatmapFocusSymbol) {
      return;
    }
    void focusHeatmapSymbol(trigger.dataset.heatmapSymbol);
  });

  document.querySelector("#sp500Heatmap")?.addEventListener("focusin", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-heatmap-symbol]") : null;
    if (!trigger || trigger.dataset.heatmapSymbol === state.heatmapFocusSymbol) {
      return;
    }
    void focusHeatmapSymbol(trigger.dataset.heatmapSymbol);
  });

  document.querySelector("#sp500Heatmap")?.addEventListener("click", async (event) => {
    const sectorTrigger = event.target instanceof Element ? event.target.closest("[data-heatmap-sector]") : null;
    if (sectorTrigger?.dataset.heatmapSector) {
      await selectSectorFocus(sectorTrigger.dataset.heatmapSector, { jump: true, page: "sectors" });
      return;
    }
    const trigger = event.target instanceof Element ? event.target.closest("[data-heatmap-symbol]") : null;
    if (!trigger) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.heatmapSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#sectorBoardTiles")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-sector-symbol]") : null;
    if (!trigger?.dataset.sectorSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.sectorSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#sectorBoardBody")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-sector-symbol]") : null;
    if (!trigger?.dataset.sectorSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.sectorSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#flowBody")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-flow-symbol]") : null;
    if (!trigger?.dataset.flowSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.flowSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#intelGraph")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-graph-symbol]") : null;
    if (!trigger?.dataset.graphSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.graphSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#companyMapGraph")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-graph-symbol]") : null;
    if (!trigger?.dataset.graphSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.graphSymbol, { jump: false, page: "map" });
  });

  document.querySelector("#section-company-map")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-company-map-symbol]") : null;
    if (!trigger?.dataset.companyMapSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.companyMapSymbol, { jump: false, page: "map" });
  });

  document.querySelector("#commandPaletteInput")?.addEventListener("input", (event) => {
    state.paletteIndex = 0;
    renderCommandPaletteResults(event.target.value);
  });

  document.querySelector("#commandPaletteResults")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-command-index]") : null;
    if (!trigger) {
      return;
    }
    const command = state.paletteCommands[Number(trigger.dataset.commandIndex)];
    if (command) {
      await executePaletteCommand(command);
    }
  });

  document.querySelector("[data-close-palette='true']")?.addEventListener("click", () => {
    closeCommandPalette();
  });

  document.querySelector("#refreshNewsButton")?.addEventListener("click", async () => {
    await loadDeskNews(true);
  });

  document.querySelector("#clearNewsFocusButton")?.addEventListener("click", async () => {
    state.preferences.newsFocus = "";
    state.newsPage = 1;
    applyPreferencesToInputs();
    schedulePreferenceSync();
    await loadDeskNews(true);
  });

  document.querySelector("#calendarPager")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-calendar-page]") : null;
    if (!trigger) {
      return;
    }
    state.calendarPage = Number(trigger.dataset.calendarPage);
    rerenderPageScopedPanels();
  });

  document.querySelector("#newsPager")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-news-page]") : null;
    if (!trigger) {
      return;
    }
    state.newsPage = Number(trigger.dataset.newsPage);
    rerenderPageScopedPanels();
  });

  document.querySelector("#marketEventsPager")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-market-events-page]") : null;
    if (!trigger) {
      return;
    }
    state.marketEventsPage = Number(trigger.dataset.marketEventsPage);
    rerenderPageScopedPanels();
  });

  document.querySelector("#toggleEarningsDrawerButton")?.addEventListener("click", async () => {
    toggleEarningsDrawer(true);
    document.querySelector("#earningsWarning").innerHTML =
      `<div class="panel-status-chip">Loading ${escapeHtml(state.preferences.detailSymbol)} earnings modules...</div>`;
    if (supportsEarningsIntel(state.currentDetailQuote, state.currentCompany)) {
      await loadEarningsIntel(state.preferences.detailSymbol, { forceOpen: true });
    } else if (state.currentEarnings) {
      renderEarningsDrawer(state.currentEarnings);
    }
  });

  document.querySelector("#closeEarningsDrawerButton")?.addEventListener("click", () => {
    toggleEarningsDrawer(false);
  });

  document.querySelector("#earningsOverlay")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-close-earnings='true']") : null;
    if (trigger) {
      toggleEarningsDrawer(false);
    }
  });

  document.addEventListener("keydown", async (event) => {
    const target = event.target;
    const editable = target instanceof HTMLElement && (target.closest("input, textarea, select") || target.isContentEditable);

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette("");
      return;
    }

    if (state.commandPaletteOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCommandPalette();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        state.paletteIndex = Math.min(state.paletteIndex + 1, Math.max(state.paletteCommands.length - 1, 0));
        syncPaletteSelection();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        state.paletteIndex = Math.max(state.paletteIndex - 1, 0);
        syncPaletteSelection();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const command = state.paletteCommands[state.paletteIndex];
        if (command) {
          await executePaletteCommand(command);
        }
      }
      return;
    }

    if (state.earningsDrawerOpen && event.key === "Escape") {
      event.preventDefault();
      toggleEarningsDrawer(false);
      return;
    }

    if (editable) {
      return;
    }

    if (event.key === "[") {
      event.preventDefault();
      await cycleDetailSymbol(-1);
    } else if (event.key === "]") {
      event.preventDefault();
      await cycleDetailSymbol(1);
    }
  });

  window.addEventListener("resize", () => {
    applyPanelLayout();
  });
}

function initializePanelLayout() {
  const dashboard = document.querySelector("#dashboardGrid");
  if (!dashboard || dashboard.dataset.layoutInitialized === "true") {
    applyPanelLayout();
    return;
  }

  dashboard.dataset.layoutInitialized = "true";
  dashboard.querySelectorAll(":scope > section.panel").forEach((panel) => {
    panel.dataset.panelId = panel.id;
    const header = panel.querySelector(".panel-header");
    if (!header || header.querySelector(".panel-drag-handle")) {
      return;
    }

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "panel-drag-handle";
    handle.draggable = true;
    handle.setAttribute("aria-label", `Move ${panel.id}`);
    handle.innerHTML = "<span>::</span><strong>Move</strong>";

    handle.addEventListener("dragstart", (event) => {
      state.dragPanelId = panel.id;
      panel.classList.add("panel-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", panel.id);
    });

    handle.addEventListener("dragend", () => {
      state.dragPanelId = null;
      clearPanelDropState();
      dashboard.querySelectorAll(".panel-dragging").forEach((node) => node.classList.remove("panel-dragging"));
    });

    header.append(handle);

    const resizeHandle = document.createElement("button");
    resizeHandle.type = "button";
    resizeHandle.className = "panel-resize-handle";
    resizeHandle.setAttribute("aria-label", `Resize ${panel.id}`);
    resizeHandle.innerHTML = "<span>//</span>";
    resizeHandle.addEventListener("pointerdown", (event) => {
      if (window.innerWidth <= 1320) {
        return;
      }
      startPanelResize(panel, event);
    });
    panel.append(resizeHandle);
  });

  dashboard.addEventListener("dragover", (event) => {
    const target = event.target instanceof Element ? event.target.closest("section.panel") : null;
    if (!target || !state.dragPanelId || target.id === state.dragPanelId) {
      return;
    }
    event.preventDefault();
    clearPanelDropState();
    target.classList.add(dropDirection(target, event) === "before" ? "panel-drop-before" : "panel-drop-after");
  });

  dashboard.addEventListener("drop", (event) => {
    const target = event.target instanceof Element ? event.target.closest("section.panel") : null;
    if (!target || !state.dragPanelId || target.id === state.dragPanelId) {
      return;
    }
    event.preventDefault();
    movePanel(state.dragPanelId, target.id, dropDirection(target, event));
  });

  dashboard.addEventListener("dragleave", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }
    const panel = event.target.closest("section.panel");
    if (panel) {
      panel.classList.remove("panel-drop-before", "panel-drop-after");
    }
  });

  applyPanelLayout();
}

function movePanel(sourceId, targetId, direction) {
  const layout = normalizePanelLayout(state.preferences.panelLayout);
  const sourceIndex = layout.indexOf(sourceId);
  const targetIndex = layout.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1) {
    return;
  }

  const next = [...layout];
  next.splice(sourceIndex, 1);
  const adjustedTarget = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
  const insertAt = direction === "after" ? adjustedTarget + 1 : adjustedTarget;
  next.splice(insertAt, 0, sourceId);

  state.preferences.panelLayout = normalizePanelLayout(next);
  applyPanelLayout();
  schedulePreferenceSync();
}

function applyPanelLayout() {
  const layout = normalizePanelLayout(state.preferences.panelLayout);
  const activePage = normalizePage(state.preferences.activePage);
  const pageOrders = PAGE_PANEL_ORDERS[activePage] ?? {};
  const pageColumns = PAGE_PANEL_COLUMNS[activePage] ?? {};
  const pageRows = PAGE_PANEL_ROWS[activePage] ?? {};
  state.preferences.panelLayout = layout;
  state.preferences.panelSizes = normalizePanelSizes(state.preferences.panelSizes);
  document.querySelectorAll("#dashboardGrid > section.panel").forEach((panel) => {
    const order = Number.isFinite(pageOrders[panel.id]) ? pageOrders[panel.id] : layout.indexOf(panel.id);
    panel.style.order = String(order === -1 ? DEFAULT_PANEL_LAYOUT.length : order);
    if (window.innerWidth <= 1320) {
      panel.style.gridColumn = "";
      panel.style.gridRow = "";
      return;
    }
    panel.style.gridColumn = pageColumns[panel.id] ?? `span ${panelSpan(panel.id)}`;
    panel.style.gridRow = pageRows[panel.id] ?? "";
  });
  applyPageState();
}

function applyPageState() {
  const pageId = normalizePage(state.preferences.activePage);
  state.preferences.activePage = pageId;
  const page = PAGE_DEFINITIONS[pageId];
  const dashboard = document.querySelector("#dashboardGrid");

  if (dashboard) {
    dashboard.dataset.page = pageId;
  }

  document.querySelectorAll("#dashboardGrid > section.panel").forEach((panel) => {
    panel.hidden = SECTION_TO_PAGE[panel.id] !== pageId;
  });

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  setText("#pageSectionLabel", page.sectionLabel);
  setText("#pageTitle", page.title);
  setText("#pageDescription", page.description);
  setText("#hudPageLabel", page.label);

  const tags = document.querySelector("#pageTags");
  if (tags) {
    tags.innerHTML = page.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  }
}

function setActivePage(pageId, options = {}) {
  state.preferences.activePage = normalizePage(pageId);
  if (state.preferences.activePage !== "research" && state.earningsDrawerOpen) {
    toggleEarningsDrawer(false);
  }
  applyPanelLayout();
  rerenderPageScopedPanels();
  if (state.preferences.activePage === "map") {
    void loadCompanyMap(state.preferences.detailSymbol);
  }
  schedulePreferenceSync();
  if (options.scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function normalizePage(pageId) {
  return PAGE_DEFINITIONS[pageId] ? pageId : "overview";
}

function normalizePanelLayout(panelLayout) {
  const input = Array.isArray(panelLayout) ? panelLayout : [];
  const seen = new Set();
  const normalized = input.filter((panelId) => {
    if (!DEFAULT_PANEL_LAYOUT.includes(panelId) || seen.has(panelId)) {
      return false;
    }
    seen.add(panelId);
    return true;
  });

  return [...normalized, ...DEFAULT_PANEL_LAYOUT.filter((panelId) => !seen.has(panelId))];
}

function rerenderPageScopedPanels() {
  const windowDays = Number(document.querySelector("#calendarWindow")?.value ?? 30);
  const filter = document.querySelector("#calendarFilter")?.value ?? "all";
  if (document.querySelector("#calendarList")) {
    renderCalendarPanel(state.calendarEvents, {
      filter,
      windowDays,
      grouped: normalizePage(state.preferences.activePage) === "calendar",
    });
  }
  if (document.querySelector("#newsList")) {
    renderNewsPanel(state.newsItems);
  }
  if (document.querySelector("#marketEventsList")) {
    renderMarketEventsPanel(state.marketEvents);
  }
}

function normalizePanelSizes(panelSizes) {
  const input = panelSizes && typeof panelSizes === "object" ? panelSizes : {};
  const normalized = {};
  for (const panelId of DEFAULT_PANEL_LAYOUT) {
    const fallback = DEFAULT_PANEL_SIZES[panelId] ?? 3;
    const value = Number(input[panelId]);
    normalized[panelId] = clamp(Number.isFinite(value) ? Math.round(value) : fallback, 3, 12);
  }
  return normalized;
}

function panelSpan(panelId) {
  const activePage = normalizePage(state.preferences.activePage);
  const pageSpan = PAGE_PANEL_SPANS[activePage]?.[panelId];
  if (Number.isFinite(pageSpan)) {
    return pageSpan;
  }
  return normalizePanelSizes(state.preferences.panelSizes)[panelId] ?? DEFAULT_PANEL_SIZES[panelId] ?? 3;
}

function startPanelResize(panel, event) {
  event.preventDefault();
  const dashboard = document.querySelector("#dashboardGrid");
  if (!dashboard) {
    return;
  }

  state.resizePanelId = panel.id;
  panel.classList.add("panel-resizing");
  const dashboardRect = dashboard.getBoundingClientRect();
  const styles = window.getComputedStyle(dashboard);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "8") || 8;
  const columnWidth = (dashboardRect.width - gap * 11) / 12;
  const startSpan = panelSpan(panel.id);
  const startX = event.clientX;

  const onMove = (moveEvent) => {
    const deltaColumns = Math.round((moveEvent.clientX - startX) / (columnWidth + gap));
    const nextSpan = clamp(startSpan + deltaColumns, 3, 12);
    state.preferences.panelSizes = {
      ...normalizePanelSizes(state.preferences.panelSizes),
      [panel.id]: nextSpan,
    };
    applyPanelLayout();
  };

  const onUp = () => {
    panel.classList.remove("panel-resizing");
    state.resizePanelId = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    schedulePreferenceSync();
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function clearPanelDropState() {
  document.querySelectorAll(".panel-drop-before, .panel-drop-after").forEach((node) => {
    node.classList.remove("panel-drop-before", "panel-drop-after");
  });
}

function dropDirection(target, event) {
  const rect = target.getBoundingClientRect();
  return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
}

async function loadSession(reloadUserData = false) {
  try {
    const session = await api("/api/auth/session");
    if (!session.authenticated) {
      teardownAuthenticatedState();
      renderHud();
      return;
    }

    state.authenticated = true;
    state.user = session.user;
    state.counts = session.counts ?? null;
    state.activity = session.recentActivity ?? [];

    const profile = await api("/api/profile");
    state.preferences = mergePreferences(profile.preferences);
    applyPanelLayout();
    applyPreferencesToInputs();

    if (reloadUserData || !state.workspaces.length) {
      await Promise.all([loadWorkspaces(), loadAlerts(), loadDestinations(), loadDigests(), loadNotes(), loadActivity()]);
    }

    connectActivityStream();
    renderAuth();
    renderProtectedGuards();
    renderPortfolio();
    renderAlerts();
    renderDestinations();
    renderDigests();
    renderResearchRail();
    renderNotes();
    renderWorkspaces();
    renderActivity();
    renderHud();
  } catch (error) {
    teardownAuthenticatedState();
    renderHud();
    showStatus(error.message, true);
  }
}

function teardownAuthenticatedState() {
  state.authenticated = false;
  state.user = null;
  state.counts = null;
  state.alerts = [];
  state.destinations = [];
  state.digests = [];
  state.notes = [];
  state.workspaces = [];
  state.activity = [];
  state.selectedWorkspaceId = null;
  state.selectedNoteId = null;
  state.currentEarnings = null;
  state.preferences = mergePreferences(loadStore(GUEST_PREFERENCES_KEY, DEFAULT_PREFERENCES));
  toggleEarningsDrawer(false);
  applyPanelLayout();
  applyPreferencesToInputs();
  renderResearchRail();
  disconnectActivity();
  renderHud();
}

async function loadWorkspaces() {
  if (!state.authenticated) {
    state.workspaces = [];
    renderHud();
    return;
  }
  const payload = await api("/api/workspaces");
  state.workspaces = payload.workspaces;
  renderHud();
}

async function loadAlerts() {
  if (!state.authenticated) {
    state.alerts = [];
    renderHud();
    return;
  }
  const payload = await api("/api/alerts");
  state.alerts = payload.alerts;
  renderHud();
}

async function loadDestinations() {
  if (!state.authenticated) {
    state.destinations = [];
    return;
  }
  const payload = await api("/api/destinations");
  state.destinations = payload.destinations;
}

async function loadDigests() {
  if (!state.authenticated) {
    state.digests = [];
    renderHud();
    return;
  }
  const payload = await api("/api/digests");
  state.digests = payload.digests;
  renderHud();
}

async function loadNotes() {
  if (!state.authenticated) {
    state.notes = [];
    return;
  }
  const payload = await api("/api/notes");
  state.notes = payload.notes;
}

async function loadActivity() {
  if (!state.authenticated) {
    state.activity = [];
    return;
  }
  const payload = await api("/api/activity");
  state.activity = payload.activity;
}

async function loadMarketPulse() {
  try {
    const payload = await api("/api/market-pulse");
    state.latestPulseCount = payload.cards.length;
    markFeedHeartbeat("Live");
    document.querySelector("#marketPulseBoard").innerHTML = payload.cards
      .map(
        (quote) => `
          <article class="pulse-card">
            <div class="meta">${escapeHtml(quote.symbol)}</div>
            <div class="value">${formatMoney(quote.price)}</div>
            <div class="${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</div>
            <div class="meta">${escapeHtml(quote.shortName ?? quote.exchange ?? "")}</div>
          </article>
        `,
      )
      .join("");

    document.querySelector("#leadersList").innerHTML = payload.leaders.map(renderQuoteListItem).join("");
    document.querySelector("#laggardsList").innerHTML = payload.laggards.map(renderQuoteListItem).join("");
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function loadHeatmap(force = false) {
  try {
    const payload = await api(`/api/heatmap${force ? "?force=1" : ""}`);
    state.heatmap = payload;
    syncSectorSelector(payload.sectors ?? []);
    document.querySelector("#heatmapSummary").innerHTML = renderHeatmapSummary(payload);
    document.querySelector("#heatmapWarnings").innerHTML = renderHeatmapWarnings(payload.warnings ?? []);
    setText("#heatmapAsOf", payload.asOf ? `Updated ${formatDateTime(payload.asOf)}` : "Awaiting heatmap sync");
    document.querySelector("#heatmapSource").innerHTML = payload.source?.url
      ? `<a href="${safeUrl(payload.source.url)}" target="_blank" rel="noreferrer">${escapeHtml(payload.source.label ?? "Source")}</a>`
      : escapeHtml(payload.source?.label ?? "Public universe");
    document.querySelector("#sp500Heatmap").innerHTML = renderHeatmapTiles(payload);
    markFeedHeartbeat("Live");

    const preferredSymbol = (payload.tiles ?? []).some((tile) => tile.symbol === state.preferences.detailSymbol)
      ? state.preferences.detailSymbol
      : payload.tiles?.[0]?.symbol ?? null;
    if (preferredSymbol) {
      await focusHeatmapSymbol(preferredSymbol);
    }
  } catch (error) {
    setFeedStatus("Degraded");
    document.querySelector("#heatmapWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
  }
}

async function loadSectorBoard(force = false) {
  const sector = String(state.preferences.sectorFocus ?? "").trim();
  try {
    const payload = await api(`/api/sector-board?sector=${encodeURIComponent(sector)}${force ? "&force=1" : ""}`);
    state.sectorBoard = payload;
    state.preferences.sectorFocus = payload.sector ?? sector;
    syncSectorSelector(state.heatmap?.sectors ?? [], payload.sector);
    document.querySelector("#sectorBoardSummary").innerHTML = renderSectorBoardSummary(payload);
    document.querySelector("#sectorBoardWarnings").innerHTML = renderHeatmapWarnings(payload.warnings ?? []);
    document.querySelector("#sectorBoardTitle").textContent = `${payload.sector ?? "Sector"} board`;
    document.querySelector("#sectorBoardMeta").textContent =
      `${payload.summary?.names ?? 0} names | ${payload.asOf ? `updated ${formatDateTime(payload.asOf)}` : "awaiting sync"}`;
    document.querySelector("#sectorNewsMeta").textContent = payload.news?.length
      ? `Public source blend for ${payload.sector}`
      : `No sector headlines available for ${payload.sector}`;
    document.querySelector("#sectorBoardTiles").innerHTML = renderSectorBoardTiles(payload.items ?? []);
    document.querySelector("#sectorLeadersList").innerHTML = (payload.leaders ?? []).map(renderQuoteListItem).join("")
      || renderIntelEmpty("No leaders available.");
    document.querySelector("#sectorLaggardsList").innerHTML = (payload.laggards ?? []).map(renderQuoteListItem).join("")
      || renderIntelEmpty("No laggards available.");
    document.querySelector("#sectorNewsList").innerHTML = renderCompactNewsFeed(payload.news ?? []);
    document.querySelector("#sectorBoardBody").innerHTML = renderSectorBoardRows(payload.items ?? []);
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#sectorBoardWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
  }
}

async function focusHeatmapSymbol(symbol, force = false) {
  const clean = String(symbol ?? "").trim().toUpperCase();
  if (!clean) {
    return;
  }

  state.heatmapFocusSymbol = clean;
  highlightHeatmapFocus();
  const cached = state.heatmapContextCache.get(clean);
  if (cached && !force) {
    renderHeatmapContext(cached);
    return;
  }

  const token = ++state.heatmapContextToken;
  document.querySelector("#heatmapDetailTitle").textContent = `${clean} context`;
  document.querySelector("#heatmapDetailMeta").textContent = "Loading live multi-source context...";
  document.querySelector("#heatmapDetailSummary").innerHTML =
    `<div class="meta">Collecting live headlines, filings, earnings context, and relationship signals for ${escapeHtml(clean)}.</div>`;

  try {
    const payload = await api(`/api/heatmap-context?symbol=${encodeURIComponent(clean)}`);
    state.heatmapContextCache.set(clean, payload);
    if (token !== state.heatmapContextToken || state.heatmapFocusSymbol !== clean) {
      return;
    }
    renderHeatmapContext(payload);
  } catch (error) {
    if (token !== state.heatmapContextToken || state.heatmapFocusSymbol !== clean) {
      return;
    }
    document.querySelector("#heatmapDetailSummary").innerHTML =
      `<div class="meta">Context unavailable for ${escapeHtml(clean)}: ${escapeHtml(error.message)}</div>`;
    document.querySelector("#heatmapCatalysts").innerHTML = "";
    document.querySelector("#heatmapReferencesBody").innerHTML =
      `<tr><td colspan="3" class="muted">No live references are available right now.</td></tr>`;
  }
}

async function loadFlow(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 16);
  if (!symbols.length) {
    document.querySelector("#flowSummary").innerHTML = "";
    document.querySelector("#flowWarnings").innerHTML = "";
    document.querySelector("#flowBody").innerHTML = "";
    return;
  }

  try {
    const payload = await api(`/api/flow?symbols=${encodeURIComponent(symbols.join(","))}${force ? "&force=1" : ""}`);
    state.flow = payload;
    document.querySelector("#flowSummary").innerHTML = renderFlowSummary(payload.summary ?? {});
    document.querySelector("#flowWarnings").innerHTML = renderHeatmapWarnings(payload.warnings ?? []);
    document.querySelector("#flowBody").innerHTML = renderFlowRows(payload.rows ?? []);
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#flowWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
  }
}

async function loadCompanyMap(symbol, force = false) {
  const clean = String(symbol ?? state.preferences.detailSymbol ?? "").trim().toUpperCase();
  if (!clean) {
    return;
  }

  try {
    const payload = await fetchCompanyMap(clean, force);
    state.companyMap = payload;
    document.querySelector("#companyMapSymbol").value = clean;
    if (document.querySelector("#companyMapCompareSymbol")) {
      document.querySelector("#companyMapCompareSymbol").value = state.preferences.companyMapCompareSymbol ?? "";
    }
    document.querySelector("#companyMapSummary").innerHTML = renderCompanyMapSummary(payload);
    document.querySelector("#companyMapWarnings").innerHTML = [
      `<div class="panel-status-chip">${escapeHtml(payload.coverage?.curated ? "Curated + public map" : "Public + fallback map")}</div>`,
      `<div class="panel-status-chip">${escapeHtml(`${payload.indices?.length ?? 0} major indices`)}</div>`,
      `<div class="panel-status-chip">${escapeHtml(payload.market?.analystRating ?? "street n/a")}</div>`,
    ].join("");
    document.querySelector("#companyMapHeadline").innerHTML = `
      <p class="section-label">${escapeHtml(payload.market?.sector ?? "Public company map")}</p>
      <h3>${escapeHtml(payload.companyName ?? payload.symbol)}</h3>
      <p>${escapeHtml(payload.summary ?? "No company map summary is available from the current public sources.")}</p>
    `;
    document.querySelector("#companyMapCoverage").innerHTML = (payload.coverage?.notes ?? [])
      .map((note, index) => renderIntelNote(note, index))
      .join("") || renderIntelEmpty("No company-map coverage notes are available.");
    document.querySelector("#companyMapIndices").innerHTML = renderCompanyMapIndices(payload.indices ?? []);
    document.querySelector("#companyMapSuppliers").innerHTML = renderCompanyMapRelations(
      payload.suppliers ?? [],
      "No supplier or upstream public links are available.",
    );
    document.querySelector("#companyMapCustomers").innerHTML = renderCompanyMapRelations(
      payload.customers ?? [],
      "No downstream or customer-side public links are available.",
    );
    document.querySelector("#companyMapCompetitorBody").innerHTML = renderCompanyMapCompetitors(payload.competitors ?? []);
    document.querySelector("#companyMapHoldersBody").innerHTML = renderCompanyMapHolders(payload.holders ?? []);
    document.querySelector("#companyMapBoard").innerHTML = renderCompanyMapBoard(payload.board ?? []);
    document.querySelector("#companyMapInsiders").innerHTML = renderCompanyMapInsiders(payload.insiderHolders ?? [], payload.insiderTransactions ?? []);
    mountIntelGraph(document.querySelector("#companyMapGraph"), payload.graph, payload.symbol);
    mountGeoExposureChart(document.querySelector("#companyMapGeo"), payload.geography);
    await loadCompanyMapComparison(payload, force);
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#companyMapWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    renderCompanyMapCompare(null, null);
    showStatus(error.message, true);
  }
}

async function fetchCompanyMap(symbol, force = false) {
  return api(`/api/company-map?symbol=${encodeURIComponent(symbol)}${force ? "&force=1" : ""}`);
}

async function loadCompanyMapComparison(primaryPayload, force = false) {
  const compareSymbol = String(state.preferences.companyMapCompareSymbol ?? "").trim().toUpperCase();
  if (!compareSymbol || compareSymbol === primaryPayload?.symbol) {
    state.companyMapCompare = null;
    renderCompanyMapCompare(
      primaryPayload,
      null,
      compareSymbol && compareSymbol === primaryPayload?.symbol
        ? "Choose a different compare symbol to open a true side-by-side company map."
        : "",
    );
    return;
  }

  try {
    const payload = await fetchCompanyMap(compareSymbol, force);
    state.companyMapCompare = payload;
    renderCompanyMapCompare(primaryPayload, payload);
  } catch (error) {
    state.companyMapCompare = null;
    renderCompanyMapCompare(primaryPayload, null, error.message);
  }
}

async function loadWatchlist(symbols) {
  if (!symbols.length) {
    return;
  }

  try {
    const payload = await api(`/api/quote?symbols=${encodeURIComponent(symbols.join(","))}`);
    markFeedHeartbeat("Live");
    payload.quotes.forEach((quote) => {
      state.latestQuotes.set(quote.symbol, quote);
    });

    document.querySelector("#watchlistSummary").innerHTML = renderWatchlistSummary(payload.quotes);
    document.querySelector("#watchlistBody").innerHTML = payload.quotes
      .map((quote, index) => renderWatchlistRow(quote, index))
      .join("");

    document.querySelector("#watchlistStatus").textContent = `Tracking ${payload.quotes.length} symbols.`;
    renderSymbolRibbon();
    void loadResearchRail();
    renderPortfolio();
    renderHud();
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function loadResearchRail(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 18);
  if (!symbols.length) {
    state.researchRailItems = [];
    renderResearchRail();
    return;
  }

  try {
    const payload = await api(`/api/research-rail?symbols=${encodeURIComponent(symbols.join(","))}${force ? "&force=1" : ""}`);
    state.researchRailItems = payload.items ?? [];
    renderResearchRail();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadWatchlistEvents() {
  const symbols = state.preferences.watchlistSymbols.slice(0, 8);
  if (!symbols.length) {
    return;
  }

  try {
    const payload = await api(`/api/watchlist-events?symbols=${encodeURIComponent(symbols.join(","))}`);
    document.querySelector("#watchlistEvents").innerHTML = payload.events
      .map(
        (entry) => `
          <div class="list-item">
            <div>
              <strong>${escapeHtml(entry.symbol)} · ${escapeHtml(entry.filing.form ?? "n/a")}</strong>
              <div class="meta">${escapeHtml(entry.companyName ?? "")} | filed ${escapeHtml(entry.filing.filingDate ?? "n/a")}</div>
            </div>
            <div class="muted">${escapeHtml(entry.filing.primaryDocument ?? "")}</div>
          </div>
        `,
      )
      .join("");
    renderHud();
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadDetail(symbol) {
  const range = document.querySelector("#historyRange").value;
  const interval = resolveHistoryInterval(range);
  state.currentHistoryRange = range;

  try {
    const [quoteResult, companyResult, historyResult, optionsResult] = await Promise.allSettled([
      api(`/api/quote?symbols=${encodeURIComponent(symbol)}`),
      api(`/api/company?symbol=${encodeURIComponent(symbol)}`),
      api(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`),
      api(`/api/options?symbol=${encodeURIComponent(symbol)}`),
    ]);

    const quotePayload = quoteResult.status === "fulfilled" ? quoteResult.value : { quotes: [] };
    const company =
      companyResult.status === "fulfilled"
        ? companyResult.value
        : {
            symbol,
            warnings: [companyResult.reason?.message ?? "Company profile unavailable."],
            market: { shortName: symbol },
            sec: { filings: [], facts: {} },
          };
    const history =
      historyResult.status === "fulfilled"
        ? historyResult.value
        : { symbol, range, interval, points: [] };
    const options =
      optionsResult.status === "fulfilled"
        ? optionsResult.value
        : { symbol, calls: [], puts: [], warning: optionsResult.reason?.message ?? "Options unavailable." };

    const warnings = [
      ...(company.warnings ?? []),
      historyResult.status === "rejected" ? `Price history unavailable for ${symbol}.` : null,
    ]
      .map((message) => normalizeWorkbenchWarning(message))
      .filter(Boolean)
      .filter((message, index, all) => all.indexOf(message) === index);

    const quote = quotePayload.quotes[0] ?? null;
    if (quote) {
      state.latestQuotes.set(quote.symbol, quote);
    }
    state.currentDetailQuote = quote ?? null;
    state.currentCompany = company;
    state.currentOptions = options;
    configureEarningsInterface(quote, company);

    renderWorkbenchIdentity(quote, company.market);
    renderDetailMetrics(quote, company.market);
    document.querySelector("#workbenchSummary").innerHTML = renderWorkbenchSummary(quote, company, history.points);
    renderDetailWarnings(warnings);
    renderPriceChart(history.points, symbol);
    renderOverview(company, quote);
    renderCompanyFacts(company, quote);
    renderFilings(company.sec.filings);
    renderOptions(options, quote);
    document.querySelector("#optionsSummary").innerHTML = renderOptionsSummary(options, quote);
    renderSymbolRibbon();
    renderResearchRail();
    renderPortfolio();
    if (supportsEarningsIntel(quote, company)) {
      await Promise.all([loadIntelligence(symbol), loadEarningsIntel(symbol)]);
    } else {
      state.currentEarnings = buildNotApplicableEarningsPayload(quote, company);
      renderEarningsDrawer(state.currentEarnings);
      await loadIntelligence(symbol);
    }
    renderHud();
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function loadDeskCalendar(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 16);
  const filter = document.querySelector("#calendarFilter")?.value ?? "all";
  const windowDays = Number(document.querySelector("#calendarWindow")?.value ?? 30);

  try {
    const payload = await api(`/api/calendar?symbols=${encodeURIComponent(symbols.join(","))}&window=${encodeURIComponent(windowDays)}${force ? "&force=1" : ""}`);
    state.calendarEvents = payload.events ?? [];
    document.querySelector("#calendarSummary").innerHTML = renderCalendarSummary(state.calendarEvents, windowDays);
    renderCalendarPanel(state.calendarEvents, {
      filter,
      windowDays,
      grouped: normalizePage(state.preferences.activePage) === "calendar",
    });
    if (document.querySelector("#calendarWarnings")) {
      document.querySelector("#calendarWarnings").innerHTML = renderHeatmapWarnings(payload.warnings ?? []);
    }
    markFeedHeartbeat("Live");
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadDeskNews(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 8);
  const query = String(state.preferences.newsFocus ?? "").trim();
  const focusSymbol = query ? inferNewsFocusSymbol(query) : null;

  try {
    const payload = await api(
      `/api/news?symbols=${encodeURIComponent(symbols.join(","))}${focusSymbol ? `&focusSymbol=${encodeURIComponent(focusSymbol)}` : ""}${query ? `&q=${encodeURIComponent(query)}` : ""}${force ? "&force=1" : ""}`,
    );
    state.newsItems = payload.items ?? [];
    document.querySelector("#newsSummary").innerHTML = renderNewsSummary(state.newsItems, query || focusSymbol);
    document.querySelector("#newsStatus").innerHTML = renderNewsStatus(payload.asOf, query, focusSymbol);
    renderNewsPanel(state.newsItems);
    markFeedHeartbeat("Live");
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadEarningsIntel(symbol, options = {}) {
  const peers = state.preferences.watchlistSymbols.filter((entry) => entry !== symbol).slice(0, 10);

  try {
    const payload = await api(
      `/api/earnings?symbol=${encodeURIComponent(symbol)}&peerSymbols=${encodeURIComponent(peers.join(","))}`,
    );
    state.currentEarnings = payload;
    renderEarningsDrawer(payload);
    if (options.forceOpen) {
      toggleEarningsDrawer(true);
    }
  } catch (error) {
    state.currentEarnings = null;
    renderEarningsDrawer(null, error.message);
    if (options.forceOpen) {
      toggleEarningsDrawer(true);
    }
  }
}

async function loadMarketEvents(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 16);
  const focusSymbol = state.preferences.detailSymbol;

  try {
    const payload = await api(
      `/api/market-events?symbols=${encodeURIComponent(symbols.join(","))}&focusSymbol=${encodeURIComponent(focusSymbol)}${force ? "&force=1" : ""}`,
    );
    state.marketEvents = payload.events ?? [];
    document.querySelector("#marketEventsSummary").innerHTML = renderMarketEventsSummary(payload.summary ?? {});
    renderMarketEventsPanel(payload.events ?? []);
    markFeedHeartbeat("Live");
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function loadMacro() {
  try {
    const payload = await api("/api/macro");
    markFeedHeartbeat("Live");
    document.querySelector("#macroFacts").innerHTML = [
      fact("Unemployment", payload.unemploymentRate?.display ?? "n/a", payload.unemploymentRate?.date),
      fact("Inflation YoY", payload.inflationYoY?.display ?? "n/a", payload.asOf),
      fact("Nonfarm Payrolls", payload.nonfarmPayrolls?.display ?? "n/a", payload.nonfarmPayrolls?.date),
    ].join("");
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function loadYieldCurve() {
  try {
    const payload = await api("/api/yield-curve");
    markFeedHeartbeat("Live");
    mountBarChart(document.querySelector("#yieldCurveChart"), {
      title: "Yield Curve",
      subtitle: `Treasury daily curve as of ${payload.asOf}`,
      points: payload.points.map((point) => ({
        label: point.tenor,
        value: point.value,
        meta: payload.asOf,
      })),
      valueFormatter: (value) => `${Number(value).toFixed(2)}%`,
      accent: "#7cc5ff",
    });
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function loadOrderBook(product) {
  try {
    const payload = await api(`/api/crypto/orderbook?product=${encodeURIComponent(product)}`);
    markFeedHeartbeat("Live");
    document.querySelector("#bidsBody").innerHTML = payload.bids
      .map(
        (entry) => `
          <tr>
            <td class="positive">${formatMoney(entry.price)}</td>
            <td>${formatNumber(entry.size, 5)}</td>
            <td>${entry.orders}</td>
          </tr>
        `,
      )
      .join("");
    document.querySelector("#asksBody").innerHTML = payload.asks
      .map(
        (entry) => `
          <tr>
            <td class="negative">${formatMoney(entry.price)}</td>
            <td>${formatNumber(entry.size, 5)}</td>
            <td>${entry.orders}</td>
          </tr>
        `,
      )
      .join("");
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

async function runScreen() {
  try {
    const params = new URLSearchParams();
    params.set("symbols", state.preferences.screenConfig.symbols);
    if (state.preferences.screenConfig.maxPe) params.set("maxPe", state.preferences.screenConfig.maxPe);
    if (state.preferences.screenConfig.minMarketCap) params.set("minMarketCap", state.preferences.screenConfig.minMarketCap);
    if (state.preferences.screenConfig.minVolume) params.set("minVolume", state.preferences.screenConfig.minVolume);
    if (state.preferences.screenConfig.minChangePct) params.set("minChangePct", state.preferences.screenConfig.minChangePct);

    const payload = await api(`/api/screener?${params.toString()}`);
    document.querySelector("#screenBody").innerHTML = payload.results
      .map(
        (quote) => `
          <tr>
            <td>${escapeHtml(quote.symbol)}</td>
            <td>${formatMoney(quote.price)}</td>
            <td class="${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</td>
            <td>${formatNumber(quote.trailingPe, 2)}</td>
            <td>${formatCompact(quote.volume)}</td>
            <td>${formatCompact(quote.marketCap)}</td>
          </tr>
        `,
      )
      .join("");
  } catch (error) {
    showStatus(error.message, true);
  }
}

async function runCompare() {
  try {
    const value = document.querySelector("#compareSymbolsInput").value.trim() || state.preferences.watchlistSymbols.join(",");
    const payload = await api(`/api/compare?symbols=${encodeURIComponent(value)}`);
    document.querySelector("#compareBody").innerHTML = payload.rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.symbol)}</td>
            <td>${formatMoney(row.price)}</td>
            <td class="${tone(row.changePercent)}">${formatPercent(row.changePercent)}</td>
            <td>${formatNumber(row.trailingPe, 2)}</td>
            <td>${formatNumber(row.forwardPe, 2)}</td>
            <td>${escapeHtml(row.sector ?? "n/a")}</td>
            <td>${escapeHtml(row.analystRating ?? "n/a")}</td>
          </tr>
        `,
      )
      .join("");
  } catch (error) {
    showStatus(error.message, true);
  }
}

function connectCrypto() {
  disconnectCrypto();
  const products = state.preferences.cryptoProducts;
  const board = document.querySelector("#cryptoBoard");
  let polling = false;

  const renderBoard = (status = "Streaming") => {
    markFeedHeartbeat(status);
    board.innerHTML = products
      .map((product) => renderCryptoCard(state.cryptoQuotes.get(product) ?? { productId: product }))
      .join("");
  };

  const startPolling = () => {
    if (polling) {
      return;
    }
    polling = true;
    disconnectCryptoStreamOnly();
    void pollCrypto(products, renderBoard);
    state.cryptoPollTimer = window.setInterval(() => {
      void pollCrypto(products, renderBoard);
    }, 5000);
  };

  if (preferPollingStreams()) {
    startPolling();
    return;
  }

  try {
    state.cryptoSource = new EventSource(`/api/stream/crypto?products=${encodeURIComponent(products.join(","))}`);
    state.cryptoSource.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      state.cryptoQuotes.set(payload.productId, payload);
      maybeShowAlertNotification(payload.productId, payload.price);
      renderBoard("Streaming");
    };

    state.cryptoSource.onerror = () => {
      setFeedStatus("Polling");
      showStatus("Crypto stream unavailable. Falling back to polling.", true);
      startPolling();
    };
  } catch {
    startPolling();
  }
}

function connectActivityStream() {
  disconnectActivity();
  if (!state.authenticated) {
    return;
  }

  const handlePayload = async (payload) => {
    if (payload.type === "session.ready") {
      return;
    }

    if (payload.payload?.activity) {
      state.activity.unshift(payload.payload.activity);
      state.activity = state.activity.slice(0, 50);
      renderActivity();
    } else {
      await loadActivity();
      renderActivity();
    }

    if (payload.type.startsWith("alert.")) {
      await loadAlerts();
      renderAlerts();
    }

    if (payload.type.startsWith("workspace.")) {
      await loadWorkspaces();
      renderWorkspaces();
    }

    if (payload.type.startsWith("destination.")) {
      await loadDestinations();
      renderDestinations();
      await loadDigests();
      renderDigests();
    }

    if (payload.type.startsWith("digest.")) {
      await loadDigests();
      renderDigests();
    }

    if (payload.type.startsWith("note.")) {
      await loadNotes();
      renderNotes();
    }

    if (payload.type === "alert.triggered") {
      const alert = payload.payload.alert;
      const price = payload.payload.activity?.metadata?.marketPrice;
      const message = `${alert.symbol} crossed ${alert.direction} ${formatMoney(alert.price)} at ${formatMoney(price)}.`;
      showStatus(message, false);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Open Market Terminal Alert", { body: message });
      }
    }
  };

  const startPolling = () => {
    if (state.activityPollTimer) {
      return;
    }
    void loadActivity().then(renderActivity).catch(() => {});
    state.activityPollTimer = window.setInterval(() => {
      void loadActivity().then(renderActivity).catch(() => {});
    }, 15000);
  };

  if (preferPollingStreams()) {
    startPolling();
    return;
  }

  try {
    state.activitySource = new EventSource("/api/stream/activity");
    state.activitySource.onmessage = async (event) => {
      await handlePayload(JSON.parse(event.data));
    };
    state.activitySource.onerror = () => {
      startPolling();
    };
  } catch {
    startPolling();
  };
}

function disconnectActivityStream() {
  if (state.activitySource) {
    state.activitySource.close();
    state.activitySource = null;
  }
}

function disconnectCryptoStreamOnly() {
  if (state.cryptoSource) {
    state.cryptoSource.close();
    state.cryptoSource = null;
  }
}

function disconnectCrypto() {
  disconnectCryptoStreamOnly();
  if (state.cryptoPollTimer) {
    window.clearInterval(state.cryptoPollTimer);
    state.cryptoPollTimer = null;
  }
}

function disconnectActivity() {
  disconnectActivityStream();
  if (state.activityPollTimer) {
    window.clearInterval(state.activityPollTimer);
    state.activityPollTimer = null;
  }
}

async function pollCrypto(products, renderBoard) {
  try {
    const payload = await api(`/api/crypto/ticker?products=${encodeURIComponent(products.join(","))}`);
    for (const item of payload.products ?? []) {
      state.cryptoQuotes.set(item.productId, item);
      maybeShowAlertNotification(item.productId, item.price);
    }
    renderBoard("Polling");
  } catch (error) {
    setFeedStatus("Degraded");
    showStatus(error.message, true);
  }
}

function preferPollingStreams() {
  return window.location.hostname.endsWith("vercel.app");
}

function renderAuth() {
  const summary = document.querySelector("#authSummary");
  const registerForm = document.querySelector("#registerForm");
  const loginForm = document.querySelector("#loginForm");
  const logoutButton = document.querySelector("#logoutButton");

  if (state.authenticated && state.user) {
    summary.innerHTML = `
      <div class="section-label">Signed In</div>
      <h2>${escapeHtml(state.user.name)}</h2>
      <p class="muted">${escapeHtml(state.user.email)}</p>
      <p class="muted">Workspaces: ${state.counts?.workspaces ?? state.workspaces.length} | Alerts: ${state.counts?.alerts ?? state.alerts.length} | Notes: ${state.counts?.notes ?? state.notes.length}</p>
    `;
    registerForm.hidden = true;
    loginForm.hidden = true;
    logoutButton.hidden = false;
  } else {
    summary.innerHTML = `
      <div class="section-label">Guest Mode</div>
      <h2>Browse public data immediately.</h2>
      <p class="muted">Create an account to unlock server alerts, saved workspaces, notes, and activity streaming.</p>
    `;
    registerForm.hidden = false;
    loginForm.hidden = false;
    logoutButton.hidden = true;
  }

  renderHud();
}

function renderHud() {
  setText("#hudMode", state.authenticated ? "Secure" : "Guest");
  setText("#hudFeedStatus", state.feedStatus);
  setText("#hudTrackedCount", String(state.preferences.watchlistSymbols.length));
  setText("#hudPulseCount", String(state.latestPulseCount));
  setText(
    "#hudAutomationCount",
    String((state.alerts?.length ?? 0) + (state.digests?.filter((digest) => digest.active).length ?? 0)),
  );
  setText("#hudWorkspaceCount", String(state.authenticated ? state.workspaces.length : 0));
  setText("#hudLastSync", state.lastSyncAt ? formatTime(state.lastSyncAt) : "Pending");
  setText("#hudIntelSymbol", `${state.preferences.detailSymbol} relationship focus`);
  setText("#deskPrimarySymbol", state.preferences.detailSymbol);
  setText("#deskPrimaryStatus", state.currentDetailQuote?.exchange ?? state.feedStatus);
}

function renderSymbolRibbon() {
  const container = document.querySelector("#symbolRibbon");
  if (!container) {
    return;
  }

  const symbols = state.preferences.watchlistSymbols.slice(0, 12);
  container.innerHTML = symbols
    .map((symbol) => {
      const quote = state.latestQuotes.get(symbol);
      return `
        <button
          type="button"
          class="symbol-ribbon-chip${symbol === state.preferences.detailSymbol ? " active" : ""} ${tone(quote?.changePercent)}"
          data-symbol="${escapeHtml(symbol)}"
        >
          <span>${escapeHtml(symbol)}</span>
          <strong>${formatMoney(quote?.price)}</strong>
        </button>
      `;
    })
    .join("");
}

function renderResearchRail() {
  const summary = document.querySelector("#researchRailSummary");
  const list = document.querySelector("#researchRailList");
  if (!summary || !list) {
    return;
  }

  const focusQuote = state.latestQuotes.get(state.preferences.detailSymbol) ?? state.currentDetailQuote ?? null;
  const pins = new Set(state.preferences.researchPinnedSymbols ?? []);
  const items = state.researchRailItems.length
    ? [...state.researchRailItems]
    : state.preferences.watchlistSymbols.slice(0, 18).map((symbol) => ({
        symbol,
        shortName: state.latestQuotes.get(symbol)?.shortName ?? "watchlist symbol",
        price: state.latestQuotes.get(symbol)?.price ?? null,
        changePercent: state.latestQuotes.get(symbol)?.changePercent ?? null,
        sector: "Unclassified",
        sparkline: [],
      }));

  const pinnedItems = items
    .filter((item) => pins.has(item.symbol))
    .sort((left, right) => state.preferences.researchPinnedSymbols.indexOf(left.symbol) - state.preferences.researchPinnedSymbols.indexOf(right.symbol));
  const grouped = [...items
    .filter((item) => !pins.has(item.symbol))
    .reduce((map, item) => {
      const key = item.sector ?? "Unclassified";
      const bucket = map.get(key) ?? [];
      bucket.push(item);
      map.set(key, bucket);
      return map;
    }, new Map())
    .entries()]
    .map(([sector, bucket]) => [sector, bucket.sort((left, right) => Math.abs(right.changePercent ?? 0) - Math.abs(left.changePercent ?? 0))])
    .sort((left, right) => left[0].localeCompare(right[0]));

  summary.innerHTML = `
    <div class="panel-status-chip">${escapeHtml(state.preferences.detailSymbol)} focus</div>
    <div class="panel-status-chip">${escapeHtml(String(pins.size))} pinned</div>
    <div class="panel-status-chip">${escapeHtml(humanizeInstrumentType(focusQuote))}</div>
    <div class="panel-status-chip">${escapeHtml(focusQuote?.exchange ?? state.feedStatus)}</div>
  `;

  list.innerHTML = items.length
    ? [
        pinnedItems.length
          ? `
            <section class="research-rail-group">
              <header class="research-rail-group-header">
                <strong>Pinned</strong>
                <span>${escapeHtml(String(pinnedItems.length))}</span>
              </header>
              ${pinnedItems.map((item, index) => renderResearchRailItem(item, index, true)).join("")}
            </section>
          `
          : "",
        ...grouped.map(([sector, bucket]) => `
          <section class="research-rail-group">
            <header class="research-rail-group-header">
              <strong>${escapeHtml(sector)}</strong>
              <span>${escapeHtml(String(bucket.length))}</span>
            </header>
            ${bucket.map((item, index) => renderResearchRailItem(item, index, false)).join("")}
          </section>
        `),
      ].join("")
    : renderIntelEmpty("Add symbols to the watchlist to populate the research rail.");

  list.querySelectorAll("[data-research-symbol]").forEach((button) => {
    button.addEventListener("click", async () => {
      await selectDetailSymbol(button.dataset.researchSymbol, { jump: false });
    });
    button.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        await selectDetailSymbol(button.dataset.researchSymbol, { jump: false });
      }
    });
  });

  list.querySelectorAll("[data-pin-symbol]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleResearchPin(button.dataset.pinSymbol);
    });
  });
}

function renderResearchRailItem(item, index, pinned) {
  return `
    <article
      class="research-rail-item ${tone(item.changePercent)}${item.symbol === state.preferences.detailSymbol ? " active" : ""}"
      data-research-symbol="${escapeHtml(item.symbol)}"
      tabindex="0"
      role="button"
      aria-label="Open ${escapeHtml(item.symbol)} in research workbench"
    >
      <div class="research-rail-rank">${String(index + 1).padStart(2, "0")}</div>
      <div class="research-rail-main">
        <div class="research-rail-head">
          <strong>${escapeHtml(item.symbol)}</strong>
          <div class="research-rail-actions">
            <span class="terminal-chip">${formatMoney(item.price)}</span>
            <button type="button" class="research-pin-button${pinned ? " pinned" : ""}" data-pin-symbol="${escapeHtml(item.symbol)}" aria-label="${pinned ? "Unpin" : "Pin"} ${escapeHtml(item.symbol)}">${pinned ? "★" : "☆"}</button>
          </div>
        </div>
        <div class="research-rail-meta">
          <span>${escapeHtml(truncateText(item.shortName ?? "watchlist symbol", 24))}</span>
          <span class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</span>
        </div>
        <div class="research-rail-tail">
          <span>${escapeHtml(truncateText(item.industry ?? item.sector ?? "Unclassified", 22))}</span>
          ${renderResearchSparkline(item.sparkline, item.changePercent)}
        </div>
      </div>
    </article>
  `;
}

function renderResearchSparkline(values, changePercent) {
  const points = (values ?? []).filter(Number.isFinite);
  if (points.length < 2) {
    return `<span class="research-sparkline-empty">${escapeHtml(formatPercent(changePercent))}</span>`;
  }

  const width = 84;
  const height = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 2) - 1;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return `
    <svg class="research-sparkline ${tone(changePercent)}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${path}"></path>
    </svg>
  `;
}

function toggleResearchPin(symbol) {
  const clean = String(symbol ?? "").trim().toUpperCase();
  if (!clean) {
    return;
  }

  const pins = new Set(state.preferences.researchPinnedSymbols ?? []);
  if (pins.has(clean)) {
    pins.delete(clean);
  } else {
    pins.add(clean);
  }
  state.preferences.researchPinnedSymbols = [...pins];
  renderResearchRail();
  schedulePreferenceSync();
}

function highlightHeatmapFocus() {
  document.querySelectorAll("[data-heatmap-symbol]").forEach((node) => {
    node.classList.toggle("active", node.dataset.heatmapSymbol === state.heatmapFocusSymbol);
  });
}

function groupHeatmapTiles(tiles) {
  return [...tiles.reduce((map, tile) => {
    const key = tile.sector ?? "Unclassified";
    const bucket = map.get(key) ?? [];
    bucket.push(tile);
    map.set(key, bucket);
    return map;
  }, new Map()).entries()]
    .map(([sector, items]) => [
      sector,
      [...items].sort((left, right) => (right.weight ?? 0) - (left.weight ?? 0)),
    ])
    .sort((left, right) => (sum(right[1].map((item) => item.weight)) ?? 0) - (sum(left[1].map((item) => item.weight)) ?? 0));
}

function syncSectorSelector(sectors, selectedSector = state.preferences.sectorFocus) {
  const select = document.querySelector("#sectorBoardSelect");
  if (!select) {
    return;
  }

  const ordered = (sectors ?? []).map((item) => item.sector).filter(Boolean);
  const preferred = selectedSector && ordered.includes(selectedSector) ? selectedSector : ordered[0] ?? selectedSector ?? "Technology";
  select.innerHTML = ordered
    .map((sector) => `<option value="${escapeHtml(sector)}">${escapeHtml(sector)}</option>`)
    .join("");
  if (preferred) {
    select.value = preferred;
    state.preferences.sectorFocus = preferred;
  }
}

function heatmapSectorSpan(weight) {
  if (!Number.isFinite(weight)) {
    return 2;
  }
  if (weight >= 24) {
    return 4;
  }
  if (weight >= 14) {
    return 3;
  }
  return 2;
}

function startHudClock() {
  const tick = () => {
    const now = new Date();
    const stamp = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")}`;
    setText("#hudClock", stamp);
  };

  tick();
  window.setInterval(tick, 1000);
}

function markFeedHeartbeat(status = "Live") {
  state.feedStatus = status;
  state.lastSyncAt = Date.now();
  renderHud();
}

function setFeedStatus(status) {
  state.feedStatus = status;
  renderHud();
}

function renderProtectedGuards() {
  const message = state.authenticated ? "" : "Sign in to use this server-backed feature.";
  for (const id of ["workspaceGuard", "notesGuard", "activityGuard", "alertsGuard", "opsGuard"]) {
    document.querySelector(`#${id}`).textContent = message;
  }
}

function renderWorkspaces() {
  const container = document.querySelector("#workspacesList");
  const selection = document.querySelector("#workspaceSelection");

  if (!state.authenticated) {
    container.innerHTML = "";
    selection.textContent = "";
    return;
  }

  const selected = state.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId) ?? null;
  selection.textContent = selected ? `Selected workspace: ${selected.name}` : "No workspace selected.";

  container.innerHTML = state.workspaces
    .map(
      (workspace) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(workspace.name)}${workspace.isDefault ? " · default" : ""}</strong>
            <div class="meta">Updated ${formatDate(workspace.updatedAt)}</div>
          </div>
          <div class="action-row">
            <button data-load-workspace="${workspace.id}" type="button">Load</button>
            <button data-delete-workspace="${workspace.id}" type="button" class="secondary">Delete</button>
          </div>
        </div>
      `,
    )
    .join("");

  container.querySelectorAll("[data-load-workspace]").forEach((button) => {
    button.addEventListener("click", async () => {
      const workspace = state.workspaces.find((item) => item.id === button.dataset.loadWorkspace);
      if (!workspace) {
        return;
      }
      state.selectedWorkspaceId = workspace.id;
      document.querySelector("#workspaceName").value = workspace.name;
      document.querySelector("#workspaceDefault").checked = Boolean(workspace.isDefault);
      applyWorkspaceSnapshot(workspace.snapshot);
      renderWorkspaces();
      showStatus(`Loaded workspace "${workspace.name}".`, false);
    });
  });

  container.querySelectorAll("[data-delete-workspace]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/workspaces/${button.dataset.deleteWorkspace}`, { method: "DELETE" });
        if (state.selectedWorkspaceId === button.dataset.deleteWorkspace) {
          state.selectedWorkspaceId = null;
        }
        await loadWorkspaces();
        renderWorkspaces();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
}

function renderNotes() {
  const container = document.querySelector("#notesList");
  if (!state.authenticated) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.notes
    .map(
      (note) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(note.title)}</strong>
            <div class="meta">${escapeHtml(trimPreview(note.content))}</div>
          </div>
          <div class="action-row">
            <button data-edit-note="${note.id}" type="button">Edit</button>
            <button data-delete-note="${note.id}" type="button" class="secondary">Delete</button>
          </div>
        </div>
      `,
    )
    .join("");

  container.querySelectorAll("[data-edit-note]").forEach((button) => {
    button.addEventListener("click", () => {
      const note = state.notes.find((item) => item.id === button.dataset.editNote);
      if (!note) {
        return;
      }
      state.selectedNoteId = note.id;
      document.querySelector("#noteTitle").value = note.title;
      document.querySelector("#noteContent").value = note.content;
    });
  });

  container.querySelectorAll("[data-delete-note]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/notes/${button.dataset.deleteNote}`, { method: "DELETE" });
        if (state.selectedNoteId === button.dataset.deleteNote) {
          state.selectedNoteId = null;
          document.querySelector("#noteForm").reset();
        }
        await loadNotes();
        renderNotes();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
}

function renderAlerts() {
  const container = document.querySelector("#alertsList");
  if (!state.authenticated) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.alerts
    .map(
      (alert) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(alert.symbol)} · ${escapeHtml(alert.direction)}</strong>
            <div class="meta">${formatMoney(alert.price)} | ${alert.active ? "active" : `triggered ${formatDate(alert.triggeredAt)}`}</div>
          </div>
          <button data-delete-alert="${alert.id}" type="button" class="secondary">Delete</button>
        </div>
      `,
    )
    .join("");

  container.querySelectorAll("[data-delete-alert]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/alerts/${button.dataset.deleteAlert}`, { method: "DELETE" });
        await loadAlerts();
        renderAlerts();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
}

function renderDestinations() {
  const container = document.querySelector("#destinationsList");
  renderDigestDestinationOptions();
  if (!state.authenticated) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.destinations
    .map(
      (destination) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(destination.label)}</strong>
            <div class="meta">${escapeHtml(destination.kind)} · ${escapeHtml(destination.target)} · ${escapeHtml(destination.purposes.join(", "))}</div>
          </div>
          <button data-delete-destination="${destination.id}" type="button" class="secondary">Delete</button>
        </div>
      `,
    )
    .join("");

  container.querySelectorAll("[data-delete-destination]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/destinations/${button.dataset.deleteDestination}`, { method: "DELETE" });
        await Promise.all([loadDestinations(), loadDigests()]);
        renderDestinations();
        renderDigests();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
}

function renderDigests() {
  const container = document.querySelector("#digestsList");
  renderDigestDestinationOptions();
  if (!state.authenticated) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.digests
    .map(
      (digest) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(digest.name)}</strong>
            <div class="meta">${escapeHtml(digest.frequency)} · next ${formatDate(digest.nextRunAt)} · ${digest.active ? "active" : "paused"}</div>
            <div class="meta">${escapeHtml((digest.symbols ?? []).join(", "))}</div>
          </div>
          <div class="action-row">
            <button data-edit-digest="${digest.id}" type="button">Edit</button>
            <button data-delete-digest="${digest.id}" type="button" class="secondary">Delete</button>
          </div>
        </div>
      `,
    )
    .join("");

  container.querySelectorAll("[data-edit-digest]").forEach((button) => {
    button.addEventListener("click", () => {
      const digest = state.digests.find((item) => item.id === button.dataset.editDigest);
      if (!digest) {
        return;
      }
      state.selectedDigestId = digest.id;
      document.querySelector("#digestName").value = digest.name;
      document.querySelector("#digestSymbols").value = (digest.symbols ?? []).join(",");
      document.querySelector("#digestFrequency").value = digest.frequency;
      document.querySelector("#digestActive").checked = Boolean(digest.active);
      const destinationSelect = document.querySelector("#digestDestinations");
      for (const option of destinationSelect.options) {
        option.selected = (digest.destinationIds ?? []).includes(option.value);
      }
    });
  });

  container.querySelectorAll("[data-delete-digest]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await api(`/api/digests/${button.dataset.deleteDigest}`, { method: "DELETE" });
        if (state.selectedDigestId === button.dataset.deleteDigest) {
          state.selectedDigestId = null;
          document.querySelector("#digestForm").reset();
          document.querySelector("#digestActive").checked = true;
        }
        await loadDigests();
        renderDigests();
      } catch (error) {
        showStatus(error.message, true);
      }
    });
  });
}

function renderDigestDestinationOptions() {
  const select = document.querySelector("#digestDestinations");
  if (!select) {
    return;
  }
  const digestTargets = state.destinations.filter((destination) => destination.purposes.includes("digest"));
  select.innerHTML = digestTargets
    .map(
      (destination) =>
        `<option value="${escapeHtml(destination.id)}">${escapeHtml(destination.label)} · ${escapeHtml(destination.kind)}</option>`,
    )
    .join("");
}

function renderActivity() {
  const container = document.querySelector("#activityList");
  if (!state.authenticated) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = state.activity
    .map(
      (item) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(item.message ?? item.type)}</strong>
            <div class="meta">${escapeHtml(item.type)} | ${formatDate(item.createdAt)}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderPortfolio() {
  const body = document.querySelector("#portfolioBody");
  body.innerHTML = state.preferences.portfolio
    .map((position) => {
      const quote = state.latestQuotes.get(position.symbol);
      const last = quote?.price ?? null;
      const marketValue = Number.isFinite(last) ? last * position.quantity : null;
      const pnl = Number.isFinite(last) ? (last - position.cost) * position.quantity : null;
      return `
        <tr>
          <td>${escapeHtml(position.symbol)}</td>
          <td>${formatNumber(position.quantity, 4)}</td>
          <td>${formatMoney(position.cost)}</td>
          <td>${formatMoney(last)}</td>
          <td>${formatMoney(marketValue)}</td>
          <td class="${tone(pnl)}">${formatMoney(pnl)}</td>
          <td><button data-remove-position="${position.id}" type="button" class="secondary">Remove</button></td>
        </tr>
      `;
    })
    .join("");

  body.querySelectorAll("[data-remove-position]").forEach((button) => {
    button.addEventListener("click", () => {
      state.preferences.portfolio = state.preferences.portfolio.filter(
        (position) => position.id !== button.dataset.removePosition,
      );
      persistGuestPreferencesIfNeeded();
      schedulePreferenceSync();
      renderPortfolio();
    });
  });
}

function applyPreferencesToInputs() {
  document.querySelector("#watchlistInput").value = state.preferences.watchlistSymbols.join(",");
  document.querySelector("#detailSymbol").value = state.preferences.detailSymbol;
  if (document.querySelector("#companyMapSymbol")) {
    document.querySelector("#companyMapSymbol").value = state.preferences.detailSymbol;
  }
  if (document.querySelector("#companyMapCompareSymbol")) {
    document.querySelector("#companyMapCompareSymbol").value = state.preferences.companyMapCompareSymbol ?? "";
  }
  document.querySelector("#newsFocusInput").value = state.preferences.newsFocus ?? "";
  if (document.querySelector("#sectorBoardSelect")) {
    document.querySelector("#sectorBoardSelect").value = state.preferences.sectorFocus ?? "";
  }
  document.querySelector("#historyRange").value = state.currentHistoryRange;
  document.querySelector("#screenSymbols").value = state.preferences.screenConfig.symbols;
  document.querySelector("#screenMaxPe").value = state.preferences.screenConfig.maxPe;
  document.querySelector("#screenMinCap").value = state.preferences.screenConfig.minMarketCap;
  document.querySelector("#screenMinVolume").value = state.preferences.screenConfig.minVolume;
  document.querySelector("#screenMinChange").value = state.preferences.screenConfig.minChangePct;
  document.querySelector("#compareSymbolsInput").value = state.preferences.watchlistSymbols.join(",");
  applyCryptoPreferences();
  renderSymbolRibbon();
  renderResearchRail();
  renderHud();
}

function applyCryptoPreferences() {
  document.querySelector("#cryptoProductsInput").value = state.preferences.cryptoProducts.join(",");
  const select = document.querySelector("#orderBookProduct");
  const current = currentOrderBookProduct();
  select.innerHTML = state.preferences.cryptoProducts
    .map((product) => `<option value="${escapeHtml(product)}">${escapeHtml(product)}</option>`)
    .join("");
  if (state.preferences.cryptoProducts.includes(current)) {
    select.value = current;
  } else {
    select.value = state.preferences.cryptoProducts[0] ?? "BTC-USD";
  }
}

function applyWorkspaceSnapshot(snapshot) {
  state.preferences = mergePreferences({
    ...state.preferences,
    ...snapshot,
  });
  applyPanelLayout();
  applyPageState();
  applyPreferencesToInputs();
  connectCrypto();
  void Promise.all([
    loadHeatmap(false),
    loadSectorBoard(false),
    loadMarketEvents(),
    loadWatchlist(state.preferences.watchlistSymbols),
    loadFlow(false),
    loadResearchRail(true),
    loadWatchlistEvents(),
    loadDetail(state.preferences.detailSymbol),
    loadCompanyMap(state.preferences.detailSymbol),
    loadDeskCalendar(),
    loadDeskNews(),
    loadOrderBook(currentOrderBookProduct()),
    runScreen(),
    runCompare(),
  ]);
}

function snapshotCurrentWorkspace() {
  return {
    watchlistSymbols: state.preferences.watchlistSymbols,
    researchPinnedSymbols: state.preferences.researchPinnedSymbols,
    detailSymbol: state.preferences.detailSymbol,
    companyMapCompareSymbol: state.preferences.companyMapCompareSymbol,
    newsFocus: state.preferences.newsFocus,
    sectorFocus: state.preferences.sectorFocus,
    cryptoProducts: state.preferences.cryptoProducts,
    activePage: state.preferences.activePage,
    screenConfig: state.preferences.screenConfig,
    portfolio: state.preferences.portfolio,
    panelLayout: state.preferences.panelLayout,
    panelSizes: state.preferences.panelSizes,
    selectedWorkspaceId: state.selectedWorkspaceId,
  };
}

async function syncPreferences(manual = false) {
  if (!state.authenticated) {
    persistGuestPreferencesIfNeeded();
    if (manual) {
      showStatus("Guest preferences saved locally in this browser.", false);
    }
    return;
  }

  try {
    await api("/api/profile", {
      method: "PUT",
      body: state.preferences,
    });
    if (manual) {
      showStatus("Profile saved on the server.", false);
    }
  } catch (error) {
    showStatus(error.message, true);
  }
}

function schedulePreferenceSync() {
  persistGuestPreferencesIfNeeded();
  window.clearTimeout(state.profileSyncTimer);
  state.profileSyncTimer = window.setTimeout(() => {
    void syncPreferences(false);
  }, 600);
}

function persistGuestPreferencesIfNeeded() {
  if (!state.authenticated) {
    persist(GUEST_PREFERENCES_KEY, state.preferences);
  }
}

function scheduleRefresh() {
  setInterval(() => void loadMarketPulse(), 45000);
  setInterval(() => void loadHeatmap(false), 180000);
  setInterval(() => void loadSectorBoard(false), 180000);
  setInterval(() => void loadMarketEvents(false), 120000);
  setInterval(() => void loadWatchlist(state.preferences.watchlistSymbols), 30000);
  setInterval(() => void loadFlow(false), 120000);
  setInterval(() => void loadResearchRail(false), 180000);
  setInterval(() => void loadWatchlistEvents(), 120000);
  setInterval(() => void loadDetail(state.preferences.detailSymbol), 60000);
  setInterval(() => void loadIntelligence(state.preferences.detailSymbol), 180000);
  setInterval(() => {
    if (normalizePage(state.preferences.activePage) === "map") {
      void loadCompanyMap(state.preferences.detailSymbol);
    }
  }, 180000);
  setInterval(() => void loadDeskCalendar(false), 300000);
  setInterval(() => void loadDeskNews(false), 120000);
  setInterval(() => void renderPortfolio(), 30000);
}

async function selectDetailSymbol(symbol, options = {}) {
  const clean = String(symbol ?? "").trim().toUpperCase();
  if (!clean) {
    return;
  }
  state.preferences.detailSymbol = clean;
  document.querySelector("#detailSymbol").value = clean;
  schedulePreferenceSync();
  renderSymbolRibbon();
  renderHud();
  if (options.page) {
    setActivePage(options.page, { scroll: false });
  }
  if (options.jump) {
    jumpToSection("section-workbench");
  }
  if (state.heatmap && state.heatmap.tiles?.some((tile) => tile.symbol === clean)) {
    void focusHeatmapSymbol(clean);
  }
  await Promise.all([
    loadDetail(clean),
    loadDeskNews(false),
    loadMarketEvents(false),
    options.page === "map" || normalizePage(state.preferences.activePage) === "map" ? loadCompanyMap(clean, true) : Promise.resolve(),
  ]);
}

async function selectSectorFocus(sector, options = {}) {
  const clean = String(sector ?? "").trim();
  if (!clean) {
    return;
  }

  state.preferences.sectorFocus = clean;
  schedulePreferenceSync();
  if (options.page) {
    setActivePage(options.page, { scroll: false });
  }
  if (options.jump) {
    jumpToSection("section-sector-board");
  }
  await loadSectorBoard(true);
}

async function cycleDetailSymbol(direction) {
  const symbols = state.preferences.watchlistSymbols;
  if (!symbols.length) {
    return;
  }
  const currentIndex = Math.max(symbols.indexOf(state.preferences.detailSymbol), 0);
  const nextIndex = (currentIndex + direction + symbols.length) % symbols.length;
  await selectDetailSymbol(symbols[nextIndex], { jump: false });
}

function jumpToSection(id) {
  const pageId = SECTION_TO_PAGE[id];
  if (pageId && pageId !== state.preferences.activePage) {
    setActivePage(pageId, { scroll: false });
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openCommandPalette(query = "") {
  state.commandPaletteOpen = true;
  state.paletteIndex = 0;
  const palette = document.querySelector("#commandPalette");
  const input = document.querySelector("#commandPaletteInput");
  palette.hidden = false;
  input.value = query;
  renderCommandPaletteResults(query);
  window.setTimeout(() => input.focus(), 0);
}

function closeCommandPalette() {
  state.commandPaletteOpen = false;
  const palette = document.querySelector("#commandPalette");
  palette.hidden = true;
}

function renderCommandPaletteResults(query = "") {
  const results = document.querySelector("#commandPaletteResults");
  const commands = buildPaletteCommands(query);
  state.paletteIndex = Math.min(state.paletteIndex, Math.max(commands.length - 1, 0));
  state.paletteCommands = commands;
  results.innerHTML = commands
    .map(
      (command, index) => `
        <button
          type="button"
          class="command-palette-item${index === state.paletteIndex ? " active" : ""}"
          data-command-index="${index}"
        >
          <div>
            <strong>${escapeHtml(command.label)}</strong>
            <div class="meta">${escapeHtml(command.meta)}</div>
          </div>
          <span class="command-palette-kind">${escapeHtml(command.kind)}</span>
        </button>
      `,
    )
    .join("") || `<div class="command-palette-empty muted">No matching commands.</div>`;
}

function syncPaletteSelection() {
  const results = document.querySelector("#commandPaletteResults");
  results.querySelectorAll("[data-command-index]").forEach((node, index) => {
    node.classList.toggle("active", index === state.paletteIndex);
  });
}

async function executePaletteCommand(command) {
  closeCommandPalette();
  await command.run();
}

function buildPaletteCommands(query = "") {
  const normalized = query.trim().toLowerCase();
  const commands = [];

  const symbolUniverse = [
    ...new Set([
      ...state.preferences.watchlistSymbols,
      state.preferences.detailSymbol,
      ...state.latestQuotes.keys(),
    ]),
  ].filter(Boolean);

  if (normalized) {
    commands.push({
      kind: "symbol",
      label: `Load symbol ${query.trim().toUpperCase()}`,
      meta: "open symbol in security workbench",
      run: () => selectDetailSymbol(query.trim().toUpperCase(), { jump: true }),
    });
  }

  commands.push(
    ...symbolUniverse.map((symbol) => {
      const quote = state.latestQuotes.get(symbol);
      return {
        kind: "symbol",
        label: `Open ${symbol}`,
        meta: `${quote?.shortName ?? "watchlist symbol"}${quote?.price != null ? ` · ${formatMoney(quote.price)}` : ""}`,
        run: () => selectDetailSymbol(symbol, { jump: true }),
      };
    }),
  );

  commands.push(
    ...Object.entries(PAGE_DEFINITIONS).map(([pageId, page]) => ({
      kind: "page",
      label: `Open ${page.label} page`,
      meta: page.description,
      run: () => setActivePage(pageId, { scroll: true }),
    })),
  );

  commands.push(
    ...((state.heatmap?.sectors ?? []).slice(0, 16).map((sector) => ({
      kind: "sector",
      label: `Open ${sector.sector} sector`,
      meta: `${formatPercent(sector.averageMove)} · ${formatPercent(sector.weight)} index weight`,
      run: () => selectSectorFocus(sector.sector, { jump: true, page: "sectors" }),
    }))),
  );

  commands.push(
    ...SECTION_COMMANDS.map((section) => ({
      kind: "panel",
      label: section.label,
      meta: section.meta,
      run: () => jumpToSection(section.id),
    })),
  );

  commands.push(
    {
      kind: "action",
      label: "Refresh market pulse",
      meta: "reload the cross-asset board",
      run: () => loadMarketPulse(),
    },
    {
      kind: "action",
      label: "Refresh S&P 500 heatmap",
      meta: "reload breadth, weights, and hover context",
      run: () => loadHeatmap(true),
    },
    {
      kind: "action",
      label: "Refresh watchlist",
      meta: "reload tracked quote rows",
      run: () => loadWatchlist(state.preferences.watchlistSymbols),
    },
    {
      kind: "action",
      label: "Refresh relationship console",
      meta: `reload intelligence for ${state.preferences.detailSymbol}`,
      run: () => loadIntelligence(state.preferences.detailSymbol),
    },
    {
      kind: "action",
      label: "Refresh desk calendar",
      meta: "reload earnings and macro events",
      run: () => loadDeskCalendar(true),
    },
    {
      kind: "action",
      label: "Refresh market news",
      meta: "reload live public headlines",
      run: () => loadDeskNews(true),
    },
    {
      kind: "action",
      label: "Open earnings intel drawer",
      meta: `open earnings detail for ${state.preferences.detailSymbol}`,
      run: async () => {
        toggleEarningsDrawer(true);
        if (supportsEarningsIntel(state.currentDetailQuote, state.currentCompany)) {
          await loadEarningsIntel(state.preferences.detailSymbol, { forceOpen: true });
        } else if (state.currentEarnings) {
          renderEarningsDrawer(state.currentEarnings);
        }
      },
    },
    {
      kind: "action",
      label: "Reset panel layout",
      meta: "restore the default dashboard order",
      run: async () => {
        state.preferences.panelLayout = [...DEFAULT_PANEL_LAYOUT];
        state.preferences.panelSizes = { ...DEFAULT_PANEL_SIZES };
        applyPanelLayout();
        schedulePreferenceSync();
      },
    },
  );

  return commands
    .filter((command) => {
      if (!normalized) {
        return true;
      }
      return `${command.label} ${command.meta} ${command.kind}`.toLowerCase().includes(normalized);
    })
    .slice(0, 14);
}

function guardAuthenticated(label) {
  if (state.authenticated) {
    return true;
  }
  showStatus(`${label} requires an account.`, true);
  return false;
}

async function hydrateMissingPortfolioQuotes() {
  const missing = [...new Set(state.preferences.portfolio.map((position) => position.symbol).filter((symbol) => !state.latestQuotes.has(symbol)))];
  if (missing.length) {
    await loadWatchlist([...new Set([...state.preferences.watchlistSymbols, ...missing])]);
  }
}

function maybeShowAlertNotification(symbol, price) {
  if (!state.authenticated) {
    return;
  }
  for (const alert of state.alerts) {
    if (!alert.active || alert.symbol !== symbol) {
      continue;
    }
    const hit = alert.direction === "above" ? price >= alert.price : price <= alert.price;
    if (hit) {
      showStatus(`${symbol} crossed ${alert.direction} ${formatMoney(alert.price)}.`, false);
    }
  }
}

function currentOrderBookProduct() {
  return document.querySelector("#orderBookProduct").value || state.preferences.cryptoProducts[0] || "BTC-USD";
}

function renderDetailMetrics(quote, market) {
  document.querySelector("#detailMetrics").innerHTML = [
    metric("Last", formatMoney(quote?.price)),
    metric("Daily Move", formatPercent(quote?.changePercent), tone(quote?.changePercent)),
    metric(
      Number.isFinite(market?.trailingPe) ? "P/E" : "Instrument",
      Number.isFinite(market?.trailingPe) ? formatNumber(market?.trailingPe, 2) : humanizeInstrumentType(quote),
    ),
    metric(
      Number.isFinite(market?.marketCap) ? "Market Cap" : "Avg Volume",
      Number.isFinite(market?.marketCap) ? formatCompact(market?.marketCap) : formatCompact(quote?.averageVolume ?? quote?.volume),
    ),
  ].join("");
}

function renderDetailWarnings(messages) {
  const container = document.querySelector("#detailWarnings");
  container.innerHTML = messages.length
    ? messages.map((message) => `<div class="panel-status-chip warn">${escapeHtml(message)}</div>`).join("")
    : `<div class="panel-status-chip">Workbench feeds loaded with current public-source coverage.</div>`;
}

function renderWorkbenchIdentity(quote, market) {
  const container = document.querySelector("#workbenchIdentity");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="workbench-kicker">
      <strong>${escapeHtml(quote?.symbol ?? market?.symbol ?? state.preferences.detailSymbol)}</strong>
      <span>${escapeHtml(humanizeInstrumentType(quote))}</span>
    </div>
    <div class="workbench-meta-row">
      <span>${escapeHtml(market?.shortName ?? quote?.shortName ?? state.preferences.detailSymbol)}</span>
      <span>${escapeHtml(quote?.exchange ?? market?.exchange ?? "Public market")}</span>
      <span>${escapeHtml(quote?.currency ?? "USD")}</span>
      <span>${formatTimestampShort(quote?.timestamp)}</span>
    </div>
  `;
}

function configureEarningsInterface(quote, company) {
  const button = document.querySelector("#toggleEarningsDrawerButton");
  if (!button) {
    return;
  }

  if (supportsEarningsIntel(quote, company)) {
    button.disabled = false;
    button.textContent = "Earnings Intel";
    return;
  }

  button.disabled = false;
  button.textContent = "Issuer Intel";
}

function toggleEarningsDrawer(open) {
  state.earningsDrawerOpen = open;
  const overlay = document.querySelector("#earningsOverlay");
  const drawer = document.querySelector("#earningsDrawer");
  if (!overlay || !drawer) {
    return;
  }
  overlay.hidden = !open;
  drawer.hidden = !open;
  overlay.classList.toggle("open", open);
  drawer.classList.toggle("open", open);
  document.body.classList.toggle("earnings-open", open);
  if (open) {
    document.querySelector("#closeEarningsDrawerButton")?.focus();
  }
}

function renderEarningsDrawer(payload, errorMessage = null) {
  document.querySelector("#earningsDrawerTitle").textContent = payload?.notApplicable
    ? `${payload?.companyName ?? payload?.symbol ?? "Instrument"} issuer context`
    : payload?.companyName ?? payload?.symbol ?? "Earnings detail";
  document.querySelector("#earningsWarning").innerHTML = errorMessage || payload?.warning
    ? `<div class="panel-status-chip warn">${escapeHtml(normalizeWorkbenchWarning(errorMessage ?? payload.warning))}</div>`
    : `<div class="panel-status-chip">${escapeHtml(payload?.notApplicable ? "Corporate earnings modules are not the primary lens for this instrument." : "Public earnings modules loaded for the current symbol.")}</div>`;

  if (!payload) {
    document.querySelector("#earningsSummary").innerHTML = "";
    document.querySelector("#earningsTrendList").innerHTML = renderIntelEmpty("No earnings intelligence available.");
    document.querySelector("#earningsHistoryBody").innerHTML = `<tr><td colspan="4" class="muted">No earnings history available.</td></tr>`;
    document.querySelector("#peerEarningsList").innerHTML = renderIntelEmpty("No peer earnings windows mapped.");
    return;
  }

  if (payload.notApplicable) {
    document.querySelector("#earningsSummary").innerHTML = [
      renderTerminalStat("Coverage", "Not Applicable", "fund / index / macro-linked instrument"),
      renderTerminalStat("Instrument", humanizeInstrumentType(state.currentDetailQuote), "security type"),
      renderTerminalStat("Alternative", "Use Research", "filings, holdings, and market context"),
    ].join("");
    document.querySelector("#earningsTrendList").innerHTML = renderIntelEmpty(payload.explanation ?? "Corporate earnings data is not applicable for this instrument.");
    document.querySelector("#earningsHistoryBody").innerHTML = `<tr><td colspan="4" class="muted">No issuer earnings history is expected for this instrument.</td></tr>`;
    document.querySelector("#peerEarningsList").innerHTML = renderIntelEmpty("Peer earnings windows are not shown for non-operating fund/index instruments.");
    return;
  }

  document.querySelector("#earningsSummary").innerHTML = [
    renderTerminalStat("Window", formatWindow(payload.earningsWindow), "next earnings"),
    renderTerminalStat("Avg EPS", formatNumber(payload.estimates?.average, 2), "consensus"),
    renderTerminalStat("Low/High", `${formatNumber(payload.estimates?.low, 2)} / ${formatNumber(payload.estimates?.high, 2)}`, "estimate range"),
    renderTerminalStat("Revenue", formatCompact(payload.estimates?.revenueEstimate), "estimate"),
    renderTerminalStat("Street", payload.estimates?.recommendation ?? "n/a", "rating"),
  ].join("");

  document.querySelector("#earningsTrendList").innerHTML = (payload.trend ?? [])
    .map(
      (entry) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(entry.period ?? "Period")}</strong>
            <div class="meta">${escapeHtml(entry.endDate ? formatDateShort(entry.endDate) : "n/a")} | ${escapeHtml(entry.earningsEstimate?.numberOfAnalysts != null ? `${entry.earningsEstimate.numberOfAnalysts} analysts` : "estimate")}</div>
          </div>
          <div class="meta">
            EPS ${escapeHtml(formatNumber(entry.earningsEstimate?.avg, 2))} | Rev ${escapeHtml(formatCompact(entry.revenueEstimate?.avg))}
          </div>
        </div>
      `,
    )
    .join("") || renderIntelEmpty("No earnings trend rows were returned.");

  document.querySelector("#earningsHistoryBody").innerHTML = (payload.history ?? [])
    .map(
      (entry) => `
        <tr class="intel-row ${tone(entry.surprisePercent)}">
          <td>${escapeHtml(entry.quarter ? formatDateShort(entry.quarter) : "n/a")}</td>
          <td>${formatNumber(entry.epsEstimate, 2)}</td>
          <td>${formatNumber(entry.epsActual, 2)}</td>
          <td class="${tone(entry.surprisePercent)}">${formatPercent(entry.surprisePercent)}</td>
        </tr>
      `,
    )
    .join("") || `<tr><td colspan="4" class="muted">No earnings history available.</td></tr>`;

  document.querySelector("#peerEarningsList").innerHTML = (payload.peers ?? [])
    .map(
      (entry) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(entry.symbol)}</strong>
            <div class="meta">${escapeHtml(entry.shortName ?? "")}</div>
          </div>
          <div class="meta">${escapeHtml(formatWindow({ start: entry.earningsStart, end: entry.earningsEnd }))}</div>
        </div>
      `,
    )
    .join("") || renderIntelEmpty("No peer earnings windows are near this date.");
}

function renderOverview(company, quote) {
  const type = humanizeInstrumentType(quote);
  document.querySelector("#companyOverview").innerHTML = `
    <div class="overview-header">
      <div>
        <p class="section-label">${escapeHtml(company.market.exchange ?? quote?.exchange ?? "Market profile")}</p>
        <h3>${escapeHtml(company.market.shortName ?? company.symbol)}</h3>
      </div>
      <div class="overview-tags">
        <span class="terminal-chip">${escapeHtml(type)}</span>
        <span class="terminal-chip">${escapeHtml(quote?.currency ?? "USD")}</span>
      </div>
    </div>
    <p>${escapeHtml(company.market.businessSummary ?? fallbackBusinessSummary(quote, company))}</p>
    <p><strong>Sector:</strong> ${escapeHtml(company.market.sector ?? "n/a")} | <strong>Industry:</strong> ${escapeHtml(company.market.industry ?? "n/a")}</p>
    <p><strong>Website:</strong> ${company.market.website ? `<a href="${safeUrl(company.market.website)}" target="_blank" rel="noreferrer">${escapeHtml(company.market.website)}</a>` : "n/a"}</p>
  `;
}

function renderCompanyFacts(company, quote) {
  const filings = company.sec.filings ?? [];
  const cards = isFundLike(quote)
    ? [
        fact("Instrument", humanizeInstrumentType(quote), company.market.exchange ?? quote?.exchange ?? "market"),
        secFact("Assets", company.sec.facts.assets),
        secFact("Shares Out", company.sec.facts.sharesOutstanding),
        fact("Latest Filing", filings[0]?.form ?? "n/a", filings[0]?.filingDate ?? "no recent filing"),
        fact("Analyst Rating", company.market.analystRating ?? "n/a", company.market.exchange ?? quote?.exchange ?? "market"),
      ]
    : [
        secFact("Revenue", company.sec.facts.revenue),
        secFact("Net Income", company.sec.facts.netIncome),
        secFact("Assets", company.sec.facts.assets),
        secFact("Cash", company.sec.facts.cash),
        secFact("Shares Out", company.sec.facts.sharesOutstanding),
        fact("Analyst Rating", company.market.analystRating ?? "n/a", company.market.exchange ?? quote?.exchange ?? "market"),
      ];

  document.querySelector("#companyFacts").innerHTML = cards.join("");
}

async function loadIntelligence(symbol) {
  try {
    const payload = await api(`/api/intelligence?symbol=${encodeURIComponent(symbol)}`);
    state.intelligence = payload;

    document.querySelector("#intelCommandBar").innerHTML = payload.commands
      .map((command) => `<div class="command-pill">${escapeHtml(command.code)}<span>${escapeHtml(command.label)}</span></div>`)
      .join("");

    document.querySelector("#intelHeadline").innerHTML = `
      <p class="section-label">Coverage ${payload.coverage.curated ? "Curated + Public" : "Public + Fallback"}</p>
      <h3>${escapeHtml(payload.companyName)}</h3>
      <p>${escapeHtml(payload.summary ?? payload.coverage.notes[0] ?? "No intelligence summary available.")}</p>
    `;

    document.querySelector("#intelCoverageNotes").innerHTML = payload.coverage.notes
      .map((note, index) => renderIntelNote(note, index))
      .join("");

    document.querySelector("#intelOwnershipFacts").innerHTML = [
      metric("Inst. Held", formatPercentScaled(payload.ownership.institutionPercentHeld)),
      metric("Insider Held", formatPercentScaled(payload.ownership.insiderPercentHeld)),
      metric("Float", formatCompact(payload.ownership.floatShares)),
      metric("Short Int", formatCompact(payload.ownership.sharesShort)),
    ].join("");

    const holders = [...(payload.ownership.topInstitutionalHolders ?? []), ...(payload.ownership.topFundHolders ?? [])]
      .filter((holder, index, all) => holder.holder && all.findIndex((entry) => entry.holder === holder.holder) === index)
      .slice(0, 12);

    document.querySelector("#intelSignalGrid").innerHTML = renderIntelSignals(payload, holders);
    document.querySelector("#intelHoldersBody").innerHTML = holders
      .map(
        (holder, index) => `
          <tr class="intel-row">
            <td>
              <div class="holder-cell">
                <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${escapeHtml(holder.holder ?? "n/a")}</strong>
                  <div class="muted">ownership filing</div>
                </div>
              </div>
            </td>
            <td>${formatPercentScaled(holder.pctHeld)}</td>
            <td>${formatCompact(holder.shares)}</td>
          </tr>
        `,
      )
      .join("");

    document.querySelector("#intelSupplyList").innerHTML = renderIntelList(
      ...payload.supplyChain.suppliers.map((item) => renderIntelListItem(item.relation, item.target, item.label)),
      ...payload.supplyChain.ecosystem.map((item) => renderIntelListItem(item.relation, item.target, item.label)),
    );

    document.querySelector("#intelCustomerList").innerHTML = renderIntelList(
      ...(payload.customerConcentration ?? []).map((item) =>
        renderIntelListItem(item.level, item.name, item.commentary),
      ),
      ...(payload.supplyChain.customers ?? []).map((item) =>
        renderIntelListItem(item.relation, item.target, item.label),
      ),
    );

    document.querySelector("#intelCorporateList").innerHTML = renderIntelList(
      ...(payload.corporate.tree ?? []).map((item) => renderIntelListItem(item.type, item.name, item.description)),
      ...(payload.corporate.relations ?? []).map((item) =>
        renderIntelListItem(item.relation, item.target, item.label),
      ),
    );

    document.querySelector("#intelExecList").innerHTML = (payload.executives ?? [])
      .map((item) =>
        renderIntelListItem(
          item.role ?? "Executive",
          item.name,
          item.background?.length ? item.background.join(" -> ") : item.compensation ? `Comp ${formatMoney(item.compensation)}` : "Public-company officer listing",
        ),
      )
      .join("") || renderIntelEmpty("No executive network data mapped.");

    document.querySelector("#intelImpactList").innerHTML = (payload.eventChains ?? [])
      .map((chain, index) => renderImpactChain(chain, index))
      .join("") || renderIntelEmpty("No impact chains mapped.");

    document.querySelector("#intelCompetitorBody").innerHTML = (payload.competitors ?? [])
      .map(
        (item, index) => `
          <tr class="intel-row ${tone(item.changePercent)}">
            <td>
              <div class="holder-cell">
                <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>${escapeHtml(item.symbol)}</strong>
                  <div class="muted">${escapeHtml(item.companyName ?? "n/a")}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(item.companyName ?? "n/a")}</td>
            <td>${formatMoney(item.price)}</td>
            <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
          </tr>
        `,
      )
      .join("");

    mountIntelGraph(document.querySelector("#intelGraph"), payload.graph, payload.symbol);
    mountGeoExposureChart(document.querySelector("#intelGeoChart"), payload.geography);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function renderFilings(filings) {
  if (!filings?.length) {
    document.querySelector("#filingsList").innerHTML = renderIntelEmpty("No recent SEC filings are available for this symbol.");
    return;
  }

  document.querySelector("#filingsList").innerHTML = filings
    .map(
      (filing) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(filing.form ?? "n/a")}</strong>
            <div class="meta">${escapeHtml(filing.primaryDocument ?? "Document")} | filed ${escapeHtml(filing.filingDate ?? "n/a")}</div>
          </div>
          <div class="action-row">
            <div class="muted">${escapeHtml(filing.reportDate ?? "")}</div>
            ${filing.filingUrl || filing.filingIndexUrl ? `<a class="event-link" href="${safeUrl(filing.filingUrl ?? filing.filingIndexUrl)}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </div>
        </div>
      `,
    )
    .join("");
}

function renderOptions(options, quote) {
  const calls = options?.calls ?? [];
  const puts = options?.puts ?? [];
  const status = document.querySelector("#optionsStatus");
  if (status) {
    status.innerHTML = options?.warning
      ? `<div class="panel-status-chip warn">${escapeHtml(normalizeWorkbenchWarning(options.warning))}</div>`
      : `<div class="panel-status-chip">${escapeHtml(isFundLike(quote) ? "Listed options may be partial or delayed for fund-like instruments." : "Current listed options snapshot loaded.")}</div>`;
  }

  const emptyMessage = options?.warning
    ? "Public options feed unavailable right now."
    : "No listed contracts were returned for this snapshot.";

  document.querySelector("#callsBody").innerHTML = calls.length
    ? calls
    .slice(0, 12)
    .map(
      (contract, index) => `
        <tr class="intel-row">
          <td>
            <div class="holder-cell">
              <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>${formatMoney(contract.strike)}</strong>
                <div class="muted">${escapeHtml(contract.contractSymbol ?? "")}</div>
              </div>
            </div>
          </td>
          <td>${formatMoney(contract.lastPrice)}</td>
          <td>${formatMoney(contract.bid)} / ${formatMoney(contract.ask)}</td>
          <td>${formatPercent((contract.impliedVolatility ?? 0) * 100)}</td>
          <td>${formatCompact(contract.volume)} / ${formatCompact(contract.openInterest)}</td>
        </tr>
      `,
    )
    .join("")
    : `<tr><td colspan="5" class="muted">${escapeHtml(emptyMessage)}</td></tr>`;
  document.querySelector("#putsBody").innerHTML = puts.length
    ? puts
    .slice(0, 12)
    .map(
      (contract, index) => `
        <tr class="intel-row">
          <td>
            <div class="holder-cell">
              <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>${formatMoney(contract.strike)}</strong>
                <div class="muted">${escapeHtml(contract.contractSymbol ?? "")}</div>
              </div>
            </div>
          </td>
          <td>${formatMoney(contract.lastPrice)}</td>
          <td>${formatMoney(contract.bid)} / ${formatMoney(contract.ask)}</td>
          <td>${formatPercent((contract.impliedVolatility ?? 0) * 100)}</td>
          <td>${formatCompact(contract.volume)} / ${formatCompact(contract.openInterest)}</td>
        </tr>
      `,
    )
    .join("")
    : `<tr><td colspan="5" class="muted">${escapeHtml(emptyMessage)}</td></tr>`;
}

function renderPriceChart(points, symbol) {
  const validPoints = points.filter((point) => Number.isFinite(point.close));
  if (!validPoints.length) {
    document.querySelector("#priceChart").innerHTML = "<p class='muted'>No chart data available.</p>";
    return;
  }

  mountCandlestickChart(document.querySelector("#priceChart"), {
    title: symbol,
    subtitle: `${historyRangeLabel(state.currentHistoryRange)} OHLC + volume`,
    points: validPoints.map((point) => ({
      label: point.date ?? point.timestamp ?? "",
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      value: point.close,
      meta: point.volume ? `Vol ${formatCompact(point.volume)}` : "",
      volume: point.volume,
    })),
    valueFormatter: (value) => formatMoney(value),
  });
}

function renderCalendarPanel(events, options = {}) {
  const pageSize = Number(document.querySelector("#calendarPageSize")?.value ?? 15);
  const pageState = paginateItems(filterCalendarEvents(events, options), state.calendarPage, pageSize);
  state.calendarPage = pageState.page;
  const calendarList = document.querySelector("#calendarList");
  const calendarPageMeta = document.querySelector("#calendarPageMeta");
  const calendarPager = document.querySelector("#calendarPager");
  if (calendarList) {
    calendarList.innerHTML = renderCalendar(pageState.items, {
      ...options,
      pageState,
    });
  }
  if (calendarPageMeta) {
    calendarPageMeta.textContent = pageState.total
      ? `${pageState.start + 1}-${pageState.end} of ${pageState.total} scheduled items`
      : "No scheduled items";
  }
  if (calendarPager) {
    calendarPager.innerHTML = renderPager(pageState.page, pageState.totalPages, "calendar-page");
  }
}

function renderNewsPanel(items) {
  const pageSize = normalizePage(state.preferences.activePage) === "news" ? 12 : 6;
  const pageState = paginateItems(items, state.newsPage, pageSize);
  state.newsPage = pageState.page;
  const newsList = document.querySelector("#newsList");
  const newsPageMeta = document.querySelector("#newsPageMeta");
  const newsPager = document.querySelector("#newsPager");
  const full = normalizePage(state.preferences.activePage) === "news";

  if (newsList) {
    newsList.innerHTML = renderNewsFeed(pageState.items, {
      full,
      query: state.preferences.newsFocus,
    });
  }
  if (newsPageMeta) {
    newsPageMeta.textContent = pageState.total
      ? `${pageState.start + 1}-${pageState.end} of ${pageState.total} ${state.preferences.newsFocus ? "search results" : "market headlines"}`
      : "No headlines loaded";
  }
  if (newsPager) {
    newsPager.innerHTML = renderPager(pageState.page, pageState.totalPages, "news-page");
  }
}

function renderMarketEventsPanel(events) {
  const pageState = paginateItems(events, state.marketEventsPage, 8);
  state.marketEventsPage = pageState.page;
  const list = document.querySelector("#marketEventsList");
  const meta = document.querySelector("#marketEventsPageMeta");
  const pager = document.querySelector("#marketEventsPager");
  if (list) {
    list.innerHTML = renderMarketEvents(pageState.items, { compact: true });
  }
  if (meta) {
    meta.textContent = pageState.total
      ? `${pageState.start + 1}-${pageState.end} of ${pageState.total} ranked catalysts`
      : "No ranked catalysts";
  }
  if (pager) {
    pager.innerHTML = renderPager(pageState.page, pageState.totalPages, "market-events-page");
  }
}

function renderCalendarSummary(events, windowDays) {
  const filtered = filterCalendarEvents(events, { filter: "all", windowDays });
  const earnings = filtered.filter((event) => event.category === "earnings").length;
  const macro = filtered.filter((event) => event.category !== "earnings").length;
  const nextEvent = filtered[0] ?? null;

  return [
    renderTerminalStat("Window", `${windowDays}d`, "browse horizon"),
    renderTerminalStat("Events", String(filtered.length), "scheduled"),
    renderTerminalStat("Earnings", String(earnings), "watchlist"),
    renderTerminalStat("Macro", String(macro), "policy + econ"),
    renderTerminalStat("Next", nextEvent ? compactLabel(nextEvent.title, 18) : "n/a", nextEvent ? formatDateTime(nextEvent.date) : "none"),
  ].join("");
}

function renderCalendar(events, options = {}) {
  if (!events.length) {
    return renderIntelEmpty("No desk calendar events match the current filter.");
  }

  if (options.grouped) {
    return renderCalendarTable(events);
  }

  return events
    .map(
      (event) => `
        <article class="calendar-item ${toneByImportance(event.importance)}">
          <div class="calendar-time">
            <strong>${formatDateShort(event.date)}</strong>
            <span>${formatTime(event.date)}</span>
          </div>
          <div class="calendar-body">
            <div class="calendar-title-row">
              <strong>${event.link ? `<a class="event-link" href="${safeUrl(event.link)}" target="_blank" rel="noreferrer">${escapeHtml(event.title ?? "Event")}</a>` : escapeHtml(event.title ?? "Event")}</strong>
              <span class="signal-chip">${escapeHtml((event.category ?? "event").toUpperCase())}</span>
            </div>
            <div class="meta">${escapeHtml(event.source ?? "Public source")} | ${escapeHtml(event.note ?? "")}</div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCalendarTable(events) {
  return `
    <div class="table-wrap terminal-table-wrap calendar-table-wrap">
      <table class="terminal-table calendar-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Event</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          ${events
            .map(
              (event) => `
                <tr class="intel-row ${toneByImportance(event.importance)}">
                  <td>${escapeHtml(formatDateShort(event.date))}</td>
                  <td>${escapeHtml(formatTime(event.date))}</td>
                  <td><span class="signal-chip">${escapeHtml((event.category ?? "event").toUpperCase())}</span></td>
                  <td>${escapeHtml(event.symbol ?? "n/a")}</td>
                  <td>
                    <div class="calendar-table-event">
                      <strong>${event.link ? `<a class="event-link" href="${safeUrl(event.link)}" target="_blank" rel="noreferrer">${escapeHtml(event.title ?? "Event")}</a>` : escapeHtml(event.title ?? "Event")}</strong>
                      <div class="meta">${escapeHtml(event.note ?? "")}</div>
                    </div>
                  </td>
                  <td>${escapeHtml(event.source ?? "Public source")}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCalendarEarningsCard(event) {
  return `
    <article class="calendar-earnings-card ${toneByImportance(event.importance)}">
      <div class="calendar-earnings-head">
        <strong>${escapeHtml(event.symbol ?? compactLabel(event.title ?? "Event", 14))}</strong>
        <span class="signal-chip">${escapeHtml(formatTime(event.date))}</span>
      </div>
      <div class="meta">${escapeHtml(event.title ?? "Earnings")}</div>
      <div class="calendar-earnings-note">${escapeHtml(event.note ?? event.source ?? "")}</div>
      <div class="calendar-earnings-foot">
        <span class="muted">${escapeHtml(event.source ?? "Public source")}</span>
        ${event.link ? `<a class="event-link" href="${safeUrl(event.link)}" target="_blank" rel="noreferrer">Open</a>` : ""}
      </div>
    </article>
  `;
}

function renderCalendarBoardRow(event) {
  return `
    <div class="list-item calendar-board-item ${toneByImportance(event.importance)}">
      <div>
        <strong>${event.link ? `<a class="event-link" href="${safeUrl(event.link)}" target="_blank" rel="noreferrer">${escapeHtml(event.title ?? "Event")}</a>` : escapeHtml(event.title ?? "Event")}</strong>
        <div class="meta">${escapeHtml(event.note ?? event.source ?? "")}</div>
      </div>
      <div class="terminal-price-stack">
        <strong>${escapeHtml(formatTime(event.date))}</strong>
        <div class="meta">${escapeHtml((event.category ?? "event").toUpperCase())}</div>
      </div>
    </div>
  `;
}

function groupCalendarByDate(events) {
  return [...events.reduce((map, event) => {
    const key = calendarDateKey(event.date);
    const bucket = map.get(key) ?? [];
    bucket.push(event);
    map.set(key, bucket);
    return map;
  }, new Map()).entries()];
}

function calendarDateKey(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return String(value ?? "");
  }
  return new Date(timestamp).toISOString().slice(0, 10);
}

function formatCalendarBoardDate(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp))
    : "Unknown date";
}

function renderNewsFeed(items, options = {}) {
  if (!items.length) {
    return renderIntelEmpty("No public market headlines are available right now.");
  }

  return items
    .map(
      (item, index) => `
        <article class="news-item ${toneByImportance(item.impact)}${options.full ? " compact" : index === 0 ? " featured" : ""}">
          <div class="news-item-head">
            <span class="signal-chip">${escapeHtml((item.category ?? "news").toUpperCase())}</span>
            <span class="news-time">${escapeHtml(formatTimeAgo(item.publishedAt))}</span>
          </div>
          <a class="news-headline" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
          ${options.full ? `<div class="news-item-summary">${escapeHtml(renderNewsLine(item, options.query))}</div>` : ""}
          <div class="news-item-foot">
            <span class="muted">${escapeHtml(item.source ?? "News")}</span>
            <span class="news-open-link">Open source</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderNewsSummary(items, focus) {
  const counts = items.reduce(
    (summary, item) => {
      summary.total += 1;
      summary[item.category] = (summary[item.category] ?? 0) + 1;
      return summary;
    },
    { total: 0 },
  );

  return [
    renderTerminalStat("Feed", focus ? compactLabel(focus, 18) : "Market", focus ? "focus query" : "broad market"),
    renderTerminalStat("Headlines", String(counts.total ?? 0), "loaded"),
    renderTerminalStat("Policy", String(counts.policy ?? 0), "central bank + rates"),
    renderTerminalStat("Earnings", String(counts.earnings ?? 0), "results + guidance"),
    renderTerminalStat("Macro", String(counts.macro ?? 0), "inflation + jobs"),
  ].join("");
}

function renderNewsStatus(asOf, query, focusSymbol) {
  return [
    `<div class="panel-status-chip">${escapeHtml(query ? `Search ${query}` : "General market board")}</div>`,
    `<div class="panel-status-chip">${escapeHtml(asOf ? `Updated ${formatTimeAgo(asOf)}` : "Awaiting feed")}</div>`,
    `<div class="panel-status-chip">${escapeHtml(query ? "Focused source-ranked query" : "Macro + policy + watchlist blend")}</div>`,
  ].join("");
}

function renderMarketEventsSummary(summary) {
  return [
    renderTerminalStat("Timeline", String(summary.total ?? 0), "ranked items"),
    renderTerminalStat("Calendar", String(summary.calendar ?? 0), "policy + macro"),
    renderTerminalStat("News", String(summary.news ?? 0), "live headlines"),
    renderTerminalStat("Filings", String(summary.filings ?? 0), "sec disclosures"),
  ].join("");
}

function renderMarketEvents(events) {
  if (!events.length) {
    return renderIntelEmpty("No market-moving events are available right now.");
  }

  return renderMarketEventsList(events);
}

function renderMarketEventsList(events) {
  return events
    .map(
      (event) => `
        <article class="market-event-row ${toneByImportance(event.importance)}">
          <div class="market-event-time">
            <strong>${escapeHtml(formatTime(event.timestamp))}</strong>
            <span>${escapeHtml(formatDateShort(event.timestamp))}</span>
          </div>
          <div class="market-event-main">
            <div class="calendar-title-row">
              <strong>${escapeHtml(event.title)}</strong>
              <span class="signal-chip">${escapeHtml((event.kind ?? "event").toUpperCase())}</span>
            </div>
            <div class="meta">${escapeHtml(event.source ?? "Source")} | ${escapeHtml(compactLabel(event.note ?? "", 96))}</div>
          </div>
          <div class="market-event-action">
            ${event.link ? `<a class="event-link" href="${safeUrl(event.link)}" target="_blank" rel="noreferrer">Open</a>` : `<span class="muted">Live</span>`}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderNewsLine(item, query) {
  const focus = String(query ?? "").trim();
  if (focus) {
    return `${focus} focused search result ranked by source quality and recency.`;
  }
  return `${item.category ?? "market"} headline from the broader stock-market feed.`;
}

function paginateItems(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));
  const normalizedPage = clamp(Number(page) || 1, 1, totalPages);
  const start = total ? (normalizedPage - 1) * pageSize : 0;
  const end = total ? Math.min(start + pageSize, total) : 0;
  return {
    items: items.slice(start, end),
    total,
    page: normalizedPage,
    pageSize,
    totalPages,
    start,
    end,
  };
}

function renderPager(currentPage, totalPages, dataKey) {
  if (totalPages <= 1) {
    return "";
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter((value) => value >= 1 && value <= totalPages));
  const sorted = [...pages].sort((left, right) => left - right);
  const buttons = [];

  if (currentPage > 1) {
    buttons.push(`<button type="button" class="pager-button" data-${dataKey}="${currentPage - 1}">Prev</button>`);
  }

  for (const page of sorted) {
    buttons.push(
      `<button type="button" class="pager-button${page === currentPage ? " active" : ""}" data-${dataKey}="${page}">${page}</button>`,
    );
  }

  if (currentPage < totalPages) {
    buttons.push(`<button type="button" class="pager-button" data-${dataKey}="${currentPage + 1}">Next</button>`);
  }

  return buttons.join("");
}

function renderHeatmapSummary(payload) {
  const dominantSector = payload.sectors?.[0] ?? null;
  return [
    renderTerminalStat("Universe", String(payload.coverage?.constituents ?? payload.tiles?.length ?? 0), "tracked names"),
    renderTerminalStat("Quoted", String(payload.coverage?.quoted ?? 0), "live tiles"),
    renderTerminalStat("Sectors", String(payload.coverage?.sectors ?? payload.sectors?.length ?? 0), "mapped groups"),
    renderTerminalStat(
      "Largest Sector",
      dominantSector ? compactLabel(dominantSector.sector) : "n/a",
      dominantSector ? formatPercent(dominantSector.weight) : "weight share",
    ),
    renderTerminalStat(
      "Leader",
      payload.leaders?.[0]?.symbol ?? "n/a",
      payload.leaders?.[0] ? formatPercent(payload.leaders[0].changePercent) : "top mover",
    ),
  ].join("");
}

function renderHeatmapWarnings(warnings) {
  if (!warnings.length) {
    return `<div class="panel-status-chip">Heatmap universe and context feeds are live.</div>`;
  }
  return warnings
    .slice(0, 3)
    .map((warning) => `<div class="panel-status-chip warn">${escapeHtml(warning)}</div>`)
    .join("");
}

function renderHeatmapTiles(payload) {
  const tiles = payload?.tiles ?? [];
  if (!tiles.length) {
    return renderIntelEmpty("No heatmap tiles are available right now.");
  }

  const sectorMeta = new Map((payload?.sectors ?? []).map((sector) => [sector.sector, sector]));
  const groups = groupHeatmapTiles(tiles);

  return groups
    .map(([sectorName, items]) => {
      const sector = sectorMeta.get(sectorName) ?? {
        sector: sectorName,
        averageMove: average(items.map((item) => item.changePercent)),
        weight: sum(items.map((item) => item.weight)),
      };
      const sectorSpan = heatmapSectorSpan(sector.weight);
      const visibleCount = sector.weight >= 20 ? 10 : sector.weight >= 10 ? 8 : 6;
      const visibleItems = items.slice(0, visibleCount);
      const hiddenCount = Math.max(items.length - visibleItems.length, 0);

      return `
        <section class="heatmap-sector ${tone(sector.averageMove)}" style="grid-column: span ${sectorSpan};">
          <button type="button" class="heatmap-sector-header" data-heatmap-sector="${escapeHtml(sector.sector ?? "Sector")}">
            <div>
              <h3>${escapeHtml(sector.sector ?? "Sector")}</h3>
              <span>${escapeHtml(String(items.length))} names</span>
            </div>
            <strong class="${tone(sector.averageMove)}">${formatPercent(sector.averageMove)}</strong>
          </button>
          <div class="heatmap-sector-grid">
            ${visibleItems
              .map((tile) => {
                const intensity = Math.min(Math.abs(tile.changePercent ?? 0) / 4, 1);
                return `
                  <button
                    type="button"
                    class="heatmap-tile ${tone(tile.changePercent)}${tile.symbol === state.heatmapFocusSymbol ? " active" : ""}"
                    data-heatmap-symbol="${escapeHtml(tile.symbol)}"
                    data-size="${tile.columnSpan}"
                    style="grid-column: span ${tile.columnSpan}; grid-row: span ${tile.rowSpan}; --heat-opacity: ${0.18 + intensity * 0.46};"
                  >
                    <div class="heatmap-tile-top">
                      <span class="heatmap-weight">${formatPercent(tile.weight)}</span>
                    </div>
                    <div class="heatmap-tile-body">
                      <strong>${escapeHtml(tile.symbol)}</strong>
                      <div class="heatmap-name">${escapeHtml(truncateText(tile.name ?? tile.symbol, 18))}</div>
                      <div class="heatmap-move ${tone(tile.changePercent)}">${formatPercent(tile.changePercent)}</div>
                    </div>
                  </button>
                `;
              })
              .join("")}
            ${hiddenCount
              ? `
                <button type="button" class="heatmap-tile heatmap-more-tile" data-heatmap-sector="${escapeHtml(sector.sector ?? "Sector")}" style="grid-column: span 2; grid-row: span 1;">
                  <div class="heatmap-tile-body">
                    <strong>+${hiddenCount}</strong>
                    <div class="heatmap-name">open full sector board</div>
                  </div>
                </button>
              `
              : ""}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderHeatmapContext(payload) {
  document.querySelector("#heatmapDetailTitle").textContent = `${payload.symbol} · ${payload.companyName ?? payload.symbol}`;
  document.querySelector("#heatmapDetailMeta").textContent =
    `${payload.company?.sector ?? "Sector n/a"}${payload.company?.industry ? ` / ${payload.company.industry}` : ""}`;
  document.querySelector("#heatmapDetailSummary").innerHTML = `
    <div class="heatmap-context-card">
      <div class="heatmap-context-head">
        <strong>${escapeHtml(payload.scenario?.headline ?? `${payload.symbol} live context`)}</strong>
        <span class="terminal-chip ${tone(payload.quote?.changePercent)}">${formatPercent(payload.quote?.changePercent)}</span>
      </div>
      <div class="meta">${escapeHtml(payload.scenario?.summary ?? "No summary available.")}</div>
      <div class="heatmap-context-stats">
        ${renderTerminalStat("Last", formatMoney(payload.quote?.price), "current print")}
        ${renderTerminalStat("Sector", payload.company?.sector ?? "n/a", payload.company?.industry ?? "industry")}
        ${renderTerminalStat("Cap", formatCompact(payload.company?.marketCap), "market value")}
        ${renderTerminalStat("Street", payload.company?.analystRating ?? "n/a", "public rating")}
      </div>
    </div>
  `;

  document.querySelector("#heatmapCatalysts").innerHTML = (payload.scenario?.bullets ?? [])
    .map(
      (item) => `
        <div class="list-item heatmap-catalyst">
          <div class="heatmap-catalyst-head">
            <strong>${escapeHtml(item.title ?? "Catalyst")}</strong>
            <span class="signal-chip">${escapeHtml((item.kind ?? "signal").toUpperCase())}</span>
          </div>
          <div class="meta">${escapeHtml(item.detail ?? "")}</div>
        </div>
      `,
    )
    .join("") || renderIntelEmpty("No catalyst summary is available right now.");

  document.querySelector("#heatmapReferencesBody").innerHTML = (payload.references ?? [])
    .map(
      (reference) => `
        <tr class="intel-row">
          <td>
            <a class="reference-link" href="${safeUrl(reference.url)}" target="_blank" rel="noreferrer">${escapeHtml(truncateText(reference.label, 92))}</a>
          </td>
          <td>${escapeHtml(reference.source ?? reference.kind ?? "Source")}</td>
          <td>${escapeHtml(reference.publishedAt ? formatTimeAgo(reference.publishedAt) : "live")}</td>
        </tr>
      `,
    )
    .join("") || `<tr><td colspan="3" class="muted">No live references are available right now.</td></tr>`;

  highlightHeatmapFocus();
}

function renderSectorBoardSummary(payload) {
  return [
    renderTerminalStat("Sector", payload.sector ?? "n/a", "focus board"),
    renderTerminalStat("Names", String(payload.summary?.names ?? 0), "constituents"),
    renderTerminalStat("Avg Move", formatPercent(payload.summary?.averageMove), "sector mean"),
    renderTerminalStat("Weight", formatPercent(payload.summary?.weight), "index share"),
    renderTerminalStat("Volume", formatCompact(payload.summary?.aggregateVolume), "aggregate"),
    renderTerminalStat("Mkt Cap", formatCompact(payload.summary?.aggregateCap), "aggregate"),
  ].join("");
}

function renderSectorBoardTiles(items) {
  if (!items.length) {
    return renderIntelEmpty("No sector constituents are available right now.");
  }

  const totalWeight = sum(items.map((item) => item.weight)) ?? 1;
  return items
    .slice(0, 20)
    .map((item) => {
      const relativeWeight = Number.isFinite(item.weight) ? item.weight / totalWeight : 0.03;
      const span = relativeWeight >= 0.16 ? 3 : relativeWeight >= 0.08 ? 2 : 1;
      return `
        <button
          type="button"
          class="sector-board-tile ${tone(item.changePercent)}"
          data-sector-symbol="${escapeHtml(item.symbol)}"
          style="grid-column: span ${span};"
        >
          <span class="sector-board-weight">${formatPercent(item.weight)}</span>
          <strong>${escapeHtml(item.symbol)}</strong>
          <div class="meta">${escapeHtml(truncateText(item.name ?? item.symbol, 28))}</div>
          <div class="sector-board-move ${tone(item.changePercent)}">${formatPercent(item.changePercent)}</div>
        </button>
      `;
    })
    .join("");
}

function renderSectorBoardRows(items) {
  if (!items.length) {
    return `<tr><td colspan="6" class="muted">No constituents are available for this sector.</td></tr>`;
  }

  return items
    .map(
      (item) => `
        <tr class="intel-row sector-board-row" data-sector-symbol="${escapeHtml(item.symbol)}">
          <td>
            <div class="terminal-symbol-line">
              <strong>${escapeHtml(item.symbol)}</strong>
              <span class="terminal-chip">${escapeHtml(compactLabel(item.name ?? item.symbol, 22))}</span>
            </div>
          </td>
          <td>${formatMoney(item.price)}</td>
          <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
          <td>${formatPercent(item.weight)}</td>
          <td>${formatCompact(item.volume)}</td>
          <td>${formatCompact(item.marketCap)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderCompactNewsFeed(items) {
  if (!items.length) {
    return renderIntelEmpty("No sector headlines are available right now.");
  }

  return items
    .slice(0, 8)
    .map(
      (item) => `
        <article class="sector-news-card ${toneByImportance(item.impact)}">
          <div class="sector-news-head">
            <span class="signal-chip">${escapeHtml((item.category ?? "news").toUpperCase())}</span>
            <span class="news-time">${escapeHtml(formatTimeAgo(item.publishedAt))}</span>
          </div>
          <a class="sector-news-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
          <div class="sector-news-foot">
            <span class="muted">${escapeHtml(item.source ?? "News")}</span>
            <span>${escapeHtml(item.symbols?.[0] ?? item.category ?? "live")}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderFlowSummary(summary) {
  return [
    renderTerminalStat("Symbols", String(summary.symbols ?? 0), "watchlist coverage"),
    renderTerminalStat("Shares", formatCompact(summary.shareVolume), "aggregate tape"),
    renderTerminalStat("Options", formatCompact(summary.optionsVolume), "calls + puts"),
    renderTerminalStat("P/C", formatRatio(summary.averagePutCall), "watchlist mean"),
    renderTerminalStat("Elevated", String(summary.elevated ?? 0), "high rel-vol / short"),
  ].join("");
}

function renderFlowRows(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8" class="muted">No flow rows are available right now.</td></tr>`;
  }

  return rows
    .map(
      (row) => `
        <tr class="watchlist-row ${tone(row.changePercent)} flow-row" data-flow-symbol="${escapeHtml(row.symbol)}">
          <td>
            <div class="watchlist-symbol-cell">
              <div>
                <div class="terminal-symbol-line">
                  <strong>${escapeHtml(row.symbol)}</strong>
                  <span class="terminal-chip">${escapeHtml(compactLabel(row.sector ?? "Unclassified", 14))}</span>
                </div>
                <div class="meta">${escapeHtml(compactLabel(row.shortName ?? row.symbol, 28))}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="terminal-price-stack">
              <strong>${formatCompact(row.shareVolume)}</strong>
              <div class="meta">avg ${formatCompact(row.averageShareVolume)}</div>
            </div>
          </td>
          <td>${formatRatio(row.relativeVolume)}</td>
          <td>
            <div class="terminal-price-stack">
              <strong>${formatCompact(row.callVolume)} / ${formatCompact(row.putVolume)}</strong>
              <div class="meta">last ${formatMoney(row.price)}</div>
            </div>
          </td>
          <td>${formatRatio(row.putCallRatio)}</td>
          <td>${formatCompact(row.openInterest)}</td>
          <td>
            <div class="terminal-price-stack">
              <strong>${formatNumber(row.shortRatio, 2)}</strong>
              <div class="meta">${formatCompact(row.sharesShort)}</div>
            </div>
          </td>
          <td>${escapeHtml(row.analystRating ?? "n/a")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderCompanyMapSummary(payload) {
  return [
    renderTerminalStat("Symbol", payload.symbol ?? "n/a", payload.market?.industry ?? "company map"),
    renderTerminalStat("Last", formatMoney(payload.quote?.price), payload.quote?.exchange ?? "public quote"),
    renderTerminalStat("Suppliers", String(payload.suppliers?.length ?? 0), "upstream links"),
    renderTerminalStat("Customers", String(payload.customers?.length ?? 0), "downstream links"),
    renderTerminalStat("Indices", String(payload.indices?.length ?? 0), "major benchmarks"),
    renderTerminalStat("Holders", String(payload.holders?.length ?? 0), "public owners"),
    renderTerminalStat("Board", String(payload.board?.length ?? 0), "officers / directors"),
  ].join("");
}

function renderCompanyMapIndices(indices) {
  if (!indices.length) {
    return renderIntelEmpty("No major public index memberships were found in the current sources.");
  }

  return indices
    .map(
      (item) => `
        <div class="list-item terminal-list-item">
          <div class="terminal-list-main">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <div class="meta">${escapeHtml(item.note ?? "")}</div>
            </div>
          </div>
          <div class="terminal-price-stack">
            <strong>${escapeHtml(item.vehicle ?? "Index")}</strong>
            <div class="meta">${item.sourceUrl ? `<a class="event-link" href="${safeUrl(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.source ?? "Source")}</a>` : escapeHtml(item.source ?? "Source")}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCompanyMapRelations(items, emptyMessage) {
  if (!items.length) {
    return renderIntelEmpty(emptyMessage);
  }

  return items
    .map(
      (item) => `
        <div class="list-item intel-list-item company-map-link${item.symbol ? " has-symbol" : ""}"${item.symbol ? ` data-company-map-symbol="${escapeHtml(item.symbol)}"` : ""}>
          <div class="intel-list-main">
            <span class="intel-tag">${escapeHtml(compactLabel(item.relation ?? "link", 16))}</span>
            <div>
              <strong>${escapeHtml(item.target ?? "n/a")}</strong>
              <div class="meta">${escapeHtml(item.label ?? "")}</div>
            </div>
          </div>
          <div class="intel-domain">${escapeHtml((item.symbol ?? item.domain ?? "map").toUpperCase())}</div>
        </div>
      `,
    )
    .join("");
}

function renderCompanyMapCompare(primary, secondary, warning = "") {
  const summary = document.querySelector("#companyMapCompareSummary");
  const shell = document.querySelector("#companyMapCompareShell");
  if (!summary || !shell) {
    return;
  }

  if (!primary || !secondary) {
    summary.innerHTML = warning
      ? `<div class="panel-status-chip warn">${escapeHtml(warning)}</div>`
      : `<div class="panel-status-chip muted">Load a second symbol to compare suppliers, customers, indices, holders, and competitors side by side.</div>`;
    shell.innerHTML = "";
    return;
  }

  const primarySupplierSet = new Set((primary.suppliers ?? []).map((item) => relationCompareKey(item)));
  const primaryCustomerSet = new Set((primary.customers ?? []).map((item) => relationCompareKey(item)));
  const primaryHolderSet = new Set((primary.holders ?? []).map((item) => compareKey(item.holder)));
  const primaryIndexSet = new Set((primary.indices ?? []).map((item) => compareKey(item.label)));

  const sharedSuppliers = (secondary.suppliers ?? []).filter((item) => primarySupplierSet.has(relationCompareKey(item)));
  const sharedCustomers = (secondary.customers ?? []).filter((item) => primaryCustomerSet.has(relationCompareKey(item)));
  const sharedHolders = (secondary.holders ?? []).filter((item) => primaryHolderSet.has(compareKey(item.holder)));
  const sharedIndices = (secondary.indices ?? []).filter((item) => primaryIndexSet.has(compareKey(item.label)));

  summary.innerHTML = [
    renderTerminalStat("Compare", `${primary.symbol} / ${secondary.symbol}`, "dual company map"),
    renderTerminalStat("Shared Indices", String(sharedIndices.length), sharedIndices.slice(0, 2).map((item) => item.label).join(" · ") || "none"),
    renderTerminalStat("Supplier Overlap", String(sharedSuppliers.length), sharedSuppliers[0]?.target ?? "no overlap"),
    renderTerminalStat("Customer Overlap", String(sharedCustomers.length), sharedCustomers[0]?.target ?? "no overlap"),
    renderTerminalStat("Holder Overlap", String(sharedHolders.length), sharedHolders[0]?.holder ?? "no overlap"),
    renderTerminalStat(
      "Sector",
      primary.market?.sector === secondary.market?.sector ? primary.market?.sector ?? "mixed" : "cross-sector",
      secondary.market?.sector ?? "n/a",
    ),
  ].join("");

  shell.innerHTML = `
    ${renderCompanyMapCompareColumn(primary, "Primary")}
    ${renderCompanyMapCompareColumn(secondary, "Compare")}
  `;
}

function renderCompanyMapCompareColumn(payload, label) {
  return `
    <article class="subpanel company-map-compare-panel">
      <div class="subpanel-header company-map-compare-header">
        <div>
          <div class="section-label">${escapeHtml(label)}</div>
          <h3>${escapeHtml(payload.symbol)} · ${escapeHtml(payload.companyName ?? payload.symbol)}</h3>
        </div>
        <div class="terminal-price-stack">
          <strong>${formatMoney(payload.quote?.price)}</strong>
          <div class="meta ${tone(payload.quote?.changePercent)}">${formatPercent(payload.quote?.changePercent)}</div>
        </div>
      </div>
      <div class="company-map-compare-mini-grid">
        ${renderTerminalStat("Sector", payload.market?.sector ?? "n/a", payload.market?.industry ?? "public map")}
        ${renderTerminalStat("Indices", String(payload.indices?.length ?? 0), payload.indices?.[0]?.label ?? "none")}
        ${renderTerminalStat("Suppliers", String(payload.suppliers?.length ?? 0), payload.suppliers?.[0]?.target ?? "none")}
        ${renderTerminalStat("Customers", String(payload.customers?.length ?? 0), payload.customers?.[0]?.target ?? "none")}
      </div>
      <div class="company-map-compare-block">
        <div class="subpanel-header compact-header">
          <h4>Suppliers</h4>
          <div class="muted">upstream</div>
        </div>
        <div class="list-stack">${renderCompanyMapRelations((payload.suppliers ?? []).slice(0, 5), "No supplier links.")}</div>
      </div>
      <div class="company-map-compare-block">
        <div class="subpanel-header compact-header">
          <h4>Customers</h4>
          <div class="muted">demand side</div>
        </div>
        <div class="list-stack">${renderCompanyMapRelations((payload.customers ?? []).slice(0, 5), "No customer links.")}</div>
      </div>
      <div class="company-map-compare-block">
        <div class="subpanel-header compact-header">
          <h4>Indices</h4>
          <div class="muted">major benchmarks</div>
        </div>
        <div class="list-stack">${renderCompanyMapIndices((payload.indices ?? []).slice(0, 4))}</div>
      </div>
      <div class="company-map-compare-block">
        <div class="subpanel-header compact-header">
          <h4>Top Holders</h4>
          <div class="muted">public owners</div>
        </div>
        <div class="list-stack">${renderCompanyMapHolderList((payload.holders ?? []).slice(0, 5))}</div>
      </div>
      <div class="company-map-compare-block">
        <div class="subpanel-header compact-header">
          <h4>Competition</h4>
          <div class="muted">nearby public comps</div>
        </div>
        <div class="list-stack">${renderCompanyMapCompetitorList((payload.competitors ?? []).slice(0, 5))}</div>
      </div>
    </article>
  `;
}

function renderCompanyMapCompetitors(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No competitor data is available.</td></tr>`;
  }

  return items
    .map(
      (item, index) => `
        <tr class="intel-row ${tone(item.changePercent)}"${item.symbol ? ` data-company-map-symbol="${escapeHtml(item.symbol)}"` : ""}>
          <td>
            <div class="holder-cell">
              <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>${escapeHtml(item.symbol ?? "n/a")}</strong>
                <div class="muted">${escapeHtml(item.companyName ?? "n/a")}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(item.companyName ?? "n/a")}</td>
          <td>${formatMoney(item.price)}</td>
          <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderCompanyMapHolders(items) {
  if (!items.length) {
    return `<tr><td colspan="3" class="muted">No public holder rows are available.</td></tr>`;
  }

  return items
    .map(
      (holder, index) => `
        <tr class="intel-row">
          <td>
            <div class="holder-cell">
              <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>${escapeHtml(holder.holder ?? "n/a")}</strong>
                <div class="muted">ownership filing</div>
              </div>
            </div>
          </td>
          <td>${formatPercentScaled(holder.pctHeld)}</td>
          <td>${formatCompact(holder.shares)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderCompanyMapBoard(items) {
  if (!items.length) {
    return renderIntelEmpty("No public officer or board rows are available.");
  }

  return items
    .map(
      (item) => renderIntelListItem(
        item.title ?? "Officer",
        item.name ?? "n/a",
        item.totalPay != null ? `Comp ${formatMoney(item.totalPay)}` : item.age != null ? `Age ${item.age}` : "Public company officer listing",
      ),
    )
    .join("");
}

function renderCompanyMapHolderList(items) {
  if (!items.length) {
    return renderIntelEmpty("No public holder rows are available.");
  }

  return items
    .map((item) => renderIntelListItem(item.holder ?? "Holder", formatPercentScaled(item.pctHeld), formatCompact(item.shares)))
    .join("");
}

function renderCompanyMapCompetitorList(items) {
  if (!items.length) {
    return renderIntelEmpty("No competitor rows are available.");
  }

  return items
    .map(
      (item) => `
        <div class="list-item intel-list-item company-map-link${item.symbol ? " has-symbol" : ""}"${item.symbol ? ` data-company-map-symbol="${escapeHtml(item.symbol)}"` : ""}>
          <div class="intel-list-main">
            <span class="intel-tag">${escapeHtml(item.symbol ?? "peer")}</span>
            <div>
              <strong>${escapeHtml(item.companyName ?? item.symbol ?? "n/a")}</strong>
              <div class="meta">${formatMoney(item.price)} | ${formatPercent(item.changePercent)}</div>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCompanyMapInsiders(holders, transactions) {
  const rows = [
    ...(holders ?? []).map((item) =>
      renderIntelListItem(
        item.relation ?? "Insider holder",
        item.name ?? "n/a",
        item.positionDirect != null ? `Direct ${formatCompact(item.positionDirect)} shares` : "Public insider holding",
      ),
    ),
    ...(transactions ?? []).slice(0, 6).map((item) =>
      renderIntelListItem(
        item.position ?? "Insider trade",
        item.insider ?? "n/a",
        item.transactionText ?? item.ownership ?? "Public insider transaction",
      ),
    ),
  ];

  return rows.join("") || renderIntelEmpty("No insider holdings or transaction rows are available.");
}

function relationCompareKey(item) {
  return `${compareKey(item?.target)}:${compareKey(item?.relation)}`;
}

function compareKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function filterCalendarEvents(events, { filter = "all", windowDays = 30 } = {}) {
  const now = Date.now();
  const max = now + windowDays * 24 * 60 * 60 * 1000;
  return (events ?? [])
    .filter((event) => {
      const timestamp = Date.parse(event.date);
      if (!Number.isFinite(timestamp) || timestamp < now - 24 * 60 * 60 * 1000 || timestamp > max) {
        return false;
      }
      if (filter === "all") {
        return true;
      }
      if (filter === "macro") {
        return event.category !== "earnings" && event.category !== "policy";
      }
      return event.category === filter;
    })
    .sort((left, right) => new Date(left.date) - new Date(right.date));
}

function renderBarChart(values, labels, caption, suffix) {
  const safeValues = values.filter((value) => Number.isFinite(value));
  const max = Math.max(...safeValues, 0);
  const barWidth = 640 / Math.max(values.length, 1);

  const bars = values
    .map((value, index) => {
      const height = max ? (value / max) * 150 : 0;
      const x = 34 + index * barWidth;
      const y = 190 - height;
      return `
        <rect x="${x}" y="${y}" width="${Math.max(barWidth - 12, 16)}" height="${height}" rx="8" fill="rgba(53, 240, 210, 0.72)"></rect>
        <text x="${x + 6}" y="210" fill="#8ea1c7" font-size="12">${escapeHtml(labels[index])}</text>
        <text x="${x + 2}" y="${y - 8}" fill="#eff7ff" font-size="11">${value.toFixed(2)}${suffix}</text>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 720 240" preserveAspectRatio="none">
      <text x="12" y="24" fill="#eff7ff" font-size="22">Yield Curve</text>
      <text x="12" y="44" fill="#8ea1c7" font-size="13">Treasury daily curve as of ${escapeHtml(caption)}</text>
      ${bars}
    </svg>
  `;
}

function renderCryptoCard(quote) {
  return `
    <article class="crypto-card">
      <div class="meta">${escapeHtml(quote.productId ?? "")}</div>
      <div class="value">${formatMoney(quote.price)}</div>
      <div class="${tone(quote.changePercent24h)}">${formatPercent(quote.changePercent24h)}</div>
      <div class="meta">Bid ${formatMoney(quote.bestBid)} | Ask ${formatMoney(quote.bestAsk)}</div>
    </article>
  `;
}

function renderQuoteListItem(quote) {
  return `
    <div class="list-item terminal-list-item">
      <div class="terminal-list-main">
        <div class="terminal-symbol-line">
          <strong>${escapeHtml(quote.symbol)}</strong>
          <span class="terminal-chip ${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</span>
        </div>
        <div class="meta">${escapeHtml(quote.shortName ?? quote.name ?? "")}</div>
      </div>
      <div class="terminal-price-stack">
        <strong>${formatMoney(quote.price)}</strong>
        <div class="meta">${escapeHtml(quote.exchange ?? "")}</div>
      </div>
    </div>
  `;
}

function renderIntelListItem(label, title, description) {
  const domain = intelDomain(label, description);
  return `
    <div class="list-item intel-list-item intel-${escapeHtml(domain)}">
      <div class="intel-list-main">
        <span class="intel-tag">${escapeHtml(compactLabel(label ?? "intel"))}</span>
        <div>
          <strong>${escapeHtml(title ?? "n/a")}</strong>
          <div class="meta">${escapeHtml(description ?? "")}</div>
        </div>
      </div>
      <div class="intel-domain">${escapeHtml(domain.toUpperCase())}</div>
    </div>
  `;
}

function renderWatchlistSummary(quotes) {
  const advancers = quotes.filter((quote) => Number.isFinite(quote.changePercent) && quote.changePercent >= 0).length;
  const decliners = quotes.filter((quote) => Number.isFinite(quote.changePercent) && quote.changePercent < 0).length;
  const averageMove = average(quotes.map((quote) => quote.changePercent));
  const aggregateCap = sum(quotes.map((quote) => quote.marketCap));
  const averageSpreadBps = average(quotes.map((quote) => spreadBps(quote)));

  return [
    renderTerminalStat("Breadth", `${advancers} up / ${decliners} down`, "tracked movers"),
    renderTerminalStat("Average Move", formatPercent(averageMove), "watchlist mean"),
    renderTerminalStat("Spread", formatBasisPoints(averageSpreadBps), "avg quoted width"),
    renderTerminalStat("Aggregate Cap", formatCompact(aggregateCap), "market footprint"),
  ].join("");
}

function renderWatchlistRow(quote, index) {
  const spread = computeSpread(quote);
  const spreadWidth = spreadBps(quote);
  const dayRange = quote.dayHigh != null && quote.dayLow != null ? quote.dayHigh - quote.dayLow : null;
  return `
    <tr class="watchlist-row ${tone(quote.changePercent)}">
      <td>
        <div class="watchlist-symbol-cell">
          <span class="table-rank">${String(index + 1).padStart(2, "0")}</span>
          <div>
            <div class="terminal-symbol-line">
              <strong>${escapeHtml(quote.symbol)}</strong>
              <span class="terminal-chip">${escapeHtml(quote.exchange ?? quote.type ?? "market")}</span>
            </div>
            <div class="meta">${escapeHtml(quote.shortName ?? "")}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="terminal-price-stack">
          <strong>${formatMoney(quote.price)}</strong>
          <div class="meta">range ${formatMoney(dayRange)}</div>
        </div>
      </td>
      <td>
        <div class="terminal-price-stack">
          <strong class="${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</strong>
          <div class="meta">${formatSignedMoney(quote.change)}</div>
        </div>
      </td>
      <td>
        <div class="terminal-price-stack">
          <strong>${formatMoney(quote.bid)} / ${formatMoney(quote.ask)}</strong>
          <div class="meta">width ${formatMoney(spread)} · ${formatBasisPoints(spreadWidth)}</div>
        </div>
      </td>
      <td>
        <div class="terminal-price-stack">
          <strong>${formatCompact(quote.volume)}</strong>
          <div class="meta">avg ${formatCompact(quote.averageVolume)}</div>
        </div>
      </td>
      <td>
        <div class="terminal-price-stack">
          <strong>${formatCompact(quote.marketCap)}</strong>
          <div class="meta">${escapeHtml(quote.currency ?? "USD")} settlement</div>
        </div>
      </td>
    </tr>
  `;
}

function renderIntelSignals(payload, holders) {
  return [
    renderTerminalStat("Coverage", payload.coverage.curated ? "Curated" : "Fallback", "source mode"),
    renderTerminalStat("Peers", String(payload.competitors?.length ?? 0), "tracked rivals"),
    renderTerminalStat("Impact Chains", String(payload.eventChains?.length ?? 0), "mapped catalysts"),
    renderTerminalStat("Holders", String(holders.length), "unique top owners"),
  ].join("");
}

function renderTerminalStat(label, value, meta) {
  return `
    <article class="terminal-stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(meta)}</small>
    </article>
  `;
}

function renderWorkbenchSummary(quote, company, points) {
  const closes = (points ?? []).map((point) => point.close).filter(Number.isFinite);
  const trend = closes.length >= 2 ? closes.at(-1) - closes[0] : null;
  const rangeLabel = historyRangeLabel(state.currentHistoryRange);
  const ratingValue = company?.market?.analystRating ?? humanizeInstrumentType(quote);
  const ratingMeta = company?.market?.analystRating ? (company?.market?.exchange ?? "market") : "security type";
  return [
    renderTerminalStat("Last", formatMoney(quote?.price), "current print"),
    renderTerminalStat(`${rangeLabel} Trend`, formatSignedMoney(trend), "window move"),
    renderTerminalStat("Share Vol", formatCompact(quote?.volume), formatCompact(quote?.averageVolume ?? null) !== "n/a" ? `avg ${formatCompact(quote?.averageVolume)}` : "public tape"),
    renderTerminalStat("52W Range", `${formatMoney(company?.market?.fiftyTwoWeekLow)} / ${formatMoney(company?.market?.fiftyTwoWeekHigh)}`, "low / high"),
    renderTerminalStat(company?.market?.analystRating ? "Analyst" : "Instrument", ratingValue, ratingMeta),
  ].join("");
}

function renderOptionsSummary(options, quote) {
  const calls = options?.calls ?? [];
  const puts = options?.puts ?? [];
  const frontCall = calls[0] ?? null;
  const frontPut = puts[0] ?? null;
  const callVolume = sum(calls.map((contract) => contract.volume)) ?? null;
  const putVolume = sum(puts.map((contract) => contract.volume)) ?? null;
  const openInterest = sum([...calls, ...puts].map((contract) => contract.openInterest)) ?? null;
  return [
    renderTerminalStat("Calls", String(calls?.length ?? 0), "visible contracts"),
    renderTerminalStat("Puts", String(puts?.length ?? 0), "visible contracts"),
    renderTerminalStat("Call Vol", formatCompact(callVolume), "session"),
    renderTerminalStat("Put Vol", formatCompact(putVolume), "session"),
    renderTerminalStat("Open Int", formatCompact(openInterest), "listed contracts"),
    renderTerminalStat("Front Call IV", formatPercent((frontCall?.impliedVolatility ?? NaN) * 100), frontCall ? "top-of-book" : humanizeInstrumentType(quote)),
    renderTerminalStat("Front Put IV", formatPercent((frontPut?.impliedVolatility ?? NaN) * 100), frontPut ? "top-of-book" : options?.warning ? "feed blocked" : "no contract"),
  ].join("");
}

function renderIntelNote(note, index) {
  return `
    <div class="list-item intel-note-item">
      <div class="intel-note-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="meta">${escapeHtml(note)}</div>
    </div>
  `;
}

function renderImpactChain(chain, index) {
  return `
    <div class="intel-sequence">
      <div class="terminal-symbol-line">
        <strong>${escapeHtml(chain.title)}</strong>
        <span class="terminal-chip">${String(index + 1).padStart(2, "0")}</span>
      </div>
      <div class="chain-steps">
        ${chain.steps.map((step) => `<span class="chain-step">${escapeHtml(step)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderIntelList(...items) {
  const rows = items.filter(Boolean);
  return rows.join("") || renderIntelEmpty("No mapped relationships in this pane.");
}

function renderIntelEmpty(message) {
  return `<div class="list-item intel-empty"><div class="meta">${escapeHtml(message)}</div></div>`;
}

function metric(label, value, toneClass = "") {
  return `<div class="metric-card"><div class="label">${escapeHtml(label)}</div><div class="value ${toneClass}">${escapeHtml(value)}</div></div>`;
}

function fact(label, value, meta = "") {
  return `<div class="fact-card"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(value)}</div><div class="label">${escapeHtml(meta ?? "")}</div></div>`;
}

function secFact(label, factPayload) {
  if (!factPayload) {
    return fact(label, "n/a", "");
  }
  return fact(label, formatCompact(factPayload.value), `${factPayload.form ?? ""} ${factPayload.periodEnd ?? ""}`);
}

function mergePreferences(preferences) {
  return {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    watchlistSymbols: Array.isArray(preferences?.watchlistSymbols)
      ? preferences.watchlistSymbols
      : [...DEFAULT_PREFERENCES.watchlistSymbols],
    researchPinnedSymbols: Array.isArray(preferences?.researchPinnedSymbols)
      ? preferences.researchPinnedSymbols
      : [...DEFAULT_PREFERENCES.researchPinnedSymbols],
    cryptoProducts: Array.isArray(preferences?.cryptoProducts)
      ? preferences.cryptoProducts
      : [...DEFAULT_PREFERENCES.cryptoProducts],
    portfolio: Array.isArray(preferences?.portfolio) ? preferences.portfolio : [],
    companyMapCompareSymbol:
      typeof preferences?.companyMapCompareSymbol === "string"
        ? preferences.companyMapCompareSymbol
        : DEFAULT_PREFERENCES.companyMapCompareSymbol,
    newsFocus: typeof preferences?.newsFocus === "string" ? preferences.newsFocus : "",
    sectorFocus: typeof preferences?.sectorFocus === "string" ? preferences.sectorFocus : DEFAULT_PREFERENCES.sectorFocus,
    activePage: normalizePage(preferences?.activePage),
    panelLayout: normalizePanelLayout(preferences?.panelLayout),
    panelSizes: normalizePanelSizes(preferences?.panelSizes),
    screenConfig: {
      ...DEFAULT_PREFERENCES.screenConfig,
      ...(preferences?.screenConfig ?? {}),
    },
  };
}

function splitSymbols(text) {
  return text
    .split(/[,\n\r\t ]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);
}

function inferNewsFocusSymbol(query) {
  const clean = String(query ?? "").trim();
  if (!clean) {
    return null;
  }
  const normalized = clean.toUpperCase();
  return /^[A-Z0-9.^=\-]{1,12}$/.test(normalized) ? normalized : null;
}

function resolveHistoryInterval(range) {
  return {
    "1d": "5m",
    "1w": "30m",
    "1mo": "1h",
    "3mo": "1d",
    "6mo": "1d",
    "1y": "1wk",
  }[range] ?? "1d";
}

function buildLinePath(values, width, height) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * (width - 20) + 10;
    const y = height - ((value - min) / range) * (height - 30) - 10;
    return [x, y];
  });
  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L ${points.at(-1)[0].toFixed(2)} ${(height - 6).toFixed(2)} L ${points[0][0].toFixed(2)} ${(height - 6).toFixed(2)} Z`;
  return { line, area };
}

function mountLineChart(container, options) {
  if (!container) {
    return;
  }

  const points = (options.points ?? []).filter((point) => Number.isFinite(point.value));
  if (!points.length) {
    container.innerHTML = "<p class='muted'>No chart data available.</p>";
    return;
  }

  const width = 760;
  const height = 280;
  const padding = { top: 42, right: 18, bottom: 26, left: 16 };
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const gradientId = `interactive-line-fill-${String(options.title ?? "chart").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const coords = points.map((point, index) => {
    const x = padding.left + (index / Math.max(points.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((point.value - min) / range) * chartHeight;
    return { ...point, x, y };
  });
  const path = buildLinePath(values, chartWidth, chartHeight);
  const areaPath = path.area
    .replaceAll(/(^| )([0-9.]+) ([0-9.]+)/g, (match, prefix, x, y) => `${prefix}${(Number(x) + padding.left).toFixed(2)} ${(Number(y) + padding.top).toFixed(2)}`);
  const linePath = path.line
    .replaceAll(/(^| )([0-9.]+) ([0-9.]+)/g, (match, prefix, x, y) => `${prefix}${(Number(x) + padding.left).toFixed(2)} ${(Number(y) + padding.top).toFixed(2)}`);
  const accent = options.accent ?? "#35f0d2";

  container.innerHTML = `
    <div class="interactive-chart interactive-chart-line">
      <div class="interactive-chart-heading">
        <div>
          <div class="interactive-chart-title">${escapeHtml(options.title ?? "Chart")}</div>
          <div class="interactive-chart-subtitle">${escapeHtml(options.subtitle ?? "")}</div>
        </div>
        <div class="interactive-chart-range">
          <span>High ${escapeHtml((options.valueFormatter ?? String)(max))}</span>
          <span>Low ${escapeHtml((options.valueFormatter ?? String)(min))}</span>
        </div>
      </div>
      <div class="interactive-chart-frame">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${escapeHtml(options.title ?? "chart")}">
          <defs>
            <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
              <stop offset="100%" stop-color="${accent}" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" class="chart-axis"></line>
          <path d="${areaPath}" fill="url(#${gradientId})"></path>
          <path d="${linePath}" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round"></path>
          <line class="chart-crosshair" x1="${coords.at(-1).x}" x2="${coords.at(-1).x}" y1="${padding.top}" y2="${padding.top + chartHeight}"></line>
          <circle class="chart-marker" cx="${coords.at(-1).x}" cy="${coords.at(-1).y}" r="4.5" fill="${accent}"></circle>
        </svg>
        <div class="chart-tooltip">
          <strong></strong>
          <span></span>
          <small></small>
        </div>
      </div>
    </div>
  `;

  bindInteractiveChart(container, coords, {
    valueFormatter: options.valueFormatter ?? ((value) => String(value)),
    labelFormatter: options.labelFormatter ?? ((value) => formatDateShort(value)),
    viewWidth: width,
    viewHeight: height,
  });
}

function mountBarChart(container, options) {
  if (!container) {
    return;
  }

  const points = (options.points ?? []).filter((point) => Number.isFinite(point.value));
  if (!points.length) {
    container.innerHTML = "<p class='muted'>No chart data available.</p>";
    return;
  }

  const width = 760;
  const height = 240;
  const padding = { top: 40, right: 18, bottom: 32, left: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...points.map((point) => point.value), 0);
  const barWidth = chartWidth / points.length;
  const accent = options.accent ?? "#7cc5ff";
  const geometry = points.map((point, index) => {
    const heightValue = max ? (point.value / max) * chartHeight : 0;
    const x = padding.left + index * barWidth + 6;
    const y = padding.top + chartHeight - heightValue;
    return {
      ...point,
      x,
      y,
      width: Math.max(barWidth - 12, 16),
      height: heightValue,
      centerX: x + Math.max(barWidth - 12, 16) / 2,
    };
  });

  container.innerHTML = `
    <div class="interactive-chart interactive-chart-bar">
      <div class="interactive-chart-heading">
        <div>
          <div class="interactive-chart-title">${escapeHtml(options.title ?? "Chart")}</div>
          <div class="interactive-chart-subtitle">${escapeHtml(options.subtitle ?? "")}</div>
        </div>
      </div>
      <div class="interactive-chart-frame">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${escapeHtml(options.title ?? "chart")}">
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" class="chart-axis"></line>
          ${geometry
            .map(
              (point) => `
                <rect x="${point.x}" y="${point.y}" width="${point.width}" height="${point.height}" rx="7" fill="${accent}" fill-opacity="0.82"></rect>
                <text x="${point.centerX}" y="${padding.top + chartHeight + 16}" text-anchor="middle" class="chart-bar-label">${escapeHtml(point.label)}</text>
              `,
            )
            .join("")}
          <line class="chart-crosshair" x1="${geometry.at(-1).centerX}" x2="${geometry.at(-1).centerX}" y1="${padding.top}" y2="${padding.top + chartHeight}"></line>
          <circle class="chart-marker" cx="${geometry.at(-1).centerX}" cy="${geometry.at(-1).y}" r="4.5" fill="${accent}"></circle>
        </svg>
        <div class="chart-tooltip">
          <strong></strong>
          <span></span>
          <small></small>
        </div>
      </div>
    </div>
  `;

  bindInteractiveChart(container, geometry.map((point) => ({ ...point, x: point.centerX })), {
    valueFormatter: options.valueFormatter ?? ((value) => String(value)),
    labelFormatter: options.labelFormatter ?? ((value) => value),
    viewWidth: width,
    viewHeight: height,
  });
}

function bindInteractiveChart(container, coords, options) {
  const frame = container.querySelector(".interactive-chart-frame");
  const tooltip = container.querySelector(".chart-tooltip");
  const crosshair = container.querySelector(".chart-crosshair");
  const marker = container.querySelector(".chart-marker");
  if (!frame || !tooltip || !crosshair || !marker || !coords.length) {
    return;
  }

  const update = (index) => {
    const point = coords[clamp(index, 0, coords.length - 1)];
    tooltip.querySelector("strong").textContent = options.valueFormatter(point.value);
    tooltip.querySelector("span").textContent = options.labelFormatter(point.label);
    tooltip.querySelector("small").textContent = point.meta ?? "";
    crosshair.setAttribute("x1", String(point.x));
    crosshair.setAttribute("x2", String(point.x));
    marker.setAttribute("cx", String(point.x));
    marker.setAttribute("cy", String(point.y));
    const viewWidth = options.viewWidth ?? 760;
    const viewHeight = options.viewHeight ?? 280;
    const tooltipLeft = clamp((point.x / viewWidth) * frame.clientWidth - 70, 8, Math.max(frame.clientWidth - 148, 8));
    const tooltipTop = clamp((point.y / viewHeight) * frame.clientHeight - 68, 8, Math.max(frame.clientHeight - 70, 8));
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
  };

  update(coords.length - 1);
  frame.addEventListener("mousemove", (event) => {
    const rect = frame.getBoundingClientRect();
    const relative = clamp((event.clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
    update(Math.round(relative * (coords.length - 1)));
  });
  frame.addEventListener("mouseenter", () => {
    tooltip.hidden = false;
  });
  frame.addEventListener("mouseleave", () => {
    tooltip.hidden = false;
    update(coords.length - 1);
  });
}

function mountCandlestickChart(container, options) {
  if (!container) {
    return;
  }

  const points = (options.points ?? []).filter(
    (point) => Number.isFinite(point.open) && Number.isFinite(point.high) && Number.isFinite(point.low) && Number.isFinite(point.close),
  );
  if (!points.length) {
    container.innerHTML = "<p class='muted'>No chart data available.</p>";
    return;
  }

  const sample = points.slice(-Math.min(points.length, 52));
  const width = 760;
  const height = 320;
  const padding = { top: 40, right: 18, bottom: 34, left: 16 };
  const volumeBand = 58;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom - volumeBand;
  const min = Math.min(...sample.map((point) => point.low));
  const max = Math.max(...sample.map((point) => point.high));
  const range = max - min || 1;
  const maxVolume = Math.max(...sample.map((point) => point.volume ?? 0), 0);
  const candleWidth = Math.max(Math.min(chartWidth / sample.length - 4, 12), 3);
  const coords = sample.map((point, index) => {
    const slotX = padding.left + (index / Math.max(sample.length - 1, 1)) * chartWidth;
    const x = slotX - candleWidth / 2;
    const openY = padding.top + chartHeight - ((point.open - min) / range) * chartHeight;
    const closeY = padding.top + chartHeight - ((point.close - min) / range) * chartHeight;
    const highY = padding.top + chartHeight - ((point.high - min) / range) * chartHeight;
    const lowY = padding.top + chartHeight - ((point.low - min) / range) * chartHeight;
    const volumeHeight = maxVolume ? ((point.volume ?? 0) / maxVolume) * (volumeBand - 18) : 0;
    return {
      ...point,
      x,
      centerX: slotX,
      openY,
      closeY,
      highY,
      lowY,
      bodyY: Math.min(openY, closeY),
      bodyHeight: Math.max(Math.abs(closeY - openY), 1.5),
      width: candleWidth,
      volumeHeight,
    };
  });
  const last = coords.at(-1);

  container.innerHTML = `
    <div class="interactive-chart interactive-chart-candle">
      <div class="interactive-chart-heading">
        <div>
          <div class="interactive-chart-title">${escapeHtml(options.title ?? "Chart")}</div>
          <div class="interactive-chart-subtitle">${escapeHtml(options.subtitle ?? "")}</div>
        </div>
        <div class="interactive-chart-range">
          <span>High ${escapeHtml((options.valueFormatter ?? String)(max))}</span>
          <span>Low ${escapeHtml((options.valueFormatter ?? String)(min))}</span>
        </div>
      </div>
      <div class="interactive-chart-frame">
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${escapeHtml(options.title ?? "chart")}">
          <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" class="chart-axis"></line>
          <line x1="${padding.left}" y1="${padding.top + chartHeight + volumeBand}" x2="${width - padding.right}" y2="${padding.top + chartHeight + volumeBand}" class="chart-axis chart-axis-muted"></line>
          ${coords
            .map(
              (point) => `
                <line x1="${point.centerX}" x2="${point.centerX}" y1="${point.highY}" y2="${point.lowY}" class="candle-wick ${point.close >= point.open ? "positive" : "negative"}"></line>
                <rect
                  x="${point.x}"
                  y="${point.bodyY}"
                  width="${point.width}"
                  height="${point.bodyHeight}"
                  class="candle-body ${point.close >= point.open ? "positive" : "negative"}"
                ></rect>
                <rect
                  x="${point.x}"
                  y="${padding.top + chartHeight + volumeBand - point.volumeHeight}"
                  width="${point.width}"
                  height="${point.volumeHeight}"
                  class="candle-volume ${point.close >= point.open ? "positive" : "negative"}"
                ></rect>
              `,
            )
            .join("")}
          <line class="chart-crosshair" x1="${last.centerX}" x2="${last.centerX}" y1="${padding.top}" y2="${padding.top + chartHeight + volumeBand}"></line>
          <circle class="chart-marker" cx="${last.centerX}" cy="${last.closeY}" r="4.5"></circle>
        </svg>
        <div class="chart-tooltip">
          <strong></strong>
          <span></span>
          <small></small>
        </div>
      </div>
    </div>
  `;

  bindInteractiveChart(
    container,
    coords.map((point) => ({
      ...point,
      x: point.centerX,
      y: point.closeY,
      value: point.close,
      meta: `O ${formatMoney(point.open)} | H ${formatMoney(point.high)} | L ${formatMoney(point.low)}${point.volume ? ` | Vol ${formatCompact(point.volume)}` : ""}`,
    })),
    {
      valueFormatter: options.valueFormatter ?? ((value) => String(value)),
      labelFormatter: options.labelFormatter ?? ((value) => formatDateShort(value)),
      viewWidth: width,
      viewHeight: height,
    },
  );
}

function mountGeoExposureChart(container, geography) {
  if (!container) {
    return;
  }
  const groups = [
    { title: "Revenue", items: geography.revenueMix ?? [] },
    { title: "Manufacturing", items: geography.manufacturing ?? [] },
    { title: "Supply", items: geography.supplyRegions ?? [] },
  ].filter((group) => group.items.length);

  if (!groups.length) {
    container.innerHTML = "<p class='muted'>No geographic exposure mapped.</p>";
    return;
  }

  container.innerHTML = `
    <div class="geo-board">
      ${groups
        .map(
          (group) => `
            <section class="geo-column">
              <div class="geo-column-title">${escapeHtml(group.title)}</div>
              <div class="geo-column-body">
                ${group.items
                  .slice(0, 4)
                  .map(
                    (item) => `
                      <button type="button" class="geo-row">
                        <div class="geo-row-head">
                          <strong>${escapeHtml(item.label)}</strong>
                          <span>${escapeHtml(String(item.weight))}</span>
                        </div>
                        <div class="geo-row-bar"><span style="width:${clamp(item.weight * 20, 12, 100)}%"></span></div>
                        <div class="geo-row-note">${escapeHtml(item.commentary ?? "")}</div>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
          `,
        )
        .join("")}
    </div>
  `;
}

function mountIntelGraph(container, graph, symbol) {
  if (!container) {
    return;
  }
  container.innerHTML = renderIntelGraphNetwork(graph, symbol);
}

function renderIntelGraphNetwork(graph, symbol) {
  const root = graph.nodes.find((node) => node.id === symbol) ?? { id: symbol, label: symbol, kind: "issuer" };
  const edgeByTarget = new Map((graph.edges ?? []).map((edge) => [edge.target, edge]));
  const nodes = (graph.nodes ?? []).filter((node) => node.id !== symbol);
  const lanes = {
    corporate: nodes.filter((node) => ["subsidiary", "investment", "corporate"].includes(String(node.kind))),
    supply: nodes.filter((node) => ["supplier", "partner"].includes(String(node.kind))),
    customer: nodes.filter((node) => String(node.kind) === "customer"),
    market: nodes.filter((node) => ["competitor", "ecosystem"].includes(String(node.kind))),
  };

  const width = 860;
  const height = 460;
  const hub = { x: width / 2, y: height / 2 };
  const positioned = [
    ...layoutGraphLane(lanes.corporate, { xFrom: 170, xTo: 690, y: 72 }),
    ...layoutGraphLane(lanes.supply, { xFrom: 84, xTo: 84, yFrom: 146, yTo: 370 }),
    ...layoutGraphLane(lanes.customer, { xFrom: 776, xTo: 776, yFrom: 146, yTo: 370 }),
    ...layoutGraphLane(lanes.market, { xFrom: 170, xTo: 690, y: 396 }),
  ];
  const nodeMap = new Map(positioned.map((node) => [node.id, node]));

  const lines = (graph.edges ?? [])
    .map((edge) => {
      const target = nodeMap.get(edge.target);
      if (!target) {
        return "";
      }
      const controlX = target.x < hub.x ? hub.x - 110 : target.x > hub.x ? hub.x + 110 : hub.x;
      const controlY = target.y < hub.y ? hub.y - 80 : target.y > hub.y ? hub.y + 80 : hub.y;
      return `<path d="M ${hub.x} ${hub.y} C ${controlX} ${controlY}, ${target.x} ${target.y}, ${target.x} ${target.y}" class="graph-network-edge graph-edge-${escapeHtml(edge.domain)}"></path>`;
    })
    .join("");

  return `
    <div class="graph-network">
      <div class="graph-network-legend">
        <span class="graph-legend-item supply">Supply / Partner</span>
        <span class="graph-legend-item customer">Customer</span>
        <span class="graph-legend-item corporate">Corporate</span>
        <span class="graph-legend-item market">Competition / Ecosystem</span>
      </div>
      <div class="graph-lane-label graph-lane-top">Corporate</div>
      <div class="graph-lane-label graph-lane-left">Supply Chain</div>
      <div class="graph-lane-label graph-lane-right">Customers</div>
      <div class="graph-lane-label graph-lane-bottom">Market Map</div>
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="graph-network-lines" aria-hidden="true">
        ${lines}
      </svg>
      <div class="graph-network-hub">
        <span class="graph-hub-kicker">Issuer</span>
        <strong>${escapeHtml(root.label)}</strong>
        <small>${escapeHtml(symbol)}</small>
      </div>
      ${positioned
        .map((node) => {
          const edge = edgeByTarget.get(node.id);
          return `
            <button
              type="button"
              class="graph-network-node graph-network-node-${escapeHtml(graphToneForKind(node.kind))}"
              style="left:${node.x}px; top:${node.y}px;"
              ${node.symbol ? `data-graph-symbol="${escapeHtml(node.symbol)}"` : ""}
              title="${escapeHtml(`${node.label} | ${edge?.relation ?? node.kind}${edge?.label ? ` | ${edge.label}` : ""}`)}"
            >
              <span class="graph-network-node-title">${escapeHtml(node.label)}</span>
              <span class="graph-network-node-meta">${escapeHtml(edge?.relation ?? String(node.kind))}</span>
              <span class="graph-network-node-note">${escapeHtml(compactLabel(edge?.label ?? "", 60))}</span>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function layoutGraphLane(nodes, spec) {
  const list = nodes.slice(0, 10);
  if (!list.length) {
    return [];
  }

  return list.map((node, index) => {
    const progress = list.length === 1 ? 0.5 : index / (list.length - 1);
    const x = spec.xFrom === spec.xTo || spec.xTo == null
      ? spec.xFrom
      : spec.xFrom + progress * (spec.xTo - spec.xFrom);
    const y = spec.yFrom === spec.yTo || spec.yTo == null
      ? spec.y
      : spec.yFrom + progress * (spec.yTo - spec.yFrom);
    return { ...node, x, y };
  });
}

function graphToneForKind(kind) {
  if (["supplier", "partner"].includes(String(kind))) {
    return "supply";
  }
  if (String(kind) === "customer") {
    return "customer";
  }
  if (["subsidiary", "investment", "corporate"].includes(String(kind))) {
    return "corporate";
  }
  return "market";
}

function renderIntelGraph(graph, symbol) {
  const root = graph.nodes.find((node) => node.id === symbol) ?? { id: symbol, label: symbol, kind: "issuer" };
  const others = graph.nodes.filter((node) => node.id !== symbol);
  const width = 760;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 122;

  const positioned = others.map((node, index) => {
    const angle = (index / Math.max(others.length, 1)) * Math.PI * 2;
    return {
      ...node,
      x: centerX + Math.cos(angle) * radius * (index % 2 === 0 ? 1 : 1.2),
      y: centerY + Math.sin(angle) * radius,
    };
  });

  const nodeMap = new Map(positioned.map((node) => [node.id, node]));
  nodeMap.set(root.id, { ...root, x: centerX, y: centerY });

  const edges = graph.edges
    .map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) {
        return "";
      }
      return `
        <path d="M ${source.x} ${source.y} Q ${centerX} ${centerY - 20} ${target.x} ${target.y}" class="graph-edge graph-edge-${escapeHtml(edge.domain)}"></path>
        <text x="${(source.x + target.x) / 2}" y="${(source.y + target.y) / 2 - 6}" class="graph-label">${escapeHtml(edge.relation)}</text>
      `;
    })
    .join("");

  const nodes = [...nodeMap.values()]
    .map(
      (node) => `
        <g transform="translate(${node.x}, ${node.y})">
          <circle r="${node.id === symbol ? 34 : 24}" class="graph-node graph-node-${escapeHtml(node.kind)}"></circle>
          <text text-anchor="middle" dy="5" class="graph-node-label">${escapeHtml(node.label)}</text>
        </g>
      `,
    )
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="${escapeHtml(symbol)} relationship graph">
      <defs>
        <radialGradient id="graphGlow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="rgba(53, 240, 210, 0.28)" />
          <stop offset="100%" stop-color="rgba(53, 240, 210, 0)" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="transparent"></rect>
      <circle cx="${centerX}" cy="${centerY}" r="138" fill="url(#graphGlow)"></circle>
      ${edges}
      ${nodes}
    </svg>
  `;
}

function renderGeoExposure(geography) {
  const groups = [
    { title: "Revenue", items: geography.revenueMix ?? [] },
    { title: "Manufacturing", items: geography.manufacturing ?? [] },
    { title: "Supply", items: geography.supplyRegions ?? [] },
  ];

  const rows = groups
    .map(
      (group, groupIndex) => `
        <text x="12" y="${26 + groupIndex * 88}" class="geo-title">${escapeHtml(group.title)}</text>
        ${group.items
          .slice(0, 3)
          .map((item, index) => {
            const y = 42 + groupIndex * 88 + index * 20;
            const width = item.weight * 38;
            return `
              <text x="12" y="${y}" class="geo-label">${escapeHtml(item.label)}</text>
              <rect x="180" y="${y - 12}" width="${width}" height="10" rx="5" class="geo-bar"></rect>
              <text x="${188 + width}" y="${y - 2}" class="geo-note">${escapeHtml(item.commentary ?? "")}</text>
            `;
          })
          .join("")}
      `,
    )
    .join("");

  return `
    <svg viewBox="0 0 760 260" preserveAspectRatio="none" aria-label="Geographic exposure">
      <defs>
        <linearGradient id="geo-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="rgba(53, 240, 210, 0.9)"></stop>
          <stop offset="100%" stop-color="rgba(107, 162, 255, 0.9)"></stop>
        </linearGradient>
      </defs>
      ${rows}
    </svg>
  `;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }
  return payload;
}

function showStatus(message, isError) {
  const toast = document.querySelector("#statusToast");
  toast.hidden = false;
  toast.textContent = message;
  toast.classList.toggle("error", Boolean(isError));
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 4000);
}

function formatMoney(value) {
  return Number.isFinite(value) ? currencyFormatter.format(value) : "n/a";
}

function formatSignedMoney(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatMoney(value)}`;
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : "n/a";
}

function formatPercentScaled(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  return `${(value <= 1 ? value * 100 : value).toFixed(2)}%`;
}

function formatCompact(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)
    : "n/a";
}

function formatRatio(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}x` : "n/a";
}

function formatBasisPoints(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} bps` : "n/a";
}

function formatNumber(value, maximumFractionDigits = 2) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)
    : "n/a";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "n/a";
}

function formatDateShort(value) {
  return value
    ? new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
    : "n/a";
}

function formatDateTime(value) {
  return value
    ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "n/a";
}

function formatWindow(windowLike) {
  const start = windowLike?.start ?? null;
  const end = windowLike?.end ?? null;
  if (start && end) {
    return `${formatDateShort(start)}-${formatDateShort(end)}`;
  }
  return start ? formatDateShort(start) : end ? formatDateShort(end) : "n/a";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : "n/a";
}

function formatTimeAgo(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "n/a";
  }
  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${Math.round(diffHours / 24)}d ago`;
}

function formatTimestampShort(value) {
  if (!value) {
    return "live";
  }
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function tone(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  return value >= 0 ? "positive" : "negative";
}

function toneByImportance(value) {
  if (value === "critical" || value === "high") {
    return "positive";
  }
  return "";
}

function trimPreview(value) {
  return String(value ?? "").trim().slice(0, 120) || "No content yet.";
}

function computeSpread(quote) {
  if (!Number.isFinite(quote?.bid) || !Number.isFinite(quote?.ask)) {
    return null;
  }
  return quote.ask - quote.bid;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function spreadBps(quote) {
  const spread = computeSpread(quote);
  if (!Number.isFinite(spread) || !Number.isFinite(quote?.price) || quote.price === 0) {
    return null;
  }
  return (spread / quote.price) * 10000;
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) {
    return null;
  }
  return valid.reduce((total, value) => total + value, 0) / valid.length;
}

function sum(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) {
    return null;
  }
  return valid.reduce((total, value) => total + value, 0);
}

function normalizeWorkbenchWarning(message) {
  const text = String(message ?? "").trim();
  if (!text) {
    return null;
  }
  if (text.includes("Invalid Crumb")) {
    return "Yahoo blocked this module request. Showing degraded public-source coverage.";
  }
  if (text.includes("Unauthorized")) {
    return "An upstream public market-data endpoint denied this request. Showing fallback coverage.";
  }
  if (text === "fetch failed") {
    return "An upstream public data feed is temporarily unavailable.";
  }
  return text;
}

function historyRangeLabel(range) {
  return {
    "1d": "1D",
    "1w": "1W",
    "1mo": "1M",
    "3mo": "3M",
    "6mo": "6M",
    "1y": "1Y",
  }[range] ?? "Window";
}

function isFundLike(quote) {
  const type = String(quote?.type ?? "").toUpperCase();
  return ["ETF", "MUTUALFUND", "INDEX", "CURRENCY", "CRYPTOCURRENCY", "FUTURE", "COMMODITY"].includes(type);
}

function supportsEarningsIntel(quote, company) {
  if (isFundLike(quote)) {
    return false;
  }
  const symbol = String(quote?.symbol ?? company?.symbol ?? "").toUpperCase();
  if (symbol.includes("=") || symbol.startsWith("^")) {
    return false;
  }
  return true;
}

function buildNotApplicableEarningsPayload(quote, company) {
  return {
    symbol: quote?.symbol ?? company?.symbol ?? state.preferences.detailSymbol,
    companyName: company?.market?.shortName ?? company?.symbol ?? state.preferences.detailSymbol,
    notApplicable: true,
    explanation: `Corporate earnings estimate and surprise modules are usually not applicable for ${humanizeInstrumentType(quote).toLowerCase()} instruments like this one.`,
  };
}

function humanizeInstrumentType(quote) {
  const raw = String(quote?.type ?? "").trim();
  if (!raw) {
    return "Security";
  }
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function fallbackBusinessSummary(quote, company) {
  if (isFundLike(quote)) {
    return `${company.market.shortName ?? quote?.shortName ?? company.symbol} is a ${humanizeInstrumentType(quote).toLowerCase()} instrument. Public corporate fundamentals and earnings coverage can be limited or not applicable compared with an operating company.`;
  }
  return "No business summary was returned by the current data source.";
}

function compactLabel(value, maxWords = 2) {
  return String(value ?? "")
    .replaceAll(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .map((entry) => entry.slice(0, 4))
    .join(" ");
}

function truncateText(value, limit = 72) {
  const text = String(value ?? "").trim();
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function intelDomain(label, description = "") {
  const haystack = `${label ?? ""} ${description ?? ""}`.toLowerCase();
  if (haystack.includes("supplier") || haystack.includes("customer") || haystack.includes("ecosystem")) {
    return "supply";
  }
  if (haystack.includes("acquisition") || haystack.includes("subsidiary") || haystack.includes("parent") || haystack.includes("investment")) {
    return "corporate";
  }
  if (haystack.includes("executive") || haystack.includes("comp ") || haystack.includes("officer")) {
    return "people";
  }
  if (haystack.includes("competitor") || haystack.includes("peer")) {
    return "competition";
  }
  if (haystack.includes("ownership") || haystack.includes("held")) {
    return "ownership";
  }
  return "signal";
}

function loadStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return "#";
  }
  return "#";
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}
