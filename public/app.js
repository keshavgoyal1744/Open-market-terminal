const DEFAULT_PREFERENCES = {
  watchlistSymbols: ["AAPL", "MSFT", "NVDA", "SPY", "TLT", "GLD", "EURUSD=X", "^GSPC"],
  researchPinnedSymbols: [],
  detailSymbol: "AAPL",
  companyMapCompareSymbol: "",
  terminalHotkeys: [],
  newsFocus: "",
  sectorFocus: "Technology",
  aiUniverse: "sp500",
  aiHorizon: "1-4w",
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
  "section-market-boards": 12,
  "section-sector-board": 12,
  "section-quote-monitor": 12,
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
  "section-ai-lab": 12,
  "section-portfolio": 3,
  "section-alerts": 3,
  "section-intel-ops": 3,
  "section-workspaces": 3,
  "section-notes": 3,
  "section-activity": 3,
  "section-crypto": 3,
  "section-screening": 12,
  "section-events": 12,
};
const DEFAULT_PANEL_LAYOUT = [
  "section-market-pulse",
  "section-heatmap",
  "section-market-boards",
  "section-sector-board",
  "section-quote-monitor",
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
  "section-ai-lab",
  "section-portfolio",
  "section-alerts",
  "section-intel-ops",
  "section-workspaces",
  "section-notes",
  "section-activity",
  "section-crypto",
  "section-screening",
  "section-events",
];
const DEFAULT_SECTORS = [
  "Technology",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Financial Services",
  "Healthcare",
  "Industrials",
  "Energy",
  "Utilities",
  "Real Estate",
  "Basic Materials",
];
const SECTOR_TILE_LIMIT = 36;
const SECTOR_TABLE_PAGE_SIZE = 32;
const COMPACT_LAYOUT_BREAKPOINT = 1080;
const INTEL_VIEWS = ["SPLC", "REL", "OWN", "BMAP", "RV", "FA", "DES"];

