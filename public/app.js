const DEFAULT_PREFERENCES = {
  watchlistSymbols: ["AAPL", "MSFT", "NVDA", "SPY", "TLT", "GLD", "EURUSD=X", "^GSPC"],
  detailSymbol: "AAPL",
  cryptoProducts: ["BTC-USD", "ETH-USD", "SOL-USD"],
  screenConfig: {
    symbols: "AAPL,MSFT,NVDA,AMZN,META,GOOGL,TSLA,JPM,XOM,UNH,AVGO,AMD,QQQ,SPY,TLT,GLD",
    maxPe: "",
    minMarketCap: "",
    minVolume: "",
    minChangePct: "",
  },
  portfolio: [],
};

const GUEST_PREFERENCES_KEY = "omt-guest-preferences";

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
  selectedWorkspaceId: null,
  selectedNoteId: null,
  selectedDigestId: null,
  currentHistoryRange: "1mo",
  profileSyncTimer: null,
  cryptoSource: null,
  activitySource: null,
  latestPulseCount: 0,
  lastSyncAt: null,
  feedStatus: "Booting",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

document.addEventListener("DOMContentLoaded", async () => {
  bindForms();
  startHudClock();
  await loadSession();
  applyPreferencesToInputs();
  renderAuth();
  renderProtectedGuards();
  renderPortfolio();
  renderAlerts();
  renderDestinations();
  renderDigests();
  renderNotes();
  renderWorkspaces();
  renderActivity();
  renderHud();
  connectCrypto();
  await Promise.all([
    loadMarketPulse(),
    loadWatchlist(state.preferences.watchlistSymbols),
    loadDetail(state.preferences.detailSymbol),
    loadMacro(),
    loadYieldCurve(),
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

  document.querySelector("#watchlistForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.watchlistSymbols = splitSymbols(document.querySelector("#watchlistInput").value);
    schedulePreferenceSync();
    await loadWatchlist(state.preferences.watchlistSymbols);
    await loadWatchlistEvents();
  });

  document.querySelector("#saveWatchlistButton").addEventListener("click", async () => {
    await syncPreferences(true);
  });

  document.querySelector("#detailForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    state.preferences.detailSymbol = document.querySelector("#detailSymbol").value.trim().toUpperCase();
    state.currentHistoryRange = document.querySelector("#historyRange").value;
    schedulePreferenceSync();
    await loadDetail(state.preferences.detailSymbol);
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
  state.preferences = mergePreferences(loadStore(GUEST_PREFERENCES_KEY, DEFAULT_PREFERENCES));
  applyPreferencesToInputs();
  disconnectActivityStream();
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

    document.querySelector("#watchlistBody").innerHTML = payload.quotes
      .map(
        (quote) => `
          <tr>
            <td><strong>${escapeHtml(quote.symbol)}</strong><div class="muted">${escapeHtml(quote.shortName ?? "")}</div></td>
            <td>${formatMoney(quote.price)}</td>
            <td class="${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</td>
            <td>${formatMoney(quote.bid)} / ${formatMoney(quote.ask)}</td>
            <td>${formatCompact(quote.volume)}</td>
            <td>${formatCompact(quote.marketCap)}</td>
          </tr>
        `,
      )
      .join("");

    document.querySelector("#watchlistStatus").textContent = `Tracking ${payload.quotes.length} symbols.`;
    renderPortfolio();
    renderHud();
  } catch (error) {
    setFeedStatus("Degraded");
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
  state.currentHistoryRange = range;

  try {
    const [quotePayload, company, history, options] = await Promise.all([
      api(`/api/quote?symbols=${encodeURIComponent(symbol)}`),
      api(`/api/company?symbol=${encodeURIComponent(symbol)}`),
      api(`/api/history?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}&interval=1d`),
      api(`/api/options?symbol=${encodeURIComponent(symbol)}`),
    ]);

    const quote = quotePayload.quotes[0];
    if (quote) {
      state.latestQuotes.set(quote.symbol, quote);
    }

    renderDetailMetrics(quote, company.market);
    renderPriceChart(history.points, symbol);
    renderOverview(company);
    renderCompanyFacts(company);
    renderFilings(company.sec.filings);
    renderOptions(options.calls, options.puts);
    renderPortfolio();
    await loadIntelligence(symbol);
    renderHud();
  } catch (error) {
    setFeedStatus("Degraded");
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
    document.querySelector("#yieldCurveChart").innerHTML = renderBarChart(
      payload.points.map((point) => point.value),
      payload.points.map((point) => point.tenor),
      payload.asOf,
      "%",
    );
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
  if (state.cryptoSource) {
    state.cryptoSource.close();
  }

  const products = state.preferences.cryptoProducts;
  const board = document.querySelector("#cryptoBoard");
  state.cryptoSource = new EventSource(`/api/stream/crypto?products=${encodeURIComponent(products.join(","))}`);

  state.cryptoSource.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    state.cryptoQuotes.set(payload.productId, payload);
    markFeedHeartbeat("Streaming");
    maybeShowAlertNotification(payload.productId, payload.price);
    board.innerHTML = products
      .map((product) => renderCryptoCard(state.cryptoQuotes.get(product) ?? { productId: product }))
      .join("");
  };

  state.cryptoSource.onerror = () => {
    setFeedStatus("Retrying");
    showStatus("Crypto stream disconnected. Retrying automatically.", true);
  };
}

function connectActivityStream() {
  disconnectActivityStream();
  if (!state.authenticated) {
    return;
  }

  state.activitySource = new EventSource("/api/stream/activity");
  state.activitySource.onmessage = async (event) => {
    const payload = JSON.parse(event.data);
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
}

function disconnectActivityStream() {
  if (state.activitySource) {
    state.activitySource.close();
    state.activitySource = null;
  }
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
  document.querySelector("#historyRange").value = state.currentHistoryRange;
  document.querySelector("#screenSymbols").value = state.preferences.screenConfig.symbols;
  document.querySelector("#screenMaxPe").value = state.preferences.screenConfig.maxPe;
  document.querySelector("#screenMinCap").value = state.preferences.screenConfig.minMarketCap;
  document.querySelector("#screenMinVolume").value = state.preferences.screenConfig.minVolume;
  document.querySelector("#screenMinChange").value = state.preferences.screenConfig.minChangePct;
  document.querySelector("#compareSymbolsInput").value = state.preferences.watchlistSymbols.join(",");
  applyCryptoPreferences();
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
  applyPreferencesToInputs();
  connectCrypto();
  void Promise.all([
    loadWatchlist(state.preferences.watchlistSymbols),
    loadWatchlistEvents(),
    loadDetail(state.preferences.detailSymbol),
    loadOrderBook(currentOrderBookProduct()),
    runScreen(),
    runCompare(),
  ]);
}

function snapshotCurrentWorkspace() {
  return {
    watchlistSymbols: state.preferences.watchlistSymbols,
    detailSymbol: state.preferences.detailSymbol,
    cryptoProducts: state.preferences.cryptoProducts,
    screenConfig: state.preferences.screenConfig,
    portfolio: state.preferences.portfolio,
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
  setInterval(() => void loadWatchlist(state.preferences.watchlistSymbols), 30000);
  setInterval(() => void loadWatchlistEvents(), 120000);
  setInterval(() => void loadIntelligence(state.preferences.detailSymbol), 180000);
  setInterval(() => void renderPortfolio(), 30000);
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
    metric("P/E", formatNumber(market?.trailingPe, 2)),
    metric("Market Cap", formatCompact(market?.marketCap)),
  ].join("");
}

function renderOverview(company) {
  document.querySelector("#companyOverview").innerHTML = `
    <div>
      <p class="section-label">${escapeHtml(company.market.exchange ?? "Market profile")}</p>
      <h3>${escapeHtml(company.market.shortName ?? company.symbol)}</h3>
    </div>
    <p>${escapeHtml(company.market.businessSummary ?? "No business summary was returned by the current data source.")}</p>
    <p><strong>Sector:</strong> ${escapeHtml(company.market.sector ?? "n/a")} | <strong>Industry:</strong> ${escapeHtml(company.market.industry ?? "n/a")}</p>
    <p><strong>Website:</strong> ${company.market.website ? `<a href="${safeUrl(company.market.website)}" target="_blank" rel="noreferrer">${escapeHtml(company.market.website)}</a>` : "n/a"}</p>
  `;
}

function renderCompanyFacts(company) {
  document.querySelector("#companyFacts").innerHTML = [
    secFact("Revenue", company.sec.facts.revenue),
    secFact("Net Income", company.sec.facts.netIncome),
    secFact("Assets", company.sec.facts.assets),
    secFact("Cash", company.sec.facts.cash),
    secFact("Shares Out", company.sec.facts.sharesOutstanding),
    fact("Analyst Rating", company.market.analystRating ?? "n/a", company.market.exchange),
  ].join("");
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
      .map((note) => `<div class="list-item"><div class="meta">${escapeHtml(note)}</div></div>`)
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

    document.querySelector("#intelHoldersBody").innerHTML = holders
      .map(
        (holder) => `
          <tr>
            <td>${escapeHtml(holder.holder ?? "n/a")}</td>
            <td>${formatPercentScaled(holder.pctHeld)}</td>
            <td>${formatCompact(holder.shares)}</td>
          </tr>
        `,
      )
      .join("");

    document.querySelector("#intelSupplyList").innerHTML = [
      ...payload.supplyChain.suppliers.map((item) => renderIntelListItem(item.relation, item.target, item.label)),
      ...payload.supplyChain.ecosystem.map((item) => renderIntelListItem(item.relation, item.target, item.label)),
    ].join("");

    document.querySelector("#intelCustomerList").innerHTML = [
      ...(payload.customerConcentration ?? []).map((item) =>
        renderIntelListItem(item.level, item.name, item.commentary),
      ),
      ...(payload.supplyChain.customers ?? []).map((item) =>
        renderIntelListItem(item.relation, item.target, item.label),
      ),
    ].join("");

    document.querySelector("#intelCorporateList").innerHTML = [
      ...(payload.corporate.tree ?? []).map((item) => renderIntelListItem(item.type, item.name, item.description)),
      ...(payload.corporate.relations ?? []).map((item) =>
        renderIntelListItem(item.relation, item.target, item.label),
      ),
    ].join("");

    document.querySelector("#intelExecList").innerHTML = (payload.executives ?? [])
      .map((item) =>
        renderIntelListItem(
          item.role ?? "Executive",
          item.name,
          item.background?.length ? item.background.join(" -> ") : item.compensation ? `Comp ${formatMoney(item.compensation)}` : "Public-company officer listing",
        ),
      )
      .join("");

    document.querySelector("#intelImpactList").innerHTML = (payload.eventChains ?? [])
      .map(
        (chain) => `
          <div class="intel-sequence">
            <strong>${escapeHtml(chain.title)}</strong>
            <div class="meta">${chain.steps.map(escapeHtml).join(" -> ")}</div>
          </div>
        `,
      )
      .join("");

    document.querySelector("#intelCompetitorBody").innerHTML = (payload.competitors ?? [])
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.symbol)}</td>
            <td>${escapeHtml(item.companyName ?? "n/a")}</td>
            <td>${formatMoney(item.price)}</td>
            <td class="${tone(item.changePercent)}">${formatPercent(item.changePercent)}</td>
          </tr>
        `,
      )
      .join("");

    document.querySelector("#intelGraph").innerHTML = renderIntelGraph(payload.graph, payload.symbol);
    document.querySelector("#intelGeoChart").innerHTML = renderGeoExposure(payload.geography);
  } catch (error) {
    showStatus(error.message, true);
  }
}

function renderFilings(filings) {
  document.querySelector("#filingsList").innerHTML = filings
    .map(
      (filing) => `
        <div class="list-item">
          <div>
            <strong>${escapeHtml(filing.form ?? "n/a")}</strong>
            <div class="meta">${escapeHtml(filing.primaryDocument ?? "Document")} | filed ${escapeHtml(filing.filingDate ?? "n/a")}</div>
          </div>
          <div class="muted">${escapeHtml(filing.reportDate ?? "")}</div>
        </div>
      `,
    )
    .join("");
}

function renderOptions(calls, puts) {
  document.querySelector("#callsBody").innerHTML = calls
    .slice(0, 12)
    .map(
      (contract) => `
        <tr>
          <td>${formatMoney(contract.strike)}</td>
          <td>${formatMoney(contract.lastPrice)}</td>
          <td>${formatMoney(contract.bid)} / ${formatMoney(contract.ask)}</td>
          <td>${formatPercent((contract.impliedVolatility ?? 0) * 100)}</td>
        </tr>
      `,
    )
    .join("");
  document.querySelector("#putsBody").innerHTML = puts
    .slice(0, 12)
    .map(
      (contract) => `
        <tr>
          <td>${formatMoney(contract.strike)}</td>
          <td>${formatMoney(contract.lastPrice)}</td>
          <td>${formatMoney(contract.bid)} / ${formatMoney(contract.ask)}</td>
          <td>${formatPercent((contract.impliedVolatility ?? 0) * 100)}</td>
        </tr>
      `,
    )
    .join("");
}

function renderPriceChart(points, symbol) {
  const validPoints = points.filter((point) => Number.isFinite(point.close));
  if (!validPoints.length) {
    document.querySelector("#priceChart").innerHTML = "<p class='muted'>No chart data available.</p>";
    return;
  }

  const values = validPoints.map((point) => point.close);
  const path = buildLinePath(values, 720, 260);
  const min = Math.min(...values);
  const max = Math.max(...values);

  document.querySelector("#priceChart").innerHTML = `
    <svg viewBox="0 0 720 260" preserveAspectRatio="none" aria-label="${escapeHtml(symbol)} price chart">
      <defs>
        <linearGradient id="line-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(53, 240, 210, 0.24)" />
          <stop offset="100%" stop-color="rgba(53, 240, 210, 0)" />
        </linearGradient>
      </defs>
      <path d="${path.area}" fill="url(#line-fill)"></path>
      <path d="${path.line}" fill="none" stroke="#35f0d2" stroke-width="3" stroke-linecap="round"></path>
      <text x="10" y="20" fill="#8ea1c7" font-size="14">${escapeHtml(symbol)}</text>
      <text x="10" y="42" fill="#eff7ff" font-size="22">${formatMoney(values.at(-1))}</text>
      <text x="620" y="24" fill="#8ea1c7" font-size="12">High ${formatMoney(max)}</text>
      <text x="620" y="44" fill="#8ea1c7" font-size="12">Low ${formatMoney(min)}</text>
    </svg>
  `;
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
    <div class="list-item">
      <div>
        <strong>${escapeHtml(quote.symbol)}</strong>
        <div class="meta">${escapeHtml(quote.shortName ?? "")}</div>
      </div>
      <div class="${tone(quote.changePercent)}">${formatPercent(quote.changePercent)}</div>
    </div>
  `;
}

function renderIntelListItem(label, title, description) {
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(title ?? "n/a")}</strong>
        <div class="meta">${escapeHtml(label ?? "")}</div>
      </div>
      <div class="muted">${escapeHtml(description ?? "")}</div>
    </div>
  `;
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
    cryptoProducts: Array.isArray(preferences?.cryptoProducts)
      ? preferences.cryptoProducts
      : [...DEFAULT_PREFERENCES.cryptoProducts],
    portfolio: Array.isArray(preferences?.portfolio) ? preferences.portfolio : [],
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

function formatNumber(value, maximumFractionDigits = 2) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)
    : "n/a";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "n/a";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString() : "n/a";
}

function tone(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  return value >= 0 ? "positive" : "negative";
}

function trimPreview(value) {
  return String(value ?? "").trim().slice(0, 120) || "No content yet.";
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