const PAGE_DEFINITIONS = {
  overview: {
    label: "Market Desk",
    aliases: ["MARKETS", "MARKETS DESK", "OVERVIEW"],
    sectionLabel: "Market Desk",
    title: "Opening market screen for breadth, catalysts, watchlists, flow, and cross-asset context.",
    description:
      "Use this as the main session screen: track the S&P 500 heatmap, cross-asset pulse, ranked market-moving events, watchlist flow, and rates without leaving the desk.",
    deskGuide: "Main session screen for breadth, catalysts, watchlists, flow, and rates.",
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
    label: "Sector Explorer",
    aliases: ["SECTORS", "SECTOR DESK"],
    sectionLabel: "Sector Explorer",
    title: "Sector drilldowns with weighted boards, relative movers, headlines, and full constituent context.",
    description:
      "Choose a sector and break it down properly: view the weighted sector board, strongest and weakest names, sector headlines, and the full constituent list without leaving the desk.",
    deskGuide: "Choose one sector and inspect weights, leaders, laggards, headlines, and constituents.",
    tags: ["Sector Board", "Leaders", "Weights", "Headlines"],
    sections: [
      "section-sector-board",
    ],
  },
  boards: {
    label: "Monitor Boards",
    aliases: ["BOARDS", "MONITORS"],
    sectionLabel: "Monitor Boards",
    title: "Classic monitor boards for movers, activity, volume anomalies, sector breadth, ETF tape, and macro tone.",
    description:
      "This is the monitor wall: use it to scan leaders, laggards, most-active names, unusual volume, sector performance, ETF proxies, and the macro backdrop in one pass.",
    deskGuide: "Monitor wall for movers, activity, breadth, ETF proxies, and macro regime.",
    tags: ["Leaders", "Most Active", "ETF Tape", "Macro"],
    sections: [
      "section-market-boards",
    ],
  },
  calendar: {
    label: "Event Calendar",
    aliases: ["CALENDAR", "CALENDAR DESK", "EVENTS"],
    sectionLabel: "Event Calendar",
    title: "Upcoming earnings, macro releases, and policy events organized into one compact schedule.",
    description:
      "Use the calendar to plan the next few sessions: browse earnings dates, macro releases, and policy events with paging and window controls instead of a long noisy feed.",
    deskGuide: "Forward schedule for earnings, macro releases, and policy dates.",
    tags: ["Daily Boards", "Earnings", "Fed", "Macro"],
    sections: [
      "section-calendar",
    ],
  },
  map: {
    label: "Company Map",
    aliases: ["MAP", "COMPANY MAP DESK"],
    sectionLabel: "Company Map",
    title: "Detailed company map across suppliers, customers, holders, board links, geography, and indices.",
    description:
      "Search a company and trace the broader operating picture: who supplies it, who it sells into, how it is owned, where it is exposed geographically, and which benchmarks include it.",
    deskGuide: "Relationship map for suppliers, customers, holders, board links, and indices.",
    tags: ["Supply Chain", "Customers", "Indices", "Ownership"],
    sections: [
      "section-company-map",
    ],
  },
  quote: {
    label: "Quote Monitor",
    aliases: ["QUOTE", "QUOTE DESK"],
    sectionLabel: "Quote Monitor",
    title: "Single-name monitor linking tape, chart, filings, options, peers, news, and catalysts.",
    description:
      "Stay focused on one symbol and keep every core window tied together: price, chart, filings, holders, peers, options, symbol-specific news, and event timeline.",
    deskGuide: "Single-name monitor for tape, chart, filings, options, peers, holders, and catalysts.",
    tags: ["Quote", "Chart", "News", "Peers"],
    sections: [
      "section-quote-monitor",
    ],
  },
  news: {
    label: "Newswire",
    aliases: ["NEWS", "NEWSWIRE DESK"],
    sectionLabel: "Newswire",
    title: "Live market newswire with broad market coverage and symbol-specific search.",
    description:
      "Use the news desk for both modes: scan general market headlines, or search a ticker, company, or theme and read the freshest linked sources in one place.",
    deskGuide: "Broad market wire plus symbol, company, and theme search in one view.",
    tags: ["Search", "Headlines", "Sources", "Themes"],
    sections: [
      "section-news",
    ],
  },
  ai: {
    label: "AI Ideas",
    aliases: ["AI", "AI LAB"],
    sectionLabel: "AI Ideas",
    title: "Shared daily long and short idea board generated from the live S&P 500 setup.",
    description:
      "This page publishes one daily snapshot for everyone: 20 bullish and 20 bearish S&P 500 ideas ranked from current market structure, macro conditions, and earnings context.",
    deskGuide: "Shared daily bullish and bearish board built from live market context.",
    tags: ["Bullish 20", "Bearish 20", "Gemini", "Groq"],
    sections: [
      "section-ai-lab",
    ],
  },
  research: {
    label: "Research Lab",
    aliases: ["RESEARCH", "RESEARCH DESK"],
    sectionLabel: "Research Lab",
    title: "Deep research workspace for price, filings, options, relationships, and peer analysis.",
    description:
      "Use the research desk when you need depth instead of breadth: work through one name’s price action, filings, options, holders, peers, and supply-chain or competitor relationships in one view.",
    deskGuide: "Deep single-name workspace for chart, filings, options, peers, and relationship analysis.",
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
    label: "Ops Center",
    aliases: ["OPS", "OPS DESK"],
    sectionLabel: "Ops Center",
    title: "Operational workspace for portfolio state, alerts, notes, workspaces, activity, and crypto.",
    description:
      "Keep the operational tools off the main market pages: manage portfolio state, alerts, digests, saved desk layouts, notes, activity logs, and crypto tools from one dedicated ops view.",
    deskGuide: "Portfolio, alerts, notes, activity, workspaces, and crypto operations.",
    tags: ["Portfolio", "Alerts", "Digests", "Workspaces"],
    sections: [
      "section-portfolio",
      "section-alerts",
      "section-intel-ops",
      "section-workspaces",
      "section-notes",
      "section-activity",
      "section-crypto",
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
  boards: {
    "section-market-boards": 12,
  },
  sectors: {
    "section-sector-board": 12,
  },
  quote: {
    "section-quote-monitor": 12,
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
  ai: {
    "section-ai-lab": 12,
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
  },
};

const PAGE_PANEL_ORDERS = {
  overview: {
    "section-market-pulse": 0,
    "section-macro": 1,
    "section-market-events": 2,
    "section-heatmap": 3,
    "section-watchlist": 4,
    "section-flow": 5,
  },
  boards: {
    "section-market-boards": 0,
  },
  research: {
    "section-research-rail": 0,
    "section-workbench": 1,
    "section-intelligence": 2,
    "section-screening": 3,
    "section-events": 4,
  },
  quote: {
    "section-quote-monitor": 0,
  },
  ai: {
    "section-ai-lab": 0,
  },
  ops: {
    "section-portfolio": 0,
    "section-intel-ops": 1,
    "section-workspaces": 2,
    "section-activity": 3,
    "section-alerts": 4,
    "section-notes": 5,
    "section-crypto": 6,
  },
};

const PAGE_PANEL_COLUMNS = {
  overview: {
    "section-market-pulse": "1 / span 3",
    "section-macro": "4 / span 3",
    "section-market-events": "7 / span 6",
    "section-heatmap": "1 / -1",
    "section-watchlist": "1 / span 7",
    "section-flow": "8 / span 5",
  },
  boards: {
    "section-market-boards": "1 / -1",
  },
  research: {
    "section-research-rail": "1",
    "section-workbench": "2 / span 2",
    "section-intelligence": "2 / span 2",
    "section-screening": "2",
    "section-events": "3",
  },
  quote: {
    "section-quote-monitor": "1 / -1",
  },
  ai: {
    "section-ai-lab": "1 / -1",
  },
  ops: {
    "section-portfolio": "1 / span 4",
    "section-intel-ops": "5 / span 5",
    "section-workspaces": "10 / span 3",
    "section-activity": "1 / span 4",
    "section-alerts": "5 / span 4",
    "section-notes": "9 / span 4",
    "section-crypto": "1 / -1",
  },
};

const PAGE_PANEL_ROWS = {
  overview: {
    "section-market-pulse": "1",
    "section-macro": "1",
    "section-market-events": "1",
    "section-heatmap": "2",
    "section-watchlist": "3",
    "section-flow": "3",
  },
  boards: {
    "section-market-boards": "1",
  },
  research: {
    "section-research-rail": "1 / span 3",
    "section-workbench": "1",
    "section-intelligence": "2",
    "section-screening": "3",
    "section-events": "3",
  },
  quote: {
    "section-quote-monitor": "1",
  },
  ai: {
    "section-ai-lab": "1",
  },
  ops: {
    "section-portfolio": "1",
    "section-intel-ops": "1",
    "section-workspaces": "1",
    "section-activity": "2",
    "section-alerts": "2",
    "section-notes": "2",
    "section-crypto": "3",
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
  intelView: "SPLC",
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
  quoteMonitor: null,
  calendarEvents: [],
  newsItems: [],
  marketEvents: [],
  sectorBoard: null,
  flow: null,
  aiLab: null,
  marketBoards: null,
  companyMap: null,
  companyMapCompare: null,
  calendarPage: 1,
  newsPage: 1,
  marketEventsPage: 1,
  sectorBoardPage: 1,
  paletteCommands: [],
  commandPaletteOpen: false,
  paletteIndex: 0,
  dragPanelId: null,
  resizePanelId: null,
  earningsDrawerOpen: false,
  sectorOverflowOpen: false,
  sectorOverflowItems: [],
  sectorOverflowSector: "",
  companyMapExplorerOpen: false,
  companyMapExplorerFocus: "overview",
};

const SECTION_COMMANDS = [
  { id: "section-market-pulse", label: "Jump to Market Pulse", meta: "cross-asset pulse board" },
  { id: "section-heatmap", label: "Jump to S&P 500 Heatmap", meta: "live breadth and hover reasons" },
  { id: "section-market-boards", label: "Jump to Monitor Boards", meta: "leaders, actives, sectors, etf tape" },
  { id: "section-sector-board", label: "Jump to Sector Board", meta: "sector drilldown and constituents" },
  { id: "section-quote-monitor", label: "Jump to Quote Monitor", meta: "single-name quote and catalyst board" },
  { id: "section-watchlist", label: "Jump to Watchlist", meta: "tracked market quotes" },
  { id: "section-flow", label: "Jump to Flow Monitor", meta: "share volume, options flow, short interest" },
  { id: "section-research-rail", label: "Jump to Research Rail", meta: "symbol stack and focus list" },
  { id: "section-workbench", label: "Jump to Security Workbench", meta: "detail, filings, and options" },
  { id: "section-market-events", label: "Jump to Market Events", meta: "ranked event timeline" },
  { id: "section-intelligence", label: "Jump to Relationship Console", meta: "ownership and supply chains" },
  { id: "section-company-map", label: "Jump to Company Map", meta: "suppliers, customers, indices, holders, board" },
  { id: "section-calendar", label: "Jump to Desk Calendar", meta: "earnings, Fed, and macro dates" },
  { id: "section-news", label: "Jump to Market News", meta: "live public headlines" },
  { id: "section-ai-lab", label: "Jump to AI Lab", meta: "hosted bullish and bearish S&P 500 ideas" },
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
  try {
    bindForms();
  } catch (error) {
    console.error("bindForms failed", error);
  }

  try {
    bindGlobalActions();
  } catch (error) {
    console.error("bindGlobalActions failed", error);
  }

  startHudClock();
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

  try {
    await loadSession();
  } catch (error) {
    console.error("loadSession failed", error);
  }

  connectCrypto();

  const bootstrapTasks = [
    loadMarketPulse(),
    loadHeatmap(),
    loadMarketBoards(),
    loadSectorBoard(),
    loadMarketEvents(),
    loadWatchlist(state.preferences.watchlistSymbols),
    loadFlow(),
    loadResearchRail(),
    loadDetail(state.preferences.detailSymbol),
    loadCompanyMap(state.preferences.detailSymbol),
    loadQuoteMonitor(state.preferences.detailSymbol),
    loadMacro(),
    loadYieldCurve(),
    loadDeskCalendar(),
    loadDeskNews(),
    loadOrderBook(currentOrderBookProduct()),
    runScreen(),
    runCompare(),
    loadWatchlistEvents(),
    normalizePage(state.preferences.activePage) === "ai" ? loadAiLab(false) : Promise.resolve(),
  ];

  const results = await Promise.allSettled(bootstrapTasks);
  const firstFailure = results.find((result) => result.status === "rejected");
  if (firstFailure?.status === "rejected") {
    console.error("bootstrap task failed", firstFailure.reason);
  }

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

  document.querySelector("#refreshMarketBoardsButton")?.addEventListener("click", async () => {
    await loadMarketBoards(true);
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
    await Promise.all([loadWatchlistEvents(), loadDeskCalendar(true), loadDeskNews(true), loadMarketEvents(true), loadFlow(true), loadMarketBoards(true)]);
  });

  document.querySelector("#saveWatchlistButton").addEventListener("click", async () => {
    await syncPreferences(true);
  });

  document.querySelector("#detailForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.currentHistoryRange = document.querySelector("#historyRange").value;
    await selectDetailSymbol(document.querySelector("#detailSymbol").value.trim().toUpperCase());
  });

  document.querySelector("#quoteMonitorForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const symbol = document.querySelector("#quoteMonitorSymbol")?.value.trim().toUpperCase() ?? state.preferences.detailSymbol;
    await selectDetailSymbol(symbol, { page: "quote", jump: false });
  });

  document.querySelector("#refreshQuoteMonitorButton")?.addEventListener("click", async () => {
    await loadQuoteMonitor(state.preferences.detailSymbol, true);
  });

  document.querySelector("#terminalCommandForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const raw = document.querySelector("#terminalCommandInput")?.value ?? "";
    await executeTerminalInput(raw);
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
  document.querySelector("#sectorBoardSelect")?.addEventListener("change", async (event) => {
    await selectSectorFocus(event.target?.value, { page: "sectors", jump: false });
  });
  syncSectorSelector(DEFAULT_SECTORS, state.preferences.sectorFocus);

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

  document.querySelector("#terminalHotkeys")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-terminal-hotkey]") : null;
    if (!trigger?.dataset.terminalHotkey) {
      return;
    }
    await executeTerminalInput(trigger.dataset.terminalHotkey);
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
    const overflowTrigger = event.target instanceof Element ? event.target.closest("[data-open-sector-overflow='true']") : null;
    if (overflowTrigger) {
      toggleSectorOverflowModal(true);
      return;
    }
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

  document.querySelector("#section-market-boards")?.addEventListener("click", async (event) => {
    const symbolTrigger = event.target instanceof Element ? event.target.closest("[data-flow-symbol]") : null;
    if (symbolTrigger?.dataset.flowSymbol) {
      await selectDetailSymbol(symbolTrigger.dataset.flowSymbol, { jump: false, page: "quote" });
      return;
    }
    const sectorTrigger = event.target instanceof Element ? event.target.closest("[data-board-sector]") : null;
    if (sectorTrigger?.dataset.boardSector) {
      await selectSectorFocus(sectorTrigger.dataset.boardSector, { jump: false, page: "sectors" });
    }
  });

  document.querySelector("#intelGraph")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-graph-symbol]") : null;
    if (!trigger?.dataset.graphSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.graphSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#intelCommandBar")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-intel-view]") : null;
    if (!trigger?.dataset.intelView) {
      return;
    }
    state.intelView = normalizeIntelView(trigger.dataset.intelView);
    rerenderIntelligenceConsole();
  });

  document.querySelector("#companyMapGraph")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-graph-symbol]") : null;
    if (!trigger?.dataset.graphSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.graphSymbol, { jump: false, page: "map" });
  });

  document.querySelector("#openCompanyMapExplorerButton")?.addEventListener("click", () => {
    toggleCompanyMapExplorer(true, "graph");
  });

  document.querySelector("#section-company-map")?.addEventListener("click", async (event) => {
    const explorerTrigger = event.target instanceof Element ? event.target.closest("[data-open-company-map-explorer]") : null;
    if (explorerTrigger?.dataset.openCompanyMapExplorer) {
      toggleCompanyMapExplorer(true, explorerTrigger.dataset.openCompanyMapExplorer);
      return;
    }
    const trigger = event.target instanceof Element ? event.target.closest("[data-company-map-symbol]") : null;
    if (!trigger?.dataset.companyMapSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.companyMapSymbol, { jump: false, page: "map" });
  });

  document.querySelector("#section-quote-monitor")?.addEventListener("click", async (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-company-map-symbol]") : null;
    if (!trigger?.dataset.companyMapSymbol) {
      return;
    }
    await selectDetailSymbol(trigger.dataset.companyMapSymbol, { jump: false, page: "quote" });
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

  document.querySelector("#sectorBoardPager")?.addEventListener("click", (event) => {
    const trigger = event.target instanceof Element ? event.target.closest("[data-sector-board-page]") : null;
    if (!trigger) {
      return;
    }
    state.sectorBoardPage = Number(trigger.dataset.sectorBoardPage);
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

  document.querySelector("#closeSectorOverflowButton")?.addEventListener("click", () => {
    toggleSectorOverflowModal(false);
  });

  document.querySelector("#sectorOverflowOverlay")?.addEventListener("click", async (event) => {
    const closeTrigger = event.target instanceof Element ? event.target.closest("[data-close-sector-overflow='true']") : null;
    if (closeTrigger) {
      toggleSectorOverflowModal(false);
      return;
    }
    const symbolTrigger = event.target instanceof Element ? event.target.closest("[data-sector-symbol]") : null;
    if (!symbolTrigger?.dataset.sectorSymbol) {
      return;
    }
    toggleSectorOverflowModal(false);
    await selectDetailSymbol(symbolTrigger.dataset.sectorSymbol, { jump: true, page: "research" });
  });

  document.querySelector("#closeCompanyMapExplorerButton")?.addEventListener("click", () => {
    toggleCompanyMapExplorer(false);
  });

  document.querySelector("#companyMapExplorerOverlay")?.addEventListener("click", async (event) => {
    const closeTrigger = event.target instanceof Element ? event.target.closest("[data-close-company-map-explorer='true']") : null;
    if (closeTrigger) {
      toggleCompanyMapExplorer(false);
      return;
    }
    const focusTrigger = event.target instanceof Element ? event.target.closest("[data-company-map-explorer-focus]") : null;
    if (focusTrigger?.dataset.companyMapExplorerFocus) {
      state.companyMapExplorerFocus = normalizeCompanyMapExplorerFocus(focusTrigger.dataset.companyMapExplorerFocus);
      renderCompanyMapExplorer(state.companyMap, state.companyMapExplorerFocus);
      focusCompanyMapExplorerSection(state.companyMapExplorerFocus);
      return;
    }
    const graphTrigger = event.target instanceof Element ? event.target.closest("[data-graph-symbol]") : null;
    if (graphTrigger?.dataset.graphSymbol) {
      await selectDetailSymbol(graphTrigger.dataset.graphSymbol, { jump: false, page: "map" });
      toggleCompanyMapExplorer(true, state.companyMapExplorerFocus);
      return;
    }
    const symbolTrigger = event.target instanceof Element ? event.target.closest("[data-company-map-symbol]") : null;
    if (!symbolTrigger?.dataset.companyMapSymbol) {
      return;
    }
    await selectDetailSymbol(symbolTrigger.dataset.companyMapSymbol, { jump: false, page: "map" });
    toggleCompanyMapExplorer(true, state.companyMapExplorerFocus);
  });

  document.addEventListener("keydown", async (event) => {
    const target = event.target;
    const editable = target instanceof HTMLElement && (target.closest("input, textarea, select") || target.isContentEditable);

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandPalette("");
      return;
    }

    if (!editable && event.key === "/") {
      event.preventDefault();
      document.querySelector("#terminalCommandInput")?.focus();
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

    if (state.sectorOverflowOpen && event.key === "Escape") {
      event.preventDefault();
      toggleSectorOverflowModal(false);
      return;
    }

    if (state.companyMapExplorerOpen && event.key === "Escape") {
      event.preventDefault();
      toggleCompanyMapExplorer(false);
      return;
    }

    if (editable) {
      return;
    }

    if (event.altKey && !event.ctrlKey && !event.metaKey) {
      const pageHotkeys = {
        "1": "overview",
        "2": "boards",
        "3": "sectors",
        "4": "calendar",
        "5": "map",
        "6": "quote",
        "7": "news",
        "8": "research",
        "9": "ops",
      };
      if (pageHotkeys[event.key]) {
        event.preventDefault();
        setActivePage(pageHotkeys[event.key], { scroll: true });
        return;
      }
    }

    if (event.key === "[") {
      event.preventDefault();
      await cycleDetailSymbol(-1);
    } else if (event.key === "]") {
      event.preventDefault();
      await cycleDetailSymbol(1);
    } else if (event.shiftKey && event.key === "ArrowLeft") {
      event.preventDefault();
      await cycleDetailSymbol(-1);
    } else if (event.shiftKey && event.key === "ArrowRight") {
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
      if (window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT) {
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
    if (window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT) {
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
  setText("#deskPageGuide", page.deskGuide ?? page.description);

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
  if (state.preferences.activePage !== "sectors" && state.sectorOverflowOpen) {
    toggleSectorOverflowModal(false);
  }
  if (state.preferences.activePage !== "map" && state.companyMapExplorerOpen) {
    toggleCompanyMapExplorer(false);
  }
  applyPanelLayout();
  rerenderPageScopedPanels();
  if (state.preferences.activePage === "map") {
    void loadCompanyMap(state.preferences.detailSymbol);
  }
  if (state.preferences.activePage === "quote") {
    void loadQuoteMonitor(state.preferences.detailSymbol);
  }
  if (state.preferences.activePage === "boards") {
    void loadMarketBoards(false);
  }
  if (state.preferences.activePage === "ai") {
    void loadAiLab(false);
  }
  if (state.preferences.activePage === "sectors") {
    syncSectorSelector(state.sectorBoard?.sectors ?? state.heatmap?.sectors ?? DEFAULT_SECTORS, state.preferences.sectorFocus);
    if (state.sectorBoard) {
      renderSectorBoardPanel(state.sectorBoard);
    }
    if (!(state.sectorBoard?.sectors?.length || state.heatmap?.sectors?.length)) {
      void loadSectorBoard(false);
    }
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
  if (document.querySelector("#sectorBoardBody")) {
    renderSectorBoardPanel(state.sectorBoard);
  }
  if (document.querySelector("#aiLabBullishList") && state.aiLab) {
    renderAiLabPanel(state.aiLab);
  }
  if (document.querySelector("#terminalHotkeys")) {
    renderTerminalHotkeys();
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
    let session;
    try {
      session = await api("/api/auth/session");
    } catch (error) {
      if (!String(error.message ?? "").includes("404")) {
        throw error;
      }
      try {
        session = await api("/api/session");
      } catch (fallbackError) {
        if (!String(fallbackError.message ?? "").includes("404")) {
          throw fallbackError;
        }
        teardownAuthenticatedState();
        renderHud();
        return;
      }
    }
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
    if (!String(error.message ?? "").includes("404")) {
      showStatus(error.message, true);
    }
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
    syncSectorSelector(payload.sectors?.length ? payload.sectors : DEFAULT_SECTORS);
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

    if (normalizePage(state.preferences.activePage) === "sectors") {
      if (state.sectorBoard) {
        renderSectorBoardPanel(state.sectorBoard);
      } else {
        const previewSector = sanitizeSectorFocus(state.preferences.sectorFocus, payload.sectors ?? DEFAULT_SECTORS);
        const previewItems = filterSectorBoardItems(payload.tiles ?? [], previewSector);
        renderSectorBoardPanel({
          sector: previewSector,
          sectors: payload.sectors ?? [],
          items: previewItems,
          news: [],
          asOf: payload.asOf,
          warnings: payload.warnings ?? [],
        });
      }
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
    const selectedSector = sanitizeSectorFocus(sector, [...(state.heatmap?.sectors ?? []), ...DEFAULT_SECTORS]);
    if (state.heatmap?.tiles?.length) {
      const previewItems = filterSectorBoardItems(state.heatmap.tiles, selectedSector);
      renderSectorBoardPanel({
        sector: selectedSector,
        sectors: state.heatmap.sectors ?? DEFAULT_SECTORS,
        items: previewItems,
        news: [],
        asOf: state.heatmap.asOf,
        warnings: [],
      });
    }
    const payload = await api(`/api/sector-board?sector=${encodeURIComponent(sector)}${force ? "&force=1" : ""}`);
    state.preferences.sectorFocus = selectedSector;
    state.sectorBoard = {
      ...payload,
      sector: selectedSector,
    };
    state.sectorBoardPage = 1;
    renderSectorBoardPanel(state.sectorBoard);
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
    document.querySelector("#flowWarnings").innerHTML = renderStatusStrip(
      payload.warnings ?? [],
      "Flow monitor loaded from current public share, short-interest, and options feeds.",
    );
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
    const supplierPreview = (payload.suppliers ?? []).slice(0, 12);
    const customerPreview = (payload.customers ?? []).slice(0, 12);
    const interlockPreview = (payload.boardInterlocks?.summary ?? []).slice(0, 10);
    const acquisitionPreview = (payload.acquisitionsTimeline ?? []).slice(0, 10);
    const indexTimelinePreview = (payload.indexTimeline ?? []).slice(0, 8);
    const competitorPreview = (payload.competitors ?? []).slice(0, 12);
    const holderPreview = (payload.holders ?? []).slice(0, 12);
    const boardPreview = (payload.board ?? []).slice(0, 12);
    const insiderHolderPreview = (payload.insiderHolders ?? []).slice(0, 10);
    const insiderTransactionPreview = (payload.insiderTransactions ?? []).slice(0, 8);
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
      supplierPreview,
      "No supplier or upstream public links are available.",
    );
    document.querySelector("#companyMapCustomers").innerHTML = renderCompanyMapRelations(
      customerPreview,
      "No downstream or customer-side public links are available.",
    );
    document.querySelector("#companyMapBoardInterlockList").innerHTML = renderCompanyMapInterlocks(interlockPreview);
    document.querySelector("#companyMapAcquisitions").innerHTML = renderCompanyMapTimeline(
      acquisitionPreview,
      "No acquisition or corporate-event timeline rows are available.",
    );
    document.querySelector("#companyMapIndexTimeline").innerHTML = renderCompanyMapTimeline(
      indexTimelinePreview,
      "No current index-presence timeline rows are available.",
    );
    document.querySelector("#companyMapCompetitorBody").innerHTML = renderCompanyMapCompetitors(competitorPreview);
    document.querySelector("#companyMapHoldersBody").innerHTML = renderCompanyMapHolders(holderPreview);
    document.querySelector("#companyMapBoard").innerHTML = renderCompanyMapBoard(boardPreview);
    document.querySelector("#companyMapInsiders").innerHTML = renderCompanyMapInsiders(insiderHolderPreview, insiderTransactionPreview);
    mountIntelGraph(document.querySelector("#companyMapGraph"), payload.graph, payload.symbol);
    mountIntelGraph(
      document.querySelector("#companyMapBoardInterlocks"),
      payload.boardInterlocks ?? { nodes: [{ id: payload.symbol, label: payload.symbol, kind: "issuer", symbol: payload.symbol }], edges: [] },
      payload.symbol,
    );
    mountGeoExposureChart(document.querySelector("#companyMapGeo"), payload.geography);
    mountBarChart(document.querySelector("#companyMapOwnershipTrend"), {
      title: "Ownership Signal",
      subtitle: "Institutional report dates and insider activity",
      points: (payload.ownershipTrend ?? []).map((item) => ({
        label: formatDateShort(item.date),
        value: item.institutionPercent != null ? item.institutionPercent * 100 : item.insiderEvents ?? 0,
        meta: item.note ?? "public ownership",
      })),
      valueFormatter: (value) => `${formatNumber(value, 2)}${value > 20 ? "%" : ""}`,
      labelFormatter: (label) => label,
    });
    if (state.companyMapExplorerOpen) {
      renderCompanyMapExplorer(payload, state.companyMapExplorerFocus);
    }
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

async function loadQuoteMonitor(symbol, force = false) {
  const clean = String(symbol ?? state.preferences.detailSymbol ?? "").trim().toUpperCase();
  if (!clean) {
    return;
  }
  const range = document.querySelector("#quoteMonitorRange")?.value ?? state.currentHistoryRange ?? "1d";
  const interval = resolveHistoryInterval(range);
  const peerSymbols = state.preferences.watchlistSymbols.filter((entry) => entry !== clean).slice(0, 10);

  try {
    const payload = await api(
      `/api/quote-monitor?symbol=${encodeURIComponent(clean)}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&peerSymbols=${encodeURIComponent(peerSymbols.join(","))}${force ? "&force=1" : ""}`,
    );
    state.quoteMonitor = payload;
    document.querySelector("#quoteMonitorSymbol").value = clean;
    document.querySelector("#quoteMonitorRange").value = range;
    document.querySelector("#quoteMonitorSummary").innerHTML = renderQuoteMonitorSummary(payload);
    document.querySelector("#quoteMonitorWarnings").innerHTML = renderStatusStrip(
      payload.warnings ?? [],
      `${clean} quote monitor loaded from current public quote, options, filing, and news feeds.`,
    );
    document.querySelector("#quoteMonitorHeadline").innerHTML = `
      <p class="section-label">${escapeHtml(payload.market?.sector ?? humanizeInstrumentType(payload.quote))}</p>
      <h3>${escapeHtml(payload.companyName ?? clean)}</h3>
      <p>${escapeHtml(payload.summary ?? "Single-name quote monitor with linked public-source windows.")}</p>
    `;
    document.querySelector("#quoteMonitorMetrics").innerHTML = renderQuoteMonitorMetrics(payload.quote, payload.market, payload.history?.points ?? []);
    mountCandlestickChart(document.querySelector("#quoteMonitorChart"), {
      title: `${clean} ${historyRangeLabel(range)} OHLC + volume`,
      subtitle: `${payload.quote?.exchange ?? payload.market?.exchange ?? "Public market"} · ${formatTimestampShort(payload.quote?.timestamp)}`,
      points: payload.history?.points ?? [],
      valueFormatter: formatMoney,
    });
    document.querySelector("#quoteMonitorNews").innerHTML = renderQuoteMonitorNews(payload.news ?? []);
    document.querySelector("#quoteMonitorTimeline").innerHTML = renderQuoteMonitorTimeline(payload.timeline ?? []);
    document.querySelector("#quoteMonitorFilings").innerHTML = renderQuoteMonitorFilings(payload.filings ?? []);
    document.querySelector("#quoteMonitorOptionsSummary").innerHTML = renderOptionsSummary(payload.options ?? {}, payload.quote ?? null);
    document.querySelector("#quoteMonitorCallsBody").innerHTML = renderQuoteMonitorOptionRows(payload.options?.calls ?? [], "call");
    document.querySelector("#quoteMonitorPutsBody").innerHTML = renderQuoteMonitorOptionRows(payload.options?.puts ?? [], "put");
    document.querySelector("#quoteMonitorPeersBody").innerHTML = renderCompanyMapCompetitors(payload.peers ?? []);
    document.querySelector("#quoteMonitorHoldersBody").innerHTML = renderCompanyMapHolders(payload.holders ?? []);
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#quoteMonitorWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
  }
}

async function loadMarketBoards(force = false) {
  const symbols = state.preferences.watchlistSymbols.slice(0, 16);
  try {
    const payload = await api(`/api/market-boards?symbols=${encodeURIComponent(symbols.join(","))}${force ? "&force=1" : ""}`);
    state.marketBoards = payload;
    document.querySelector("#marketBoardsSummary").innerHTML = renderMarketBoardsSummary(payload);
    document.querySelector("#marketBoardsWarnings").innerHTML = renderStatusStrip(
      payload.warnings ?? [],
      "Market boards loaded from public heatmap breadth, share tape, ETF tape proxies, and macro sources.",
    );
    document.querySelector("#leadersBoardBody").innerHTML = renderBoardQuoteRows(payload.leaders ?? [], "volume");
    document.querySelector("#laggardsBoardBody").innerHTML = renderBoardQuoteRows(payload.laggards ?? [], "volume");
    document.querySelector("#activeBoardBody").innerHTML = renderBoardActiveRows(payload.mostActive ?? []);
    document.querySelector("#unusualBoardBody").innerHTML = renderBoardUnusualRows(payload.unusualVolume ?? []);
    document.querySelector("#gapUpBoardBody").innerHTML = renderBoardGapRows(payload.gapUp ?? []);
    document.querySelector("#gapDownBoardBody").innerHTML = renderBoardGapRows(payload.gapDown ?? []);
    document.querySelector("#sectorPerformanceBody").innerHTML = renderBoardSectorRows(payload.sectorPerformance ?? []);
    document.querySelector("#etfFlowsBody").innerHTML = renderBoardEtfRows(payload.etfFlows ?? []);
    document.querySelector("#boardsMacroCards").innerHTML = renderBoardsMacroCards(payload.macro);
    mountBarChart(document.querySelector("#boardsYieldCurve"), {
      title: "Yield Curve",
      subtitle: `${payload.macro?.invertedSegments ?? 0} inverted segments`,
      points: (payload.macro?.curve ?? []).map((point) => ({
        label: point.tenor,
        value: point.value,
        meta: "Treasury curve",
      })),
      valueFormatter: (value) => formatPercent(value),
      labelFormatter: (label) => label,
    });
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#marketBoardsWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
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
      document.querySelector("#calendarWarnings").innerHTML = renderStatusStrip(
        payload.warnings ?? [],
        "Calendar feeds loaded from current public earnings, Fed, and macro sources.",
      );
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

  const weighted = (sectors ?? [])
    .map((item) => (typeof item === "string" ? { sector: item, weight: 0 } : item))
    .filter((item) => item?.sector);
  const ordered = [...weighted]
    .sort((left, right) => (Number(right.weight) || 0) - (Number(left.weight) || 0))
    .map((item) => item.sector)
    .concat(DEFAULT_SECTORS)
    .filter((sector, index, list) => list.findIndex((candidate) => normalizeSectorKey(candidate) === normalizeSectorKey(sector)) === index);
  if (!ordered.length) {
    select.innerHTML = DEFAULT_SECTORS
      .map((sector) => `<option value="${escapeHtml(sector)}">${escapeHtml(sector)}</option>`)
      .join("");
    select.disabled = false;
    const liveValue = sanitizeSectorFocus(select.value, DEFAULT_SECTORS);
    select.value = DEFAULT_SECTORS.includes(liveValue)
      ? liveValue
      : DEFAULT_SECTORS.includes(selectedSector)
        ? selectedSector
        : DEFAULT_SECTORS[0];
    state.preferences.sectorFocus = select.value;
    return;
  }
  select.disabled = false;
  const preferred =
    ordered.find((sector) => normalizeSectorKey(sector) === normalizeSectorKey(select.value))
    ?? ordered.find((sector) => normalizeSectorKey(sector) === normalizeSectorKey(selectedSector))
    ?? ordered[0]
    ?? selectedSector
    ?? "Technology";
  select.innerHTML = ordered
    .map((sector) => `<option value="${escapeHtml(sector)}">${escapeHtml(sector)}</option>`)
    .join("");
  if (preferred) {
    select.value = preferred;
    state.preferences.sectorFocus = preferred;
  }
}

function normalizeSectorKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sanitizeSectorFocus(value, sectors = DEFAULT_SECTORS) {
  const clean = String(value ?? "").trim();
  if (!clean || clean === "-") {
    return (Array.isArray(sectors) && sectors[0]) || DEFAULT_SECTORS[0];
  }

  const sectorNames = (Array.isArray(sectors) ? sectors : [])
    .map((item) => (typeof item === "string" ? item : item?.sector))
    .filter(Boolean);
  const match = sectorNames.find((sector) => normalizeSectorKey(sector) === normalizeSectorKey(clean));
  return match ?? clean;
}

function resolveSectorBoardSector(payload) {
  const sectors = [
    ...(state.heatmap?.sectors ?? []).map((item) => (typeof item === "string" ? item : item?.sector)).filter(Boolean),
    ...(state.heatmap?.tiles ?? []).map((item) => item?.sector).filter(Boolean),
    ...(payload?.sectors ?? []).map((item) => (typeof item === "string" ? item : item?.sector)).filter(Boolean),
    ...(payload?.items ?? []).map((item) => item?.sector).filter(Boolean),
    ...DEFAULT_SECTORS,
  ];
  const uniqueSectors = sectors.filter(
    (sector, index) => sectors.findIndex((candidate) => normalizeSectorKey(candidate) === normalizeSectorKey(sector)) === index,
  );
  const candidates = [
    sanitizeSectorFocus(document.querySelector("#sectorBoardSelect")?.value, uniqueSectors),
    sanitizeSectorFocus(payload?.sector, uniqueSectors),
    sanitizeSectorFocus(state.preferences.sectorFocus, uniqueSectors),
    uniqueSectors[0],
    DEFAULT_SECTORS[0],
  ].filter(Boolean);

  for (const candidate of candidates) {
    const match = uniqueSectors.find((sector) => normalizeSectorKey(sector) === normalizeSectorKey(candidate));
    if (match) {
      return match;
    }
  }
  return candidates[0] ?? "Technology";
}

function activeSectorSelection(payload) {
  return sanitizeSectorFocus(
    document.querySelector("#sectorBoardSelect")?.value
      || state.preferences.sectorFocus
      || payload?.sector,
    [
      ...(state.heatmap?.sectors ?? []),
      ...(payload?.sectors ?? []),
      ...DEFAULT_SECTORS,
    ],
  );
}

function filterSectorBoardItems(items, selectedSector) {
  const list = Array.isArray(items) ? items : [];
  const selectedKey = normalizeSectorKey(selectedSector);
  if (!selectedKey) {
    return list;
  }
  const sectorAware = list.filter((item) => normalizeSectorKey(item?.sector));
  if (!sectorAware.length) {
    return [];
  }
  return sectorAware.filter((item) => normalizeSectorKey(item?.sector) === selectedKey);
}

function deriveSectorBoardItems(payload, selectedSector) {
  const liveItems = Array.isArray(state.heatmap?.tiles) ? state.heatmap.tiles : [];
  const payloadItems = Array.isArray(payload?.items) ? payload.items : [];
  const selectedSymbols = new Set((payload?.symbols ?? []).map((symbol) => String(symbol ?? "").trim().toUpperCase()).filter(Boolean));
  const bySelectedSymbols = (items) =>
    Array.isArray(items) && selectedSymbols.size
      ? items.filter((item) => selectedSymbols.has(String(item?.symbol ?? "").trim().toUpperCase()))
      : [];
  const filteredLive = filterSectorBoardItems(liveItems, selectedSector);
  const filteredPayload = filterSectorBoardItems(payloadItems, selectedSector);
  const symbolMatchedPayload = bySelectedSymbols(payloadItems);
  const symbolMatchedLive = bySelectedSymbols(liveItems);
  const primary = filteredPayload.length
    ? filteredPayload
    : symbolMatchedPayload.length
      ? symbolMatchedPayload
      : symbolMatchedLive.length
        ? symbolMatchedLive
    : filteredLive;
  const payloadBySymbol = new Map(payloadItems.map((item) => [item.symbol, item]));

  return primary.map((item) => {
    const hydrated = payloadBySymbol.get(item.symbol);
    return {
      ...item,
      ...(hydrated ?? {}),
      sector: item.sector ?? hydrated?.sector ?? selectedSector,
      marketCap: item.marketCap ?? hydrated?.marketCap ?? null,
      volume: item.volume ?? hydrated?.volume ?? null,
      price: item.price ?? hydrated?.price ?? null,
      changePercent: item.changePercent ?? hydrated?.changePercent ?? null,
    };
  });
}

function summarizeSectorBoardItems(items) {
  const list = Array.isArray(items) ? items : [];
  const moves = list.map((item) => Number(item?.changePercent)).filter(Number.isFinite);
  const weights = list.map((item) => Number(item?.weight)).filter(Number.isFinite);
  const volumes = list.map((item) => Number(item?.volume)).filter(Number.isFinite);
  const marketCaps = list.map((item) => Number(item?.marketCap)).filter(Number.isFinite);
  return {
    names: list.length,
    averageMove: moves.length ? sum(moves) / moves.length : null,
    weight: weights.length ? sum(weights) : null,
    aggregateVolume: volumes.length ? sum(volumes) : null,
    aggregateCap: marketCaps.length ? sum(marketCaps) : null,
  };
}

function heatmapSectorSpan(weight) {
  if (!Number.isFinite(weight)) {
    return 4;
  }
  if (weight >= 26) {
    return 10;
  }
  if (weight >= 18) {
    return 8;
  }
  if (weight >= 10) {
    return 7;
  }
  if (weight >= 6) {
    return 6;
  }
  if (weight >= 3) {
    return 5;
  }
  return 4;
}

function heatmapSectorColumns(weight) {
  if (!Number.isFinite(weight)) {
    return 8;
  }
  if (weight >= 18) {
    return 14;
  }
  if (weight >= 10) {
    return 12;
  }
  if (weight >= 5) {
    return 10;
  }
  return 8;
}

function heatmapSectorVisibleCount(weight) {
  if (!Number.isFinite(weight)) {
    return 10;
  }
  if (weight >= 18) {
    return 28;
  }
  if (weight >= 10) {
    return 22;
  }
  if (weight >= 5) {
    return 16;
  }
  return 12;
}

function heatmapTilePlacement(tile, sectorWeight) {
  const baseColumn = Math.max(Number(tile?.columnSpan) || 1, 1);
  const baseRow = Math.max(Number(tile?.rowSpan) || 1, 1);
  if (sectorWeight >= 18) {
    return { column: Math.min(baseColumn, 6), row: Math.min(baseRow, 6) };
  }
  if (sectorWeight >= 10) {
    return { column: Math.min(baseColumn, 5), row: Math.min(baseRow, 5) };
  }
  if (sectorWeight >= 5) {
    return { column: Math.min(baseColumn, 4), row: Math.min(baseRow, 4) };
  }
  return { column: Math.min(baseColumn, 3), row: Math.min(baseRow, 3) };
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
  if (document.querySelector("#quoteMonitorSymbol")) {
    document.querySelector("#quoteMonitorSymbol").value = state.preferences.detailSymbol;
  }
  if (document.querySelector("#quoteMonitorRange")) {
    document.querySelector("#quoteMonitorRange").value = state.currentHistoryRange;
  }
  if (document.querySelector("#companyMapSymbol")) {
    document.querySelector("#companyMapSymbol").value = state.preferences.detailSymbol;
  }
  if (document.querySelector("#companyMapCompareSymbol")) {
    document.querySelector("#companyMapCompareSymbol").value = state.preferences.companyMapCompareSymbol ?? "";
  }
  document.querySelector("#newsFocusInput").value = state.preferences.newsFocus ?? "";
  if (document.querySelector("#sectorBoardSelect")) {
    const sectorSelect = document.querySelector("#sectorBoardSelect");
    const sectorOptions = [...sectorSelect.options].map((option) => option.value);
    const normalizedSector = sanitizeSectorFocus(state.preferences.sectorFocus, sectorOptions);
    state.preferences.sectorFocus = normalizedSector;
    sectorSelect.value = normalizedSector;
  }
  if (document.querySelector("#aiUniverseSelect")) {
    document.querySelector("#aiUniverseSelect").value = state.preferences.aiUniverse === "sp500" ? state.preferences.aiUniverse : "sp500";
  }
  if (document.querySelector("#aiHorizonSelect")) {
    document.querySelector("#aiHorizonSelect").value = state.preferences.aiHorizon === "1-4w" ? state.preferences.aiHorizon : "1-4w";
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
  renderTerminalHotkeys();
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
    terminalHotkeys: state.preferences.terminalHotkeys,
    newsFocus: state.preferences.newsFocus,
    sectorFocus: state.preferences.sectorFocus,
    aiUniverse: state.preferences.aiUniverse,
    aiHorizon: state.preferences.aiHorizon,
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
  setInterval(() => void loadMarketBoards(false), 180000);
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
  setInterval(() => {
    if (normalizePage(state.preferences.activePage) === "quote") {
      void loadQuoteMonitor(state.preferences.detailSymbol);
    }
  }, 90000);
  setInterval(() => void loadDeskCalendar(false), 300000);
  setInterval(() => void loadDeskNews(false), 120000);
  setInterval(() => {
    if (normalizePage(state.preferences.activePage) === "ai") {
      void loadAiLab(false);
    }
  }, 900000);
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
    options.page === "quote" || normalizePage(state.preferences.activePage) === "quote" ? loadQuoteMonitor(clean, true) : Promise.resolve(),
    options.page === "map" || normalizePage(state.preferences.activePage) === "map" ? loadCompanyMap(clean, true) : Promise.resolve(),
  ]);
}

async function selectSectorFocus(sector, options = {}) {
  const clean = sanitizeSectorFocus(sector, [...(state.sectorBoard?.sectors ?? []), ...(state.heatmap?.sectors ?? []), ...DEFAULT_SECTORS]);
  if (!clean) {
    return;
  }

  state.preferences.sectorFocus = clean;
  state.sectorBoardPage = 1;
  if (document.querySelector("#sectorBoardSelect")) {
    document.querySelector("#sectorBoardSelect").value = clean;
  }
  schedulePreferenceSync();
  if (options.page) {
    setActivePage(options.page, { scroll: false });
  }
  if (options.jump) {
    jumpToSection("section-sector-board");
  }
  await loadSectorBoard(true);
}

async function loadAiLab() {
  try {
    const universe = state.preferences.aiUniverse ?? "sp500";
    const horizon = state.preferences.aiHorizon ?? "1-4w";
    const payload = await api(
      `/api/ai-lab?universe=${encodeURIComponent(universe)}&horizon=${encodeURIComponent(horizon)}&bullishCount=20&bearishCount=20`,
    );
    state.aiLab = payload;
    renderAiLabPanel(payload);
    markFeedHeartbeat("Live");
  } catch (error) {
    document.querySelector("#aiLabWarnings").innerHTML =
      `<div class="panel-status-chip warn">${escapeHtml(error.message)}</div>`;
    showStatus(error.message, true);
  }
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

function renderTerminalHotkeys() {
  const container = document.querySelector("#terminalHotkeys");
  if (!container) {
    return;
  }
  const items = state.preferences.terminalHotkeys ?? [];
  container.innerHTML = items.length
    ? items
        .map(
          (entry) => `
            <button type="button" class="secondary terminal-hotkey-chip" data-terminal-hotkey="${escapeHtml(entry)}">
              ${escapeHtml(entry)}
            </button>
          `,
        )
        .join("")
    : `<div class="muted">Recent terminal commands appear here.</div>`;
}

function rememberTerminalHotkey(input) {
  const clean = String(input ?? "").trim();
  if (!clean) {
    return;
  }
  state.preferences.terminalHotkeys = [clean, ...(state.preferences.terminalHotkeys ?? []).filter((entry) => entry !== clean)].slice(0, 8);
  schedulePreferenceSync();
  renderTerminalHotkeys();
}

async function executeTerminalInput(raw) {
  const input = String(raw ?? "").trim();
  if (!input) {
    return;
  }
  try {
    const command = parseTerminalCommand(input);
    await command.run();
    rememberTerminalHotkey(input);
    document.querySelector("#terminalCommandInput").value = input;
    setText("#terminalCommandHint", command.meta);
    showStatus(`Executed ${command.label}.`, false);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function parseTerminalCommand(raw) {
  const normalized = String(raw ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\bUS\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const upper = normalized.toUpperCase();
  const parts = upper.split(" ").filter(Boolean);
  if (!parts.length) {
    throw new Error("Enter a terminal command or symbol.");
  }

  if (parts[0] === "PAGE" && parts[1]) {
    const request = parts.slice(1).join(" ");
    const pageId = Object.keys(PAGE_DEFINITIONS).find((key) => {
      const page = PAGE_DEFINITIONS[key];
      const aliases = [page.label, ...(page.aliases ?? []), key]
        .map((entry) => String(entry ?? "").trim().toUpperCase())
        .filter(Boolean);
      return aliases.includes(request);
    });
    if (!pageId) {
      throw new Error(`Unknown page: ${request}`);
    }
    return {
      label: `Open ${PAGE_DEFINITIONS[pageId].label}`,
      meta: PAGE_DEFINITIONS[pageId].description,
      run: async () => setActivePage(pageId, { scroll: true }),
    };
  }

  if (parts[0] === "SECTOR" && parts.length > 1) {
    const sector = normalized.split(/\s+/).slice(1).join(" ");
    return {
      label: `Open ${sector} sector`,
      meta: "Open the sector drilldown board",
      run: () => selectSectorFocus(sector, { jump: false, page: "sectors" }),
    };
  }

  if (parts[0] === "MAP" && parts[1]) {
    const primary = cleanTerminalSymbol(parts[1]);
    const compare = parts[2] ? cleanTerminalSymbol(parts[2]) : "";
    return {
      label: `Open ${primary} map`,
      meta: compare ? `Compare ${primary} vs ${compare}` : "Open company map",
      run: async () => {
        state.preferences.companyMapCompareSymbol = compare && compare !== primary ? compare : "";
        schedulePreferenceSync();
        await selectDetailSymbol(primary, { page: "map", jump: false });
      },
    };
  }

  if (parts[0] === "QUOTE" && parts[1]) {
    const symbol = cleanTerminalSymbol(parts[1]);
    return {
      label: `Open ${symbol} quote monitor`,
      meta: "Single-name quote monitor",
      run: () => selectDetailSymbol(symbol, { page: "quote", jump: false }),
    };
  }

  if (parts[0] === "BOARDS") {
    return {
      label: "Open monitor boards",
      meta: "Leaders, activity, ETF tape, and macro boards",
      run: async () => setActivePage("boards", { scroll: true }),
    };
  }

  if (parts[0] === "NEWS") {
    const query = normalized.split(/\s+/).slice(1).join(" ");
    return {
      label: query ? `Search news for ${query}` : "Open news page",
      meta: query ? "Open the news page and search this symbol or theme" : PAGE_DEFINITIONS.news.description,
      run: async () => {
        state.preferences.newsFocus = query;
        schedulePreferenceSync();
        applyPreferencesToInputs();
        setActivePage("news", { scroll: true });
        await loadDeskNews(true);
      },
    };
  }

  const intelView = normalizeIntelView(parts.at(-1));
  const hasIntelView = INTEL_VIEWS.includes(parts.at(-1));
  const symbol = cleanTerminalSymbol(parts[0]);
  if (!symbol) {
    throw new Error(`Could not parse terminal command: ${raw}`);
  }

  if (hasIntelView) {
    return {
      label: `Open ${symbol} ${intelView}`,
      meta: `Load ${symbol} into the Research page and switch the Relationship Console to ${intelView}`,
      run: async () => {
        state.intelView = intelView;
        await selectDetailSymbol(symbol, { page: "research", jump: false });
      },
    };
  }

  return {
    label: `Open ${symbol}`,
    meta: "Load the symbol into the research workbench",
    run: () => selectDetailSymbol(symbol, { page: "research", jump: false }),
  };
}

function cleanTerminalSymbol(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9^=.\-]/g, "");
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

function toggleSectorOverflowModal(open) {
  state.sectorOverflowOpen = open;
  const overlay = document.querySelector("#sectorOverflowOverlay");
  const modal = document.querySelector("#sectorOverflowModal");
  if (!overlay || !modal) {
    return;
  }
  overlay.hidden = !open;
  modal.hidden = !open;
  overlay.classList.toggle("open", open);
  modal.classList.toggle("open", open);
  document.body.classList.toggle("sector-overflow-open", open);
  if (open) {
    document.querySelector("#closeSectorOverflowButton")?.focus();
  }
}

function renderSectorOverflowTiles(items) {
  if (!items.length) {
    return renderIntelEmpty("No additional sector names are available right now.");
  }

  const totalWeight = sum(items.map((item) => item.weight)) ?? 1;
  return items
    .map((item) => {
      const relativeWeight = Number.isFinite(item.weight) ? item.weight / totalWeight : 0.02;
      const span = relativeWeight >= 0.08 ? 4 : relativeWeight >= 0.04 ? 3 : relativeWeight >= 0.015 ? 2 : 1;
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

function renderSectorOverflowModal(items, sectorLabel) {
  state.sectorOverflowItems = Array.isArray(items) ? items : [];
  state.sectorOverflowSector = sectorLabel ?? "";
  const summary = summarizeSectorBoardItems(state.sectorOverflowItems);
  setText("#sectorOverflowTitle", `${sectorLabel} sector mosaic`);
  document.querySelector("#sectorOverflowSummary").innerHTML = [
    renderTerminalStat("Sector", sectorLabel ?? "n/a", "expanded board"),
    renderTerminalStat("Names", String(summary.names), "selected-sector universe"),
    renderTerminalStat("Avg Move", formatPercent(summary.averageMove), "sector mean"),
    renderTerminalStat("Weight", formatPercent(summary.weight), "index share"),
    renderTerminalStat("Volume", formatCompact(summary.aggregateVolume), "aggregate"),
  ].join("");
  document.querySelector("#sectorOverflowGrid").innerHTML = renderSectorOverflowTiles(state.sectorOverflowItems);
}

function normalizeCompanyMapExplorerFocus(focus) {
  const clean = String(focus ?? "")
    .trim()
    .toLowerCase();
  if (clean === "overview") {
    return "graph";
  }
  return [
    "graph",
    "suppliers",
    "customers",
    "corporate",
    "competition",
    "ownership",
    "board",
    "indices",
    "timeline",
    "geography",
  ].includes(clean)
    ? clean
    : "overview";
}

function companyMapExplorerSectionId(focus) {
  return `companyMapExplorerSection-${normalizeCompanyMapExplorerFocus(focus)}`;
}

function toggleCompanyMapExplorer(open, focus = "overview") {
  state.companyMapExplorerOpen = open;
  state.companyMapExplorerFocus = normalizeCompanyMapExplorerFocus(focus);
  const overlay = document.querySelector("#companyMapExplorerOverlay");
  const modal = document.querySelector("#companyMapExplorerModal");
  if (!overlay || !modal) {
    return;
  }
  overlay.hidden = !open;
  modal.hidden = !open;
  overlay.classList.toggle("open", open);
  modal.classList.toggle("open", open);
  document.body.classList.toggle("company-map-explorer-open", open);
  if (open) {
    renderCompanyMapExplorer(state.companyMap, state.companyMapExplorerFocus);
    document.querySelector("#closeCompanyMapExplorerButton")?.focus();
    requestAnimationFrame(() => focusCompanyMapExplorerSection(state.companyMapExplorerFocus));
  }
}

function focusCompanyMapExplorerSection(focus) {
  const target = document.querySelector(`#${companyMapExplorerSectionId(focus)}`);
  const body = document.querySelector("#companyMapExplorerModal");
  if (!target || !body) {
    return;
  }
  target.scrollIntoView({ block: "start", behavior: "smooth" });
}

function renderCompanyMapExplorer(payload, focus = "overview") {
  const nav = document.querySelector("#companyMapExplorerNav");
  const summary = document.querySelector("#companyMapExplorerSummary");
  const body = document.querySelector("#companyMapExplorerBody");
  if (!nav || !summary || !body) {
    return;
  }

  if (!payload) {
    setText("#companyMapExplorerTitle", "Expanded company map");
    summary.innerHTML = "";
    nav.innerHTML = "";
    body.innerHTML = `<article class="subpanel"><div class="list-stack">${renderIntelEmpty("Load a symbol on the Map page to open the full relationship explorer.")}</div></article>`;
    return;
  }

  state.companyMapExplorerFocus = normalizeCompanyMapExplorerFocus(focus);
  setText("#companyMapExplorerTitle", `${payload.symbol} ${companyMapExplorerHeading(state.companyMapExplorerFocus)}`);
  summary.innerHTML = renderCompanyMapSummary(payload);
  nav.innerHTML = renderCompanyMapExplorerNav(state.companyMapExplorerFocus);
  body.innerHTML = renderCompanyMapExplorerBody(payload, state.companyMapExplorerFocus);

  const graphContainer = document.querySelector("#companyMapExplorerGraph");
  if (graphContainer) {
    mountIntelGraph(graphContainer, payload.graph, payload.symbol);
  }
  const interlockContainer = document.querySelector("#companyMapExplorerInterlocksGraph");
  if (interlockContainer) {
    mountIntelGraph(
      interlockContainer,
      payload.boardInterlocks ?? { nodes: [{ id: payload.symbol, label: payload.symbol, kind: "issuer", symbol: payload.symbol }], edges: [] },
      payload.symbol,
    );
  }
  const geoContainer = document.querySelector("#companyMapExplorerGeo");
  if (geoContainer) {
    mountGeoExposureChart(geoContainer, payload.geography);
  }
  const ownershipContainer = document.querySelector("#companyMapExplorerOwnershipTrend");
  if (ownershipContainer) {
    mountBarChart(ownershipContainer, {
      title: "Ownership Signal",
      subtitle: "Institutional report dates and insider activity",
      points: (payload.ownershipTrend ?? []).map((item) => ({
        label: formatDateShort(item.date),
        value: item.institutionPercent != null ? item.institutionPercent * 100 : item.insiderEvents ?? 0,
        meta: item.note ?? "public ownership",
      })),
      valueFormatter: (value) => `${formatNumber(value, 2)}${value > 20 ? "%" : ""}`,
      labelFormatter: (label) => label,
    });
  }
}

function renderCompanyMapExplorerNav(activeFocus) {
  const buttons = [
    ["graph", "Graph"],
    ["suppliers", "Suppliers"],
    ["customers", "Customers"],
    ["corporate", "Corporate"],
    ["competition", "Competition"],
    ["ownership", "Ownership"],
    ["board", "Board"],
    ["indices", "Indices"],
    ["timeline", "Timeline"],
    ["geography", "Geography"],
  ];

  return buttons
    .map(
      ([value, label]) => `
        <button
          type="button"
          class="command-pill${value === activeFocus ? " active" : ""}"
          data-company-map-explorer-focus="${value}"
        >
          ${escapeHtml(label)}
        </button>
      `,
    )
    .join("");
}

function companyMapExplorerHeading(focus) {
  return {
    graph: "graph explorer",
    suppliers: "supplier explorer",
    customers: "customer explorer",
    corporate: "corporate explorer",
    competition: "competition explorer",
    ownership: "ownership explorer",
    board: "board explorer",
    indices: "index explorer",
    timeline: "timeline explorer",
    geography: "geography explorer",
  }[normalizeCompanyMapExplorerFocus(focus)] ?? "relationship explorer";
}

function renderCompanyMapExplorerBody(payload, focus) {
  const corporateRows = [
    ...(payload.corporate?.tree ?? []).map((item) =>
      renderIntelListItem(item.type ?? "Corporate", item.name ?? "n/a", item.description ?? "Public corporate linkage"),
    ),
    ...(payload.corporate?.relations ?? []).map((item) =>
      renderIntelListItem(item.relation ?? "Relation", item.target ?? "n/a", item.label ?? ""),
    ),
  ];
  const normalizedFocus = normalizeCompanyMapExplorerFocus(focus);

  if (normalizedFocus === "graph") {
    return `
      <section id="${companyMapExplorerSectionId("graph")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-graph-focus-panel">
          <div class="subpanel-header compact-header">
            <div>
              <p class="section-label">${escapeHtml(payload.market?.sector ?? "Company Map")}</p>
              <h3>${escapeHtml(payload.companyName ?? payload.symbol)}</h3>
            </div>
            <div class="terminal-price-stack">
              <strong>${formatMoney(payload.quote?.price)}</strong>
              <div class="meta ${tone(payload.quote?.changePercent)}">${formatPercent(payload.quote?.changePercent)}</div>
            </div>
          </div>
          <div class="company-map-explorer-copy">
            <p>${escapeHtml(payload.summary ?? "No company relationship summary is available from the current public sources.")}</p>
          </div>
          <div class="company-map-explorer-stat-grid">
            ${renderTerminalStat("Suppliers", String(payload.suppliers?.length ?? 0), "upstream links")}
            ${renderTerminalStat("Customers", String(payload.customers?.length ?? 0), "demand channels")}
            ${renderTerminalStat("Corporate", String((payload.corporate?.tree?.length ?? 0) + (payload.corporate?.relations?.length ?? 0)), "tree + relations")}
            ${renderTerminalStat("Competitors", String(payload.competitors?.length ?? 0), "public comps")}
            ${renderTerminalStat("Holders", String(payload.holders?.length ?? 0), "public owners")}
            ${renderTerminalStat("Board", String(payload.board?.length ?? 0), "officers / directors")}
          </div>
          <div id="companyMapExplorerGraph" class="chart-card intel-graph-card company-map-explorer-chart company-map-explorer-chart-large"></div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "suppliers") {
    return `
      <section id="${companyMapExplorerSectionId("suppliers")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Suppliers & Partners</h3>
            <div class="muted">${escapeHtml(`${payload.suppliers?.length ?? 0} upstream links`)}</div>
          </div>
          <div class="list-stack company-map-explorer-list">${renderCompanyMapRelations(payload.suppliers ?? [], "No supplier or upstream public links are available.")}</div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "customers") {
    return `
      <section id="${companyMapExplorerSectionId("customers")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Customers & Demand Channels</h3>
            <div class="muted">${escapeHtml(`${payload.customers?.length ?? 0} downstream links`)}</div>
          </div>
          <div class="list-stack company-map-explorer-list">${renderCompanyMapRelations(payload.customers ?? [], "No downstream or customer-side public links are available.")}</div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "corporate") {
    return `
      <section id="${companyMapExplorerSectionId("corporate")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Corporate Tree & Deals</h3>
            <div class="muted">${escapeHtml(`${payload.corporate?.tree?.length ?? 0} tree nodes · ${payload.corporate?.relations?.length ?? 0} relations`)}</div>
          </div>
          <div class="list-stack company-map-explorer-list">${corporateRows.join("") || renderIntelEmpty("No corporate tree or transaction rows are available.")}</div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "competition") {
    return `
      <section id="${companyMapExplorerSectionId("competition")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Competitors</h3>
            <div class="muted">${escapeHtml(`${payload.competitors?.length ?? 0} public comps`)}</div>
          </div>
          <div class="table-wrap compact terminal-table-wrap company-map-explorer-table-wrap">
            <table class="terminal-table intel-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Last</th>
                  <th>% Change</th>
                </tr>
              </thead>
              <tbody>${renderCompanyMapCompetitors(payload.competitors ?? [])}</tbody>
            </table>
          </div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "ownership") {
    return `
      <section id="${companyMapExplorerSectionId("ownership")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Ownership</h3>
            <div class="muted">${escapeHtml(`${payload.holders?.length ?? 0} holders · ${(payload.insiderHolders?.length ?? 0) + (payload.insiderTransactions?.length ?? 0)} insider rows`)}</div>
          </div>
          <div class="company-map-explorer-subgrid">
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Top Holders</h4>
                <div class="muted">public institutions and filings</div>
              </div>
              <div class="table-wrap compact terminal-table-wrap company-map-explorer-table-wrap">
                <table class="terminal-table intel-table">
                  <thead>
                    <tr>
                      <th>Holder</th>
                      <th>% Held</th>
                      <th>Shares</th>
                    </tr>
                  </thead>
                  <tbody>${renderCompanyMapHolders(payload.holders ?? [])}</tbody>
                </table>
              </div>
            </article>
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Ownership Trend</h4>
                <div class="muted">institutional report dates and insider activity</div>
              </div>
              <div id="companyMapExplorerOwnershipTrend" class="chart-card small"></div>
            </article>
            <article class="subpanel company-map-explorer-full-span">
              <div class="subpanel-header compact-header">
                <h4>Insider Ownership & Transactions</h4>
                <div class="muted">reported holdings and trade activity</div>
              </div>
              <div class="list-stack company-map-explorer-list">${renderCompanyMapInsiders(payload.insiderHolders ?? [], payload.insiderTransactions ?? [])}</div>
            </article>
          </div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "board") {
    return `
      <section id="${companyMapExplorerSectionId("board")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Board, Officers, and Interlocks</h3>
            <div class="muted">${escapeHtml(`${payload.board?.length ?? 0} officer rows · ${payload.boardInterlocks?.summary?.length ?? 0} interlocks`)}</div>
          </div>
          <div class="company-map-explorer-subgrid">
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Board & Officers</h4>
                <div class="muted">public officer / director listing</div>
              </div>
              <div class="list-stack company-map-explorer-list">${renderCompanyMapBoard(payload.board ?? [])}</div>
            </article>
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Board Interlock Graph</h4>
                <div class="muted">career and network ties</div>
              </div>
              <div id="companyMapExplorerInterlocksGraph" class="chart-card small"></div>
              <div class="list-stack company-map-explorer-list">${renderCompanyMapInterlocks(payload.boardInterlocks?.summary ?? [])}</div>
            </article>
          </div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "indices") {
    return `
      <section id="${companyMapExplorerSectionId("indices")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Index Membership</h3>
            <div class="muted">${escapeHtml(`${payload.indices?.length ?? 0} benchmark links`)}</div>
          </div>
          <div class="company-map-explorer-subgrid">
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Current Index Membership</h4>
                <div class="muted">major public benchmarks</div>
              </div>
              <div class="list-stack company-map-explorer-list">${renderCompanyMapIndices(payload.indices ?? [])}</div>
            </article>
            <article class="subpanel">
              <div class="subpanel-header compact-header">
                <h4>Index Timeline</h4>
                <div class="muted">benchmark presence verification</div>
              </div>
              <div class="list-stack company-map-explorer-list">${renderCompanyMapTimeline(payload.indexTimeline ?? [], "No current index-presence timeline rows are available.")}</div>
            </article>
          </div>
        </article>
      </section>
    `;
  }

  if (normalizedFocus === "timeline") {
    return `
      <section id="${companyMapExplorerSectionId("timeline")}" class="company-map-explorer-focus-shell">
        <article class="subpanel company-map-explorer-section">
          <div class="subpanel-header compact-header">
            <h3>Corporate Timeline</h3>
            <div class="muted">${escapeHtml(`${payload.acquisitionsTimeline?.length ?? 0} mapped events`)}</div>
          </div>
          <div class="list-stack company-map-explorer-list">${renderCompanyMapTimeline(payload.acquisitionsTimeline ?? [], "No acquisition or corporate-event timeline rows are available.")}</div>
        </article>
      </section>
    `;
  }

  return `
    <section id="${companyMapExplorerSectionId("geography")}" class="company-map-explorer-focus-shell">
      <article class="subpanel company-map-explorer-section">
        <div class="subpanel-header compact-header">
          <h3>Geography</h3>
          <div class="muted">revenue mix, manufacturing footprint, and supply regions</div>
        </div>
        <div id="companyMapExplorerGeo" class="chart-card small"></div>
      </article>
    </section>
  `;
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
    const holders = topIntelHolders(payload);
    const defaultView = normalizeIntelView(payload.commands?.[0]?.code);
    state.intelView = state.intelligence?.symbol === payload.symbol ? normalizeIntelView(state.intelView) : defaultView;

    document.querySelector("#intelCommandBar").innerHTML = payload.commands
      .map(
        (command) => `
          <button type="button" class="command-pill" data-intel-view="${escapeHtml(normalizeIntelView(command.code))}">
            ${escapeHtml(command.code)}
            <span>${escapeHtml(command.label)}</span>
          </button>
        `,
      )
      .join("");

    document.querySelector("#intelHeadline").innerHTML = `
      <p class="section-label">Coverage ${payload.coverage.curated ? "Curated + Public" : "Public + Fallback"}</p>
      <h3>${escapeHtml(payload.companyName)}</h3>
      <p>${escapeHtml(payload.summary ?? payload.coverage.notes[0] ?? "No intelligence summary available.")}</p>
    `;

    const previewNotes = (payload.coverage.notes ?? []).slice(0, 2).map((note, index) => renderIntelNote(note, index)).join("");
    document.querySelector("#intelCoverageNotes").innerHTML =
      (previewNotes || renderIntelEmpty("No coverage notes were returned.")) +
      ((payload.coverage.notes?.length ?? 0) > 2
        ? `<div class="intel-inline-note">+${payload.coverage.notes.length - 2} more notes in DES</div>`
        : "");

    document.querySelector("#intelOwnershipFacts").innerHTML = [
      metric("Inst. Held", formatPercentScaled(payload.ownership.institutionPercentHeld)),
      metric("Insider Held", formatPercentScaled(payload.ownership.insiderPercentHeld)),
      metric("Float", formatCompact(payload.ownership.floatShares)),
      metric("Short Int", formatCompact(payload.ownership.sharesShort)),
    ].join("");

    document.querySelector("#intelSignalGrid").innerHTML = renderIntelSignals(payload, holders);
    mountIntelGraph(document.querySelector("#intelGraph"), payload.graph, payload.symbol);
    rerenderIntelligenceConsole();
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
  const unavailable = Boolean(options?.warning) && !calls.length && !puts.length;
  const status = document.querySelector("#optionsStatus");
  document.querySelector("#section-workbench .options-grid")?.classList.toggle("options-grid-unavailable", unavailable);
  if (status) {
    status.innerHTML = options?.warning
      ? `<div class="panel-status-chip warn">${escapeHtml(normalizeWorkbenchWarning(options.warning))}</div>`
      : `<div class="panel-status-chip">${escapeHtml(isFundLike(quote) ? "Listed options may be partial or delayed for fund-like instruments." : "Current listed options snapshot loaded.")}</div>`;
  }

  const emptyMessage = unavailable
    ? "Free listed-options chain is unavailable right now."
    : options?.warning
    ? "Options coverage is partial from the current public source."
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
  const pageState = paginateItems(events, state.marketEventsPage, 6);
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
    renderTerminalStat("Earnings", String(earnings), "Nasdaq live"),
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

function renderStatusStrip(warnings, okMessage) {
  if (!warnings.length) {
    return `<div class="panel-status-chip">${escapeHtml(okMessage)}</div>`;
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
      const sectorColumns = heatmapSectorColumns(sector.weight);
      const visibleCount = heatmapSectorVisibleCount(sector.weight);
      const visibleItems = items.slice(0, visibleCount);
      const hiddenCount = Math.max(items.length - visibleItems.length, 0);

      return `
        <section
          class="heatmap-sector ${tone(sector.averageMove)}"
          style="grid-column: span ${sectorSpan}; --sector-columns: ${sectorColumns};"
        >
          <button type="button" class="heatmap-sector-header" data-heatmap-sector="${escapeHtml(sector.sector ?? "Sector")}">
            <div>
              <h3>${escapeHtml(sector.sector ?? "Sector")}</h3>
              <span>${formatPercent(sector.weight)} index share · ${visibleItems.length}${hiddenCount ? ` of ${items.length}` : ""} names</span>
            </div>
            <strong class="${tone(sector.averageMove)}">${formatPercent(sector.averageMove)}</strong>
          </button>
          <div class="heatmap-sector-grid">
            ${visibleItems
              .map((tile) => {
                const intensity = Math.min(Math.abs(tile.changePercent ?? 0) / 4, 1);
                const tileSize = Math.max(tile.columnSpan ?? 1, tile.rowSpan ?? 1);
                const tilePlacement = heatmapTilePlacement(tile, sector.weight);
                return `
                  <button
                    type="button"
                    class="heatmap-tile ${tone(tile.changePercent)}${tile.symbol === state.heatmapFocusSymbol ? " active" : ""}"
                    data-heatmap-symbol="${escapeHtml(tile.symbol)}"
                    data-size="${tileSize}"
                    style="grid-column: span ${tilePlacement.column}; grid-row: span ${tilePlacement.row}; --heat-opacity: ${0.18 + intensity * 0.46};"
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
  const sectorLabel = activeSectorSelection(payload);
  const items = deriveSectorBoardItems(payload, sectorLabel);
  const summary = summarizeSectorBoardItems(items);
  return [
    renderTerminalStat("Sector", sectorLabel ?? "n/a", "focus board"),
    renderTerminalStat("Names", String(summary.names), "constituents"),
    renderTerminalStat("Avg Move", formatPercent(summary.averageMove), "sector mean"),
    renderTerminalStat("Weight", formatPercent(summary.weight), "index share"),
    renderTerminalStat("Volume", formatCompact(summary.aggregateVolume), "aggregate"),
    renderTerminalStat("Mkt Cap", formatCompact(summary.aggregateCap), "aggregate"),
  ].join("");
}

function renderSectorBoardTiles(items) {
  if (!items.length) {
    return renderIntelEmpty("No sector constituents are available right now.");
  }

  const totalWeight = sum(items.map((item) => item.weight)) ?? 1;
  const visibleItems = items.slice(0, SECTOR_TILE_LIMIT);
  const overflowCount = Math.max(items.length - visibleItems.length, 0);

  return [
    ...visibleItems
    .map((item) => {
      const relativeWeight = Number.isFinite(item.weight) ? item.weight / totalWeight : 0.03;
      const span = relativeWeight >= 0.12 ? 4 : relativeWeight >= 0.07 ? 3 : relativeWeight >= 0.03 ? 2 : 1;
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
    }),
    overflowCount
      ? `
        <button
          type="button"
          class="sector-board-tile sector-board-tile-overflow"
          data-open-sector-overflow="true"
        >
          <span class="sector-board-weight">Table</span>
          <strong>+${overflowCount}</strong>
          <div class="meta">More selected-sector names continue below in the constituent board.</div>
        </button>
      `
      : "",
  ].join("");
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

function renderSectorBoardPanel(payload) {
  if (!payload) {
    return;
  }
  const sectorLabel = activeSectorSelection(payload);
  const filteredItems = deriveSectorBoardItems(payload, sectorLabel);
  const sortedItems = [...filteredItems].sort((left, right) => (Number(right.weight) || 0) - (Number(left.weight) || 0));
  const summary = summarizeSectorBoardItems(sortedItems);
  const leaders = [...sortedItems]
    .filter((item) => Number.isFinite(Number(item.changePercent)))
    .sort((left, right) => (Number(right.changePercent) || 0) - (Number(left.changePercent) || 0))
    .slice(0, 6);
  const laggards = [...sortedItems]
    .filter((item) => Number.isFinite(Number(item.changePercent)))
    .sort((left, right) => (Number(left.changePercent) || 0) - (Number(right.changePercent) || 0))
    .slice(0, 6);
  const pageState = paginateItems(sortedItems, state.sectorBoardPage, SECTOR_TABLE_PAGE_SIZE);
  state.sectorBoardPage = pageState.page;
  renderSectorOverflowModal(sortedItems, sectorLabel);

  syncSectorSelector(payload?.sectors?.length ? payload.sectors : state.heatmap?.sectors ?? DEFAULT_SECTORS, sectorLabel);
  document.querySelector("#sectorBoardSummary").innerHTML = renderSectorBoardSummary({
    ...payload,
    sector: sectorLabel,
    items: sortedItems,
    summary,
  });
  document.querySelector("#sectorBoardWarnings").innerHTML = renderHeatmapWarnings(payload?.warnings ?? []);
  document.querySelector("#sectorBoardTitle").textContent = `${sectorLabel} board`;
  document.querySelector("#sectorBoardMeta").textContent = sortedItems.length
    ? `${sortedItems.length} names | showing top ${Math.min(sortedItems.length, SECTOR_TILE_LIMIT)} in board | ${payload?.asOf ? `updated ${formatDateTime(payload.asOf)}` : "awaiting sync"}`
    : `No names mapped for ${sectorLabel}`;
  document.querySelector("#sectorNewsMeta").textContent = payload?.news?.length
    ? `Public source blend for ${sectorLabel}`
    : `No sector headlines available for ${sectorLabel}`;
  document.querySelector("#sectorBoardTiles").innerHTML = renderSectorBoardTiles(sortedItems);
  document.querySelector("#sectorLeadersList").innerHTML = leaders.map(renderQuoteListItem).join("")
    || renderIntelEmpty("No leaders available.");
  document.querySelector("#sectorLaggardsList").innerHTML = laggards.map(renderQuoteListItem).join("")
    || renderIntelEmpty("No laggards available.");
  document.querySelector("#sectorNewsList").innerHTML = renderCompactNewsFeed(payload?.news ?? []);
  document.querySelector("#sectorBoardBody").innerHTML = renderSectorBoardRows(pageState.items);
  const pager = document.querySelector("#sectorBoardPager");
  if (pager) {
    pager.innerHTML = renderPager(pageState.page, pageState.totalPages, "sector-board-page");
  }
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
          <div class="sector-news-kicker">
            <span class="signal-chip">${escapeHtml((item.category ?? "news").toUpperCase())}</span>
            <span class="news-time">${escapeHtml(formatTimeAgo(item.publishedAt))}</span>
          </div>
          <div class="sector-news-main">
            <a class="sector-news-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
            <div class="sector-news-foot">
              <span class="muted">${escapeHtml(item.source ?? "News")}</span>
              <span>${escapeHtml(item.symbols?.[0] ?? item.category ?? "live")}</span>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderFlowSummary(summary) {
  const optionsCoverage = summary.optionsCoverage ?? 0;
  const symbols = summary.symbols ?? 0;
  return [
    renderTerminalStat("Symbols", String(symbols), "watchlist coverage"),
    renderTerminalStat("Shares", formatCompact(summary.shareVolume), "aggregate tape"),
    renderTerminalStat(
      "Options",
      Number.isFinite(summary.optionsVolume) && optionsCoverage > 0 ? formatCompact(summary.optionsVolume) : optionsCoverage ? "Partial" : "Share-only",
      `${optionsCoverage} / ${symbols} names`,
    ),
    renderTerminalStat("P/C", formatRatio(summary.averagePutCall), optionsCoverage > 0 ? "watchlist mean" : "no listed chain"),
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
                  <span class="terminal-chip">${escapeHtml(flowCategoryLabel(row))}</span>
                </div>
                <div class="meta">${escapeHtml(compactLabel(row.shortName ?? row.symbol, 28))}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="terminal-price-stack">
              <strong>${formatCompact(row.shareVolume)}</strong>
              <div class="meta">${flowAverageVolumeLabel(row)}</div>
            </div>
          </td>
          <td>${flowRelativeVolumeLabel(row)}</td>
          <td>
            <div class="terminal-price-stack">
              <strong>${row.optionsAvailable ? `${formatCompact(row.callVolume)} / ${formatCompact(row.putVolume)}` : formatMoney(row.price)}</strong>
              <div class="meta">${row.optionsAvailable ? `last ${formatMoney(row.price)}` : flowOptionsMetaLabel(row)}</div>
            </div>
          </td>
          <td>${row.optionsAvailable ? formatRatio(row.putCallRatio) : "share-only"}</td>
          <td>${row.optionsAvailable ? formatCompact(row.openInterest) : "n/a"}</td>
          <td>
            <div class="terminal-price-stack">
              <strong>${Number.isFinite(row.shortRatio) ? formatNumber(row.shortRatio, 2) : "n/a"}</strong>
              <div class="meta">${Number.isFinite(row.sharesShort) ? formatCompact(row.sharesShort) : flowShortMetaLabel(row)}</div>
            </div>
          </td>
          <td>${escapeHtml(row.analystRating ?? flowStreetFallback(row))}</td>
        </tr>
      `,
    )
    .join("");
}

function flowCategoryLabel(row) {
  const sector = String(row?.sector ?? "").trim();
  if (sector && sector !== "Unclassified") {
    return compactLabel(sector, 2);
  }
  return compactLabel(flowInstrumentLabel(row), 2);
}

function flowInstrumentLabel(row) {
  const raw = String(row?.instrumentType ?? "").trim();
  if (!raw) {
    return row?.exchange ?? "Security";
  }
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function flowAverageVolumeLabel(row) {
  if (Number.isFinite(row?.averageShareVolume)) {
    return `avg ${formatCompact(row.averageShareVolume)}`;
  }
  return row?.exchange ? `${row.exchange} tape` : "live tape";
}

function flowRelativeVolumeLabel(row) {
  if (Number.isFinite(row?.relativeVolume)) {
    return formatRatio(row.relativeVolume);
  }
  return '<span class="muted">tape only</span>';
}

function flowOptionsMetaLabel(row) {
  if (String(row?.symbol ?? "").includes("=") || String(row?.symbol ?? "").startsWith("^")) {
    return "no listed chain";
  }
  return "share-only";
}

function flowShortMetaLabel(row) {
  return row?.instrumentType ? compactLabel(flowInstrumentLabel(row), 2) : "short n/a";
}

function flowStreetFallback(row) {
  if (String(row?.symbol ?? "").startsWith("^")) {
    return "index";
  }
  if (String(row?.symbol ?? "").includes("=")) {
    return "macro";
  }
  return flowInstrumentLabel(row).toLowerCase();
}

function renderCompanyMapSummary(payload) {
  return [
    renderTerminalStat("Symbol", payload.symbol ?? "n/a", payload.market?.industry ?? "company map"),
    renderTerminalStat("Last", formatMoney(payload.quote?.price), payload.quote?.exchange ?? "public quote"),
    renderTerminalStat("Suppliers", String(payload.suppliers?.length ?? 0), "upstream links"),
    renderTerminalStat("Customers", String(payload.customers?.length ?? 0), "downstream links"),
    renderTerminalStat("Peers", String(payload.competitors?.length ?? 0), "sector / market map"),
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

function renderCompanyMapTimeline(items, emptyMessage) {
  if (!items.length) {
    return renderIntelEmpty(emptyMessage);
  }

  return items
    .map(
      (item, index) => `
        <div class="list-item terminal-list-item">
          <div class="terminal-list-main">
            <div class="terminal-symbol-line">
              <strong>${escapeHtml(item.title ?? item.kind ?? "Event")}</strong>
              <span class="terminal-chip">${String(index + 1).padStart(2, "0")}</span>
            </div>
            <div class="meta">${escapeHtml(item.note ?? "")}</div>
          </div>
          <div class="terminal-price-stack">
            <strong>${escapeHtml(formatDateShort(item.date) ?? "n/a")}</strong>
            <div class="meta">${item.url ? `<a class="event-link" href="${safeUrl(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.source ?? "Source")}</a>` : escapeHtml(item.source ?? "Source")}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCompanyMapInterlocks(items) {
  if (!items.length) {
    return renderIntelEmpty("No public interlock rows are available.");
  }

  return items
    .map(
      (item) => `
        <div class="list-item intel-list-item company-map-link${item.symbol ? " has-symbol" : ""}"${item.symbol ? ` data-company-map-symbol="${escapeHtml(item.symbol)}"` : ""}>
          <div class="intel-list-main">
            <span class="intel-tag">INTERLOCK</span>
            <div>
              <strong>${escapeHtml(item.name ?? "n/a")}</strong>
              <div class="meta">${escapeHtml(`${item.count} executive link${item.count === 1 ? "" : "s"}`)}</div>
            </div>
          </div>
          <div class="intel-domain">${escapeHtml((item.symbol ?? "board").toUpperCase())}</div>
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
                <div class="muted">${escapeHtml(holder.note ?? "ownership filing")}</div>
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
    .map((item) => renderIntelListItem(item.holder ?? "Holder", formatPercentScaled(item.pctHeld), item.note ?? formatCompact(item.shares)))
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
        item.positionDirect != null
          ? `Direct ${formatCompact(item.positionDirect)} shares`
          : item.transactionDescription ?? "Public insider holding",
        ),
    ),
    ...(transactions ?? []).map((item) =>
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

function topIntelHolders(payload) {
  return [...(payload?.ownership?.topInstitutionalHolders ?? []), ...(payload?.ownership?.topFundHolders ?? [])]
    .filter((holder, index, all) => holder.holder && all.findIndex((entry) => entry.holder === holder.holder) === index)
    .slice(0, 16);
}

function renderIntelHolderRows(holders) {
  return holders.length
    ? holders
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
        .join("")
    : `<tr class="intel-row"><td colspan="3"><div class="muted">No public holder rows are available.</div></td></tr>`;
}

function renderIntelOwnershipSignals(payload) {
  const filingSignals = payload?.ownership?.filingSignals ?? null;
  const rows = [
    ...(payload?.ownership?.insiderHolders ?? []).slice(0, 8).map((item) =>
      renderIntelListItem(
        item.relation ?? "insider holder",
        item.name ?? "n/a",
        item.positionDirect != null
          ? `Direct ${formatCompact(item.positionDirect)} shares`
          : item.transactionDescription ?? "Public insider holder row",
      )),
    ...(payload?.ownership?.insiderTransactions ?? []).slice(0, 8).map((item) =>
      renderIntelListItem(
        item.position ?? "insider trade",
        item.insider ?? "n/a",
        item.transactionText ?? item.ownership ?? "Public insider transaction",
      )),
    ...(filingSignals?.ownershipFormCount
      ? [
          renderIntelListItem(
            "ownership filings",
            "Beneficial ownership forms",
            `${filingSignals.ownershipFormCount} recent 13D / 13G-style filings`,
          ),
        ]
      : []),
    ...(filingSignals?.insiderFormCount
      ? [
          renderIntelListItem(
            "insider forms",
            "Insider filing activity",
            `${filingSignals.insiderFormCount} recent Form 3 / 4 / 5 rows`,
          ),
        ]
      : []),
    ...(filingSignals?.dealFormCount
      ? [
          renderIntelListItem(
            "deal filings",
            "Strategic filing cluster",
            `${filingSignals.dealFormCount} recent 8-K / S-4 / 425-style deal signals`,
          ),
        ]
      : []),
  ];

  return rows.join("") || renderIntelEmpty("No insider, filing, or ownership-flow rows are available.");
}

function renderIntelCompetitorRows(items) {
  return (items ?? []).length
    ? (items ?? [])
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
        .join("")
    : `<tr class="intel-row"><td colspan="4"><div class="muted">No competitor rows are available.</div></td></tr>`;
}

function normalizeIntelView(view) {
  const next = String(view ?? "").toUpperCase();
  return INTEL_VIEWS.includes(next) ? next : "SPLC";
}

function intelCommandLabel(payload, view) {
  return (payload?.commands ?? []).find((command) => normalizeIntelView(command.code) === view)?.label ?? view;
}

function renderIntelSection(title, body, meta = "") {
  return `
    <section class="intel-detail-block">
      <div class="intel-mini-heading">
        <strong>${escapeHtml(title)}</strong>
        ${meta ? `<span>${escapeHtml(meta)}</span>` : ""}
      </div>
      ${body}
    </section>
  `;
}

function buildIntelConsoleView(payload, holders, view) {
  const supplierRows = renderIntelList(
    ...(payload.supplyChain.suppliers ?? []).map((item) => renderIntelListItem(item.relation, item.target, item.label)),
  );
  const ecosystemRows = renderIntelList(
    ...(payload.supplyChain.ecosystem ?? []).map((item) => renderIntelListItem(item.relation, item.target, item.label)),
  );
  const customerThemeRows = renderIntelList(
    ...(payload.customerConcentration ?? []).map((item) => renderIntelListItem(item.level, item.name, item.commentary)),
  );
  const customerLinkRows = renderIntelList(
    ...(payload.supplyChain.customers ?? []).map((item) => renderIntelListItem(item.relation, item.target, item.label)),
  );
  const customerRows = renderIntelList(
    ...(payload.customerConcentration ?? []).map((item) => renderIntelListItem(item.level, item.name, item.commentary)),
    ...(payload.supplyChain.customers ?? []).map((item) => renderIntelListItem(item.relation, item.target, item.label)),
  );
  const corporateRows = renderIntelList(
    ...(payload.corporate.tree ?? []).map((item) => renderIntelListItem(item.type, item.name, item.description)),
    ...(payload.corporate.relations ?? []).map((item) => renderIntelListItem(item.relation, item.target, item.label)),
  );
  const executiveRows =
    (payload.executives ?? [])
      .map((item) =>
        renderIntelListItem(
          item.role ?? "Executive",
          item.name,
          item.background?.length ? item.background.join(" -> ") : item.compensation ? `Comp ${formatMoney(item.compensation)}` : "Public-company officer listing",
        ),
      )
      .join("") || renderIntelEmpty("No executive network data mapped.");
  const coverageRows =
    (payload.coverage?.notes ?? []).map((note, index) => renderIntelNote(note, index)).join("") ||
    renderIntelEmpty("No coverage notes were returned.");
  const impactRows =
    (payload.eventChains ?? []).map((chain, index) => renderImpactChain(chain, index)).join("") ||
    renderIntelEmpty("No impact chains mapped.");
  const supplierCount = payload.supplyChain.suppliers?.length ?? 0;
  const ecosystemCount = payload.supplyChain.ecosystem?.length ?? 0;
  const customerCount = payload.supplyChain.customers?.length ?? 0;
  const customerThemeCount = payload.customerConcentration?.length ?? 0;
  const impactCount = payload.eventChains?.length ?? 0;
  const competitorsTable = `
    <div class="table-wrap compact terminal-table-wrap">
      <table class="terminal-table intel-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Last</th>
            <th>% Change</th>
          </tr>
        </thead>
        <tbody>${renderIntelCompetitorRows(payload.competitors ?? [])}</tbody>
      </table>
    </div>
  `;
  const holdersTable = `
    <div class="table-wrap compact terminal-table-wrap">
      <table class="terminal-table intel-table">
        <thead>
          <tr>
            <th>Holder</th>
            <th>% Held</th>
            <th>Shares</th>
          </tr>
        </thead>
        <tbody>${renderIntelHolderRows(holders)}</tbody>
      </table>
    </div>
  `;

  switch (view) {
    case "REL":
      return {
        title: "Relationships",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          renderIntelSection("Corporate Tree & M&A", `<div class="list-stack">${corporateRows}</div>`, `${payload.corporate.tree?.length ?? 0} mapped nodes`) +
          renderIntelSection("Customer Concentration", `<div class="list-stack">${customerRows}</div>`, `${payload.customerConcentration?.length ?? 0} disclosed themes`),
        secondaryTitle: "Executive Network",
        secondaryMeta: `${payload.executives?.length ?? 0} named leaders`,
        secondaryHtml: `<div class="list-stack">${executiveRows}</div>`,
      };
    case "OWN":
      return {
        title: "Ownership",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          `<div class="intel-ownership-shell">
            ${renderIntelSection("Top Holders", holdersTable, `${holders.length} named institutions`)}
            ${renderIntelSection(
              "Ownership Snapshot",
              `<div class="metric-strip intel-inline-metrics">
                ${metric("Inst. Held", formatPercentScaled(payload.ownership.institutionPercentHeld))}
                ${metric("Insider Held", formatPercentScaled(payload.ownership.insiderPercentHeld))}
                ${metric("Float", formatCompact(payload.ownership.floatShares))}
                ${metric("Short Int", formatCompact(payload.ownership.sharesShort))}
              </div>`,
            )}
            ${renderIntelSection(
              "Ownership Signals",
              `<div class="metric-strip intel-inline-metrics">
                ${renderTerminalStat("Insider Rows", String(payload.ownership.insiderHolders?.length ?? 0), "reported holders")}
                ${renderTerminalStat("Trade Rows", String(payload.ownership.insiderTransactions?.length ?? 0), "recent insider activity")}
                ${renderTerminalStat("13D / 13G", String(payload.ownership.filingSignals?.ownershipFormCount ?? 0), "ownership filings")}
                ${renderTerminalStat("Deal Signals", String(payload.ownership.filingSignals?.dealFormCount ?? 0), "8-K / S-4 / 425")}
              </div>`,
            )}
          </div>`,
        secondaryTitle: "Insiders + Filings",
        secondaryMeta: `${(payload.ownership.insiderHolders?.length ?? 0) + (payload.ownership.insiderTransactions?.length ?? 0) + (payload.ownership.filingSignals?.ownershipFormCount ?? 0)} tracked rows`,
        secondaryHtml: `<div class="list-stack">${renderIntelOwnershipSignals(payload)}</div>`,
      };
    case "BMAP":
      return {
        title: "Geographic Exposure",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          renderIntelSection("Geographic Mix", `<div id="intelDetailGeoChart" class="chart-card small intel-inline-chart"></div>`, "relative public-exposure signals") +
          renderIntelSection(
            "Coverage Note",
            `<div class="intel-inline-note">Scores are relative public-exposure signals, not exact revenue percentages.</div>`,
          ),
        secondaryTitle: "Impact Chains",
        secondaryMeta: `${payload.eventChains?.length ?? 0} mapped catalysts`,
        secondaryHtml: `<div class="list-stack intel-impact-list">${impactRows}</div>`,
        mount() {
          mountGeoExposureChart(document.querySelector("#intelDetailGeoChart"), payload.geography);
        },
      };
    case "RV":
      return {
        title: "Peer Network",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          renderIntelSection("Competitor Network", competitorsTable, `${payload.competitors?.length ?? 0} tracked rivals`) +
          renderIntelSection(
            "Competition / Ecosystem",
            `<div class="list-stack">${renderIntelList(...payload.supplyChain.ecosystem.map((item) => renderIntelListItem(item.relation, item.target, item.label)))}</div>`,
          ),
        secondaryTitle: "Impact Chains",
        secondaryMeta: `${payload.eventChains?.length ?? 0} mapped catalysts`,
        secondaryHtml: `<div class="list-stack intel-impact-list">${impactRows}</div>`,
      };
    case "FA":
      return {
        title: "Financial Analysis",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          renderIntelSection(
            "Coverage Signals",
            `<div class="metric-strip intel-inline-metrics">
              ${renderTerminalStat("Coverage", payload.coverage.curated ? "Curated" : "Fallback", "source mode")}
              ${renderTerminalStat("Peers", String(payload.competitors?.length ?? 0), "tracked rivals")}
              ${renderTerminalStat("Impact Chains", String(payload.eventChains?.length ?? 0), "mapped catalysts")}
              ${renderTerminalStat("Holders", String(holders.length), "named owners")}
            </div>`,
          ) +
          renderIntelSection("Customer Concentration", `<div class="list-stack">${customerRows}</div>`),
        secondaryTitle: "Coverage Notes",
        secondaryMeta: `${payload.coverage.notes?.length ?? 0} notes`,
        secondaryHtml: `<div class="list-stack">${coverageRows}</div>`,
      };
    case "DES":
      return {
        title: "Description",
        meta: intelCommandLabel(payload, view),
        detailHtml:
          renderIntelSection(
            payload.companyName ?? payload.symbol,
            `<div class="intel-summary-card">
              <p>${escapeHtml(payload.summary ?? "No intelligence summary available.")}</p>
            </div>`,
          ) +
          renderIntelSection("Coverage Notes", `<div class="list-stack">${coverageRows}</div>`),
        secondaryTitle: "Corporate Context",
        secondaryMeta: `${payload.corporate.tree?.length ?? 0} mapped corporate links`,
        secondaryHtml: `<div class="list-stack">${corporateRows}</div>`,
      };
    case "SPLC":
    default:
      return {
        title: "Supply Chain Breakdown",
        meta: intelCommandLabel(payload, "SPLC"),
        detailHtml:
          renderIntelSection(
            "Coverage Snapshot",
            `<div class="metric-strip intel-inline-metrics intel-supply-summary">
              ${renderTerminalStat("Upstream", String(supplierCount), "mapped supplier links")}
              ${renderTerminalStat("2nd Order", String(ecosystemCount), "ecosystem dependencies")}
              ${renderTerminalStat("Channels", String(customerCount), "named demand links")}
              ${renderTerminalStat("Catalysts", String(impactCount), "mapped chain reactions")}
            </div>`,
            payload.coverage.curated ? "curated + public coverage" : "public fallback coverage",
          ) +
          renderIntelSection(
            "Core Suppliers",
            `<div class="list-stack">${supplierRows}</div>`,
            `${supplierCount} mapped upstream links`,
          ) +
          renderIntelSection(
            "Secondary Dependencies",
            `<div class="list-stack">${ecosystemRows}</div>`,
            `${ecosystemCount} second-order or partner nodes`,
          ),
        secondaryTitle: "Demand Side + Catalysts",
        secondaryMeta: `${customerCount + customerThemeCount} downstream signals`,
        secondaryHtml: `
          <div class="intel-detail-split-grid">
            ${renderIntelSection(
              "Customer Channels",
              `<div class="list-stack">${customerLinkRows}</div>`,
              `${customerCount} named channels`,
            )}
            ${renderIntelSection(
              "Concentration Themes",
              `<div class="list-stack">${customerThemeRows}</div>`,
              `${customerThemeCount} public demand themes`,
            )}
            <section class="intel-detail-block span-full">
              <div class="intel-mini-heading">
                <strong>Impact Chains</strong>
                <span>${escapeHtml(`${impactCount} mapped catalysts`)}</span>
              </div>
              <div class="list-stack intel-impact-list">${impactRows}</div>
            </section>
          </div>
        `,
      };
  }
}

function rerenderIntelligenceConsole() {
  const payload = state.intelligence;
  if (!payload) {
    return;
  }
  const availableViews = (payload.commands ?? []).map((command) => normalizeIntelView(command.code));
  const fallbackView = normalizeIntelView(availableViews[0]);
  state.intelView = availableViews.includes(normalizeIntelView(state.intelView)) ? normalizeIntelView(state.intelView) : fallbackView;
  document.querySelectorAll("#intelCommandBar [data-intel-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.intelView === state.intelView);
  });

  const holders = topIntelHolders(payload);
  const view = buildIntelConsoleView(payload, holders, state.intelView);
  setText("#intelDetailTitle", view.title);
  setText("#intelDetailMeta", view.meta);
  document.querySelector("#intelDetailBody").innerHTML = view.detailHtml;
  setText("#intelSecondaryTitle", view.secondaryTitle);
  setText("#intelSecondaryMeta", view.secondaryMeta);
  document.querySelector("#intelSecondaryBody").innerHTML = view.secondaryHtml;
  view.mount?.();
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
  const unavailable = Boolean(options?.warning) && !calls.length && !puts.length;
  const frontCall = calls[0] ?? null;
  const frontPut = puts[0] ?? null;
  const callVolume = sum(calls.map((contract) => contract.volume)) ?? null;
  const putVolume = sum(puts.map((contract) => contract.volume)) ?? null;
  const openInterest = sum([...calls, ...puts].map((contract) => contract.openInterest)) ?? null;
  if (unavailable) {
    return [
      renderTerminalStat("Source", "Blocked", "free listed-options feed"),
      renderTerminalStat("Instrument", humanizeInstrumentType(quote), quote?.exchange ?? "public quote"),
      renderTerminalStat(
        "Share Vol",
        formatCompact(quote?.volume),
        formatCompact(quote?.averageVolume) !== "n/a" ? `avg ${formatCompact(quote?.averageVolume)}` : "share tape",
      ),
      renderTerminalStat("Contracts", "n/a", "retry later"),
      renderTerminalStat("Coverage", "Degraded", "quote and filings still live"),
    ].join("");
  }
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

function renderQuoteMonitorSummary(payload) {
  return [
    renderTerminalStat("Last", formatMoney(payload.quote?.price), payload.quote?.exchange ?? "public quote"),
    renderTerminalStat("Daily Move", formatPercent(payload.quote?.changePercent), formatSignedMoney(payload.quote?.change)),
    renderTerminalStat("Peers", String(payload.peers?.length ?? 0), payload.peers?.[0]?.symbol ?? "peer set"),
    renderTerminalStat("Filings", String(payload.filings?.length ?? 0), payload.filings?.[0]?.form ?? "SEC"),
    renderTerminalStat("Holders", String(payload.holders?.length ?? 0), payload.holders?.[0]?.holder ?? "public ownership"),
  ].join("");
}

function renderAiLabPanel(payload) {
  document.querySelector("#aiLabSummary").innerHTML = renderAiLabSummary(payload);
  document.querySelector("#aiLabWarnings").innerHTML = renderStatusStrip(
    payload.warnings ?? [],
    `${escapeHtml(payload.provider?.used === "rules" ? "Daily rules snapshot active" : `${String(payload.provider?.used ?? "Hosted").toUpperCase()} daily snapshot active`)} for ${escapeHtml(payload.universe ?? "S&P 500")}.`,
  );
  document.querySelector("#aiLabProviderMeta").textContent = [
    payload.provider?.used === "rules" ? "Rules engine" : `${String(payload.provider?.used ?? "Hosted").toUpperCase()} · ${payload.provider?.model ?? "default model"}`,
    payload.provider?.fallback ? `fallback ${String(payload.provider.fallback).toUpperCase()}` : "",
    payload.asOf ? formatTimestampShort(payload.asOf) : "",
  ].filter(Boolean).join(" · ");
  document.querySelector("#aiLabSnapshotMeta").textContent = [
    payload.snapshot?.mode === "shared-daily" ? "Shared daily snapshot" : "Snapshot",
    payload.snapshot?.date ?? "",
  ].filter(Boolean).join(" · ");
  document.querySelector("#aiLabMarketView").innerHTML = renderAiMarketView(payload.marketView ?? {});
  document.querySelector("#aiLabMonitor").innerHTML = renderAiMonitorList(payload.marketView?.monitor ?? []);
  document.querySelector("#aiLabBullishList").innerHTML = renderAiIdeaList(payload.bullish ?? [], "bullish");
  document.querySelector("#aiLabBearishList").innerHTML = renderAiIdeaList(payload.bearish ?? [], "bearish");
}

function renderAiLabSummary(payload) {
  return [
    renderTerminalStat("Provider", String(payload.provider?.used ?? "rules").toUpperCase(), payload.provider?.model ?? "hosted / fallback"),
    renderTerminalStat("Universe", payload.universe ?? "S&P 500", `${payload.coverage?.constituents ?? 0} names`),
    renderTerminalStat("Horizon", payload.horizon ?? "1-4 weeks", "forecast window"),
    renderTerminalStat("Bullish", String(payload.summary?.bullish ?? 0), "ranked long ideas"),
    renderTerminalStat("Bearish", String(payload.summary?.bearish ?? 0), "ranked downside ideas"),
  ].join("");
}

function renderAiMarketView(view) {
  const rows = [
    renderIntelListItem("REGIME", "Market Summary", view.summary ?? "No market summary available."),
    renderIntelListItem("LONG", "Bullish Bias", view.bullishBias ?? "No bullish bias note."),
    renderIntelListItem("SHORT", "Bearish Bias", view.bearishBias ?? "No bearish bias note."),
    ...(view.risks ?? []).map((risk, index) => renderIntelListItem(`RISK ${index + 1}`, "Risk", risk)),
  ];
  return rows.join("");
}

function renderAiMonitorList(items) {
  if (!items.length) {
    return renderIntelEmpty("No watch items are available.");
  }
  return items
    .map((item, index) => renderIntelListItem(`WATCH ${index + 1}`, "Monitor", item))
    .join("");
}

function renderAiIdeaList(items, side) {
  if (!items.length) {
    return renderIntelEmpty(`No ${side} ideas are available right now.`);
  }
  return items.map((item, index) => renderAiIdeaCard(item, index, side)).join("");
}

function renderAiIdeaCard(item, index, side) {
  const confidence = String(item.confidence ?? "medium").toLowerCase();
  return `
    <article class="ai-idea-card ${escapeHtml(side)}">
      <div class="ai-idea-header">
        <div>
          <div class="ai-idea-rank">${String(index + 1).padStart(2, "0")}</div>
          <h4>${escapeHtml(item.symbol ?? "n/a")}</h4>
          <div class="muted">${escapeHtml(compactLabel(item.name ?? item.symbol ?? "Company", 34))}</div>
        </div>
        <div class="ai-idea-chip ${escapeHtml(confidence)}">${escapeHtml(confidence)}</div>
      </div>
      <div class="ai-idea-stats">
        ${renderTerminalStat("Last", formatMoney(item.price), item.sector ?? "sector")}
        ${renderTerminalStat("Day", signedPercent(item.dayChangePercent), "session")}
        ${renderTerminalStat("1M", signedPercent(item.oneMonthChange), "trend")}
        ${renderTerminalStat("Cap", formatCompact(item.marketCap), "market cap")}
      </div>
      <p class="ai-idea-thesis">${escapeHtml(item.thesis ?? "No thesis provided.")}</p>
      <ul class="ai-idea-reasons">
        ${(item.reasons ?? []).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
      <div class="ai-idea-footer">
        <span>${escapeHtml(item.analystRating ?? "street n/a")}</span>
        <span>${escapeHtml(formatWindow(item.earningsWindow))}</span>
        <span>${escapeHtml(item.latestFiling?.form ?? "no filing")}</span>
      </div>
      <div class="ai-idea-risk"><strong>Risk</strong> ${escapeHtml(item.risk ?? "No risk note.")}</div>
    </article>
  `;
}

function renderQuoteMonitorMetrics(quote, market, points) {
  const closes = (points ?? []).map((point) => point.close).filter(Number.isFinite);
  const trend = closes.length >= 2 ? closes.at(-1) - closes[0] : null;
  return [
    metric("Last", formatMoney(quote?.price)),
    metric("Move", formatPercent(quote?.changePercent), tone(quote?.changePercent)),
    metric("Trend", formatSignedMoney(trend), tone(trend)),
    metric("Volume", formatCompact(quote?.volume)),
    metric("Mkt Cap", formatCompact(market?.marketCap ?? quote?.marketCap)),
    metric("Street", market?.analystRating ?? "n/a"),
  ].join("");
}

function renderQuoteMonitorNews(items) {
  if (!items.length) {
    return renderIntelEmpty("No linked news rows are available.");
  }
  return items
    .slice(0, 8)
    .map(
      (item) => `
        <div class="list-item terminal-list-item">
          <div class="terminal-list-main">
            <strong>${escapeHtml(item.title ?? "News")}</strong>
            <div class="meta">${escapeHtml(item.source ?? "Source")} · ${escapeHtml(formatDateTime(item.publishedAt))}</div>
          </div>
          <div class="terminal-price-stack">
            <strong>${escapeHtml((item.category ?? "news").toUpperCase())}</strong>
            <div class="meta">${item.link ? `<a class="event-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">Open</a>` : "link n/a"}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderQuoteMonitorTimeline(items) {
  if (!items.length) {
    return renderIntelEmpty("No catalyst timeline rows are available.");
  }
  return items
    .map(
      (item) => `
        <div class="list-item terminal-list-item">
          <div class="terminal-list-main">
            <div class="terminal-symbol-line">
              <strong>${escapeHtml(item.title ?? item.kind ?? "Event")}</strong>
              <span class="terminal-chip">${escapeHtml((item.category ?? item.kind ?? "event").toUpperCase())}</span>
            </div>
            <div class="meta">${escapeHtml(item.note ?? item.source ?? "")}</div>
          </div>
          <div class="terminal-price-stack">
            <strong>${escapeHtml(formatDateShort(item.timestamp ?? item.date))}</strong>
            <div class="meta">${escapeHtml(item.source ?? "Source")}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderQuoteMonitorFilings(items) {
  if (!items.length) {
    return renderIntelEmpty("No recent SEC filings are available.");
  }
  return items
    .map(
      (filing) => `
        <div class="list-item terminal-list-item">
          <div class="terminal-list-main">
            <div class="terminal-symbol-line">
              <strong>${escapeHtml(filing.form ?? "SEC filing")}</strong>
              <span class="terminal-chip">${escapeHtml(formatDateShort(filing.filingDate))}</span>
            </div>
            <div class="meta">${escapeHtml(filing.primaryDocument ?? "document")}</div>
          </div>
          <div class="terminal-price-stack">
            <strong>${escapeHtml(filing.accessionNumber ?? "SEC")}</strong>
            <div class="meta">${filing.filingUrl ? `<a class="event-link" href="${safeUrl(filing.filingUrl)}" target="_blank" rel="noreferrer">Open</a>` : "source n/a"}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderQuoteMonitorOptionRows(items, side) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">Public ${escapeHtml(side)} chain unavailable right now.</td></tr>`;
  }
  return items
    .slice(0, 8)
    .map(
      (item) => `
        <tr class="intel-row">
          <td>${formatMoney(item.strike)}</td>
          <td>${formatMoney(item.lastPrice)}</td>
          <td>${formatMoney(item.bid)} / ${formatMoney(item.ask)}</td>
          <td>${formatCompact(item.volume)} / ${formatCompact(item.openInterest)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderMarketBoardsSummary(payload) {
  return [
    renderTerminalStat("Leader", payload.summary?.leader ?? "n/a", "best mover"),
    renderTerminalStat("Most Active", payload.summary?.active ?? "n/a", "highest tape"),
    renderTerminalStat("Unusual", payload.summary?.unusual ?? "n/a", "flow board"),
    renderTerminalStat("Tracked", String(payload.summary?.trackedSymbols ?? 0), "watchlist universe"),
  ].join("");
}

function renderBoardQuoteRows(items, volumeField = "volume") {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No board rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row ${tone(item.changePercent)}" data-flow-symbol="${escapeHtml(item.symbol)}">
          <td><strong>${escapeHtml(item.symbol)}</strong></td>
          <td>${formatMoney(item.price)}</td>
          <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
          <td>${formatCompact(item[volumeField])}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardActiveRows(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No active rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row ${tone(item.changePercent)}" data-flow-symbol="${escapeHtml(item.symbol)}">
          <td><strong>${escapeHtml(item.symbol)}</strong></td>
          <td>${formatCompact(item.volume)}</td>
          <td>${formatCompact(item.dollarVolume)}</td>
          <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardUnusualRows(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No unusual-volume rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row" data-flow-symbol="${escapeHtml(item.symbol)}">
          <td><strong>${escapeHtml(item.symbol)}</strong></td>
          <td>${formatNumber(item.relativeVolume, 2)}x</td>
          <td>${formatCompact(item.shareVolume)}</td>
          <td>${escapeHtml(item.analystRating ?? item.instrumentType ?? item.exchange ?? "market")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardGapRows(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No gap-proxy rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row ${tone(item.gapProxyPercent)}" data-flow-symbol="${escapeHtml(item.symbol)}">
          <td><strong>${escapeHtml(item.symbol)}</strong></td>
          <td class="${tone(item.gapProxyPercent)}">${formatPercent(item.gapProxyPercent)}</td>
          <td>${formatMoney(item.price)}</td>
          <td>${escapeHtml(item.sector ?? "market")}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardSectorRows(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No sector rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row ${tone(item.averageMove)}" data-board-sector="${escapeHtml(item.sector ?? "Sector")}">
          <td><strong>${escapeHtml(item.sector ?? "Sector")}</strong></td>
          <td class="${tone(item.averageMove)}">${formatPercent(item.averageMove)}</td>
          <td>${formatPercent(item.weight)}</td>
          <td>${escapeHtml(String(item.count ?? 0))}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardEtfRows(items) {
  if (!items.length) {
    return `<tr><td colspan="4" class="muted">No ETF tape rows are available.</td></tr>`;
  }
  return items
    .map(
      (item) => `
        <tr class="intel-row ${tone(item.changePercent)}" data-flow-symbol="${escapeHtml(item.symbol)}">
          <td><strong>${escapeHtml(item.symbol)}</strong></td>
          <td>${formatMoney(item.price)}</td>
          <td>${formatCompact(item.tapeFlow)}</td>
          <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderBoardsMacroCards(macro) {
  const cards = macro?.cards ?? [];
  return cards.length
    ? cards
        .slice(0, 6)
        .map((card) => renderTerminalStat(card.label, String(card.value ?? "n/a"), card.note ?? "macro"))
        .join("")
    : renderIntelEmpty("No macro cards are available.");
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
    <div class="intel-sequence intel-impact-sequence">
      <div class="intel-impact-header">
        <span class="intel-impact-index">${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(chain.title)}</strong>
      </div>
      <ol class="chain-steps chain-steps-compact">
        ${chain.steps.map((step) => `<li class="chain-step-compact">${escapeHtml(step)}</li>`).join("")}
      </ol>
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
  const normalizedSectorFocus = sanitizeSectorFocus(preferences?.sectorFocus, DEFAULT_SECTORS);
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
    terminalHotkeys: Array.isArray(preferences?.terminalHotkeys)
      ? preferences.terminalHotkeys.map((entry) => String(entry ?? "").trim()).filter(Boolean).slice(0, 8)
      : [...DEFAULT_PREFERENCES.terminalHotkeys],
    newsFocus: typeof preferences?.newsFocus === "string" ? preferences.newsFocus : "",
    sectorFocus: normalizedSectorFocus,
    aiUniverse: preferences?.aiUniverse === "sp500" ? preferences.aiUniverse : DEFAULT_PREFERENCES.aiUniverse,
    aiHorizon: preferences?.aiHorizon === "1-4w" ? preferences.aiHorizon : DEFAULT_PREFERENCES.aiHorizon,
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
              <div class="geo-column-title">${escapeHtml(group.title)} <span class="geo-column-kicker">score / 5</span></div>
              <div class="geo-column-body">
                ${group.items
                  .slice()
                  .sort((left, right) => (Number.isFinite(right.weight) ? right.weight : 0) - (Number.isFinite(left.weight) ? left.weight : 0))
                  .slice(0, 4)
                  .map(
                    (item) => `
                      <button type="button" class="geo-row">
                        <div class="geo-row-head">
                          <strong>${escapeHtml(item.label)}</strong>
                          <span>${escapeHtml(formatGeoScore(item.weight))}</span>
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
    <div class="geo-board-note">Scores are relative public-exposure signals, not exact revenue percentages.</div>
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

  const sideDepth = Math.max(lanes.supply.length, lanes.customer.length, 4);
  const width = Math.max(1420, 1160 + Math.max(lanes.corporate.length, lanes.market.length, 6) * 28);
  const height = Math.max(560, 280 + sideDepth * 68);
  const hub = { x: width / 2, y: height / 2 };
  const topY = 94;
  const bottomY = height - 94;
  const leftX = 116;
  const rightX = width - 116;
  const laneXFrom = 168;
  const laneXTo = width - 168;
  const laneYFrom = 162;
  const laneYTo = height - 162;
  const positioned = [
    ...layoutGraphLane(lanes.corporate, { orientation: "horizontal", xFrom: laneXFrom, xTo: laneXTo, y: topY }),
    ...layoutGraphLane(lanes.supply, { orientation: "vertical-left", xFrom: leftX, yFrom: laneYFrom, yTo: laneYTo }),
    ...layoutGraphLane(lanes.customer, { orientation: "vertical-right", xFrom: rightX, yFrom: laneYFrom, yTo: laneYTo }),
    ...layoutGraphLane(lanes.market, { orientation: "horizontal", xFrom: laneXFrom, xTo: laneXTo, y: bottomY }),
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
    <div class="graph-network" style="min-height:${height}px; height:${height}px;">
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
          const left = ((node.x / width) * 100).toFixed(2);
          const top = ((node.y / height) * 100).toFixed(2);
          return `
            <button
              type="button"
              class="graph-network-node graph-network-node-${escapeHtml(graphToneForKind(node.kind))}"
              style="left:${left}%; top:${top}%;"
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
  const list = nodes.slice();
  if (!list.length) {
    return [];
  }

  if (spec.orientation === "horizontal" || Number.isFinite(spec.y)) {
    const rowCount = list.length > 14 ? 3 : list.length > 7 ? 2 : 1;
    const perRow = Math.ceil(list.length / rowCount);
    return list.map((node, index) => {
      const row = Math.floor(index / perRow);
      const offset = row * perRow;
      const count = Math.min(perRow, list.length - offset);
      const progress = count === 1 ? 0.5 : (index - offset) / (count - 1);
      const x = spec.xFrom === spec.xTo || spec.xTo == null
        ? spec.xFrom
        : spec.xFrom + progress * (spec.xTo - spec.xFrom);
      const yOffsets = rowCount === 1
        ? [0]
        : rowCount === 2
          ? [-40, 40]
          : [-66, 0, 66];
      const y = spec.y + (yOffsets[row] ?? 0);
      return { ...node, x, y };
    });
  }

  const columnCount = list.length > 14 ? 3 : list.length > 6 ? 2 : 1;
  const perColumn = Math.ceil(list.length / columnCount);
  return list.map((node, index) => {
    const column = Math.floor(index / perColumn);
    const offset = column * perColumn;
    const count = Math.min(perColumn, list.length - offset);
    const progress = count === 1 ? 0.5 : (index - offset) / (count - 1);
    const columnSpacing = 132;
    const x = spec.orientation === "vertical-right"
      ? spec.xFrom - (column * columnSpacing)
      : spec.xFrom + (column * columnSpacing);
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

function signedPercent(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
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

function formatGeoScore(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  const rounded = clamp(Math.round(value), 1, 5);
  const label = rounded >= 5 ? "Very high" : rounded >= 4 ? "High" : rounded >= 3 ? "Moderate" : rounded >= 2 ? "Light" : "Low";
  return `${rounded}/5 ${label}`;
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
    return "Free listed-options coverage is blocked by the current public upstream. Quote, chart, and filings coverage remain live.";
  }
  if (text.includes("Unauthorized")) {
    return "An upstream public market-data endpoint denied this request. Showing fallback coverage.";
  }
  if (
    /503\b|service unavailable|bad gateway|gateway timeout|timed out|timeout|<!doctype html>|<html\b|<title>\s*yahoo/i.test(
      text,
    )
  ) {
    return "The current public listed-options source is temporarily unavailable. Quote, chart, and filings coverage remain live.";
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
