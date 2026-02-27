import { config } from "./config.mjs";
import { getCuratedIntelligence, listSupportedIntelligenceSymbols } from "./intelligence-graph.mjs";
import { getMacroSnapshot } from "./providers/bls.mjs";
import { getMacroCalendar } from "./providers/calendar.mjs";
import { getOrderBook, getTicker } from "./providers/coinbase.mjs";
import { getMarketNews } from "./providers/news.mjs";
import { getCompanySnapshot } from "./providers/sec.mjs";
import { getYieldCurve } from "./providers/treasury.mjs";
import { getCompanyOverview, getEarningsDetails, getHistory, getOptions, getQuotes } from "./providers/yahoo.mjs";

export class MarketDataService {
  constructor(cache) {
    this.cache = cache;
  }

  async getQuotes(symbols, options = {}) {
    const unique = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))];
    if (!unique.length) {
      return [];
    }

    const missing = unique.filter((symbol) => options.force || !this.cache.peek(`quote:${symbol}`));
    let batchError = null;
    if (missing.length) {
      try {
        const fetched = await getQuotes(missing);
        for (const quote of fetched) {
          await this.cache.getOrSet(
            `quote:${quote.symbol}`,
            async () => quote,
            { ttlMs: config.quoteTtlMs, force: true },
          );
        }
      } catch (error) {
        batchError = error;
      }
    }

    const quotes = await Promise.all(
      unique.map((symbol) =>
        this.cache.getOrSet(
          `quote:${symbol}`,
          async () => {
            const [quote] = await getQuotes([symbol]);
            return quote ?? null;
          },
          { ttlMs: config.quoteTtlMs, staleMs: config.quoteTtlMs * 2, force: false },
        ),
      ),
    ).then((rows) => rows.filter(Boolean));

    if (!quotes.length && batchError) {
      throw batchError;
    }

    return quotes;
  }

  async getHistory(symbol, range, interval) {
    return this.cache.getOrSet(
      `history:${symbol}:${range}:${interval}`,
      async () => {
        try {
          return await getHistory(symbol, range, interval);
        } catch {
          return [];
        }
      },
      { ttlMs: config.historyTtlMs, staleMs: config.historyTtlMs * 2 },
    );
  }

  async getOptions(symbol, expiration) {
    const suffix = expiration ?? "front";
    return this.cache.getOrSet(
      `options:${symbol}:${suffix}`,
      async () => {
        try {
          return await getOptions(symbol, expiration);
        } catch (error) {
          return emptyOptions(symbol, error);
        }
      },
      { ttlMs: config.quoteTtlMs, staleMs: config.quoteTtlMs * 4 },
    );
  }

  async getCompany(symbol) {
    return this.cache.getOrSet(
      `company:${symbol}`,
      async () => {
        const upper = symbol.toUpperCase();
        const [secResult, marketResult] = await Promise.allSettled([
          getCompanySnapshot(upper),
          getCompanyOverview(upper),
        ]);
        const warnings = [];
        const sec = secResult.status === "fulfilled" ? secResult.value : emptySecSnapshot(upper, secResult.reason);
        const market =
          marketResult.status === "fulfilled"
            ? marketResult.value
            : emptyMarketOverview(upper, sec.title, marketResult.reason);

        if (secResult.status === "rejected") {
          warnings.push(`SEC data unavailable for ${upper}: ${secResult.reason?.message ?? "source error"}`);
        }
        if (marketResult.status === "rejected") {
          warnings.push(`Market profile unavailable for ${upper}: ${marketResult.reason?.message ?? "source error"}`);
        }

        return {
          symbol: upper,
          sec,
          market,
          warnings,
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 4 },
    );
  }

  async getMacro() {
    return this.cache.getOrSet("macro", getMacroSnapshot, {
      ttlMs: config.macroTtlMs,
      staleMs: config.macroTtlMs * 6,
    });
  }

  async getYieldCurve() {
    return this.cache.getOrSet("yield-curve", getYieldCurve, {
      ttlMs: config.yieldCurveTtlMs,
      staleMs: config.yieldCurveTtlMs * 6,
    });
  }

  async getOrderBook(productId) {
    return this.cache.getOrSet(
      `orderbook:${productId}`,
      () => getOrderBook(productId),
      { ttlMs: config.cryptoOrderBookTtlMs, staleMs: config.cryptoOrderBookTtlMs * 2 },
    );
  }

  async getCryptoTicker(productId) {
    return this.cache.getOrSet(
      `crypto:${productId}`,
      () => getTicker(productId),
      { ttlMs: config.cryptoOrderBookTtlMs, staleMs: config.cryptoOrderBookTtlMs * 2 },
    );
  }

  async getMarketPulse(symbols = config.marketPulseSymbols) {
    const quotes = await this.getQuotes(symbols);
    const sorted = [...quotes].sort((left, right) => (right.changePercent ?? 0) - (left.changePercent ?? 0));
    return {
      asOf: new Date().toISOString(),
      cards: quotes,
      leaders: sorted.slice(0, 3),
      laggards: sorted.slice(-3).reverse(),
    };
  }

  async compareSymbols(symbols) {
    const quotes = await this.getQuotes(symbols);
    const comparisons = await Promise.all(
      quotes.slice(0, 8).map(async (quote) => {
        const company = await this.cache.getOrSet(
          `overview:${quote.symbol}`,
          () => getCompanyOverview(quote.symbol),
          { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 4 },
        );
        return {
          symbol: quote.symbol,
          shortName: quote.shortName,
          price: quote.price,
          changePercent: quote.changePercent,
          marketCap: company.marketCap,
          trailingPe: company.trailingPe,
          forwardPe: company.forwardPe,
          sector: company.sector,
          analystRating: company.analystRating,
        };
      }),
    );

    return comparisons;
  }

  async getWatchlistEvents(symbols) {
    const items = await Promise.all(
      symbols.slice(0, 8).map(async (symbol) => {
        const company = await this.getCompany(symbol).catch(() => null);
        if (!company) {
          return null;
        }
        const latestFiling = company.sec.filings[0] ?? null;
        return latestFiling
          ? {
              symbol: company.symbol,
              companyName: company.market.shortName ?? company.sec.title,
              filing: latestFiling,
            }
          : null;
      }),
    );

    return items
      .filter(Boolean)
      .sort((left, right) => new Date(right.filing.filingDate) - new Date(left.filing.filingDate));
  }

  async warmQuotes(symbols) {
    if (!symbols.length) {
      return [];
    }
    return this.getQuotes(symbols, { force: true });
  }

  async getRelationshipIntel(symbol) {
    const upper = symbol.trim().toUpperCase();
    return this.cache.getOrSet(
      `intel:${upper}`,
      async () => {
        const [company, curated] = await Promise.all([this.getCompany(upper), Promise.resolve(getCuratedIntelligence(upper))]);

        const competitorUniverse = [...new Set([...(curated.peerSymbols ?? []), ...(curated.competitorSymbols ?? [])])]
          .filter((entry) => entry && entry !== upper)
          .slice(0, 8);
        const competitorQuotes = competitorUniverse.length ? await this.getQuotes(competitorUniverse) : [];
        const competitorMap = new Map(competitorQuotes.map((quote) => [quote.symbol, quote]));

        return {
          symbol: upper,
          companyName: company.market.shortName ?? company.sec.title ?? upper,
          summary: company.market.businessSummary ?? curated.headline,
          coverage: {
            curated: curated.curated,
            notes: curated.coverageNotes,
            supportedSymbols: listSupportedIntelligenceSymbols(),
          },
          commands: [
            { code: "SPLC", label: "Supply Chain" },
            { code: "REL", label: "Relationships" },
            { code: "OWN", label: "Ownership" },
            { code: "BMAP", label: "Geography" },
            { code: "RV", label: "Peers" },
            { code: "FA", label: "Financial Analysis" },
            { code: "DES", label: "Description" },
          ],
          ownership: {
            institutionPercentHeld: company.market.institutionPercentHeld,
            insiderPercentHeld: company.market.insiderPercentHeld,
            floatShares: company.market.floatShares,
            sharesShort: company.market.sharesShort,
            shortRatio: company.market.shortRatio,
            topInstitutionalHolders: company.market.topInstitutionalHolders ?? [],
            topFundHolders: company.market.topFundHolders ?? [],
            insiderHolders: company.market.insiderHolders ?? [],
            insiderTransactions: company.market.insiderTransactions ?? [],
            filingSignals: company.sec.relationshipSignals ?? null,
          },
          executives: mergeExecutives(curated.executives, company.market.companyOfficers),
          supplyChain: {
            suppliers: curated.supplyChain.filter((item) => item.relation.includes("supplier") || item.relation.includes("logistics")),
            customers: curated.customers,
            ecosystem: curated.ecosystemRelations,
          },
          corporate: {
            relations: curated.corporateRelations,
            tree: curated.corporate,
          },
          customerConcentration: curated.customerConcentration,
          geography: curated.geography,
          ecosystems: curated.ecosystems,
          eventChains: curated.eventChains,
          graph: curated.graph,
          competitors: competitorUniverse.map((entry) => ({
            symbol: entry,
            companyName: competitorMap.get(entry)?.shortName ?? null,
            price: competitorMap.get(entry)?.price ?? null,
            changePercent: competitorMap.get(entry)?.changePercent ?? null,
          })),
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 2 },
    );
  }

  async getDeskCalendar(symbols) {
    const upperSymbols = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 16);
    const key = upperSymbols.join(",");
    return this.cache.getOrSet(
      `calendar:${key}`,
      async () => {
        const [macroEvents, companies] = await Promise.all([
          getMacroCalendar().catch(() => []),
          Promise.all(
            upperSymbols.map(async (symbol) => {
              try {
                return await this.getCompany(symbol);
              } catch {
                return null;
              }
            }),
          ),
        ]);

        const earnings = companies
          .filter(Boolean)
          .map((company) => buildEarningsEvent(company))
          .filter(Boolean);

        const events = [...macroEvents, ...earnings]
          .sort((left, right) => new Date(left.date) - new Date(right.date))
          .slice(0, 80);

        return {
          asOf: new Date().toISOString(),
          events,
        };
      },
      { ttlMs: config.calendarTtlMs, staleMs: config.calendarTtlMs * 2 },
    );
  }

  async getDeskNews(symbols, focusSymbol) {
    const universe = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 8);
    const key = `${focusSymbol ?? "desk"}:${universe.join(",")}`;
    return this.cache.getOrSet(
      `news:${key}`,
      async () => ({
        asOf: new Date().toISOString(),
        items: await getMarketNews({ symbols: universe, focusSymbol }),
      }),
      { ttlMs: config.newsTtlMs, staleMs: config.newsTtlMs * 2 },
    );
  }

  async getEarningsIntel(symbol, peerSymbols = []) {
    const upper = symbol.trim().toUpperCase();
    const peerUniverse = [...new Set(peerSymbols.map((entry) => entry?.trim().toUpperCase()).filter(Boolean))]
      .filter((entry) => entry !== upper)
      .slice(0, 12);

    return this.cache.getOrSet(
      `earnings:${upper}:${peerUniverse.join(",")}`,
      async () => {
        const [details, company, peers] = await Promise.all([
          getEarningsDetails(upper).catch((error) => ({ ...emptyEarningsIntel(upper), warning: error.message })),
          this.getCompany(upper).catch(() => null),
          Promise.all(
            peerUniverse.map(async (peerSymbol) => {
              try {
                return await this.getCompany(peerSymbol);
              } catch {
                return null;
              }
            }),
          ),
        ]);

        const anchorDate = details.earningsStart ?? details.earningsEnd ?? company?.market?.earningsStart ?? null;
        const peersNearDate = peers
          .filter(Boolean)
          .map((peer) => ({
            symbol: peer.symbol,
            shortName: peer.market.shortName ?? peer.sec.title ?? peer.symbol,
            earningsStart: peer.market.earningsStart ?? null,
            earningsEnd: peer.market.earningsEnd ?? null,
          }))
          .filter((peer) => peer.earningsStart || peer.earningsEnd)
          .sort((left, right) => distanceFromAnchor(left.earningsStart ?? left.earningsEnd, anchorDate) - distanceFromAnchor(right.earningsStart ?? right.earningsEnd, anchorDate))
          .slice(0, 8);

        return {
          symbol: upper,
          companyName: details.shortName ?? company?.market?.shortName ?? company?.sec?.title ?? upper,
          earningsWindow: {
            start: details.earningsStart ?? company?.market?.earningsStart ?? null,
            end: details.earningsEnd ?? company?.market?.earningsEnd ?? null,
          },
          estimates: {
            average: details.earningsAverage,
            low: details.earningsLow,
            high: details.earningsHigh,
            revenueEstimate: details.revenueEstimate,
            recommendation: details.recommendation ?? company?.market?.analystRating ?? null,
          },
          trend: details.trend ?? [],
          history: details.history ?? [],
          peers: peersNearDate,
          warning: details.warning ?? null,
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 2 },
    );
  }

  async getMarketEvents(symbols, focusSymbol) {
    const upperSymbols = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 16);
    const focus = focusSymbol?.trim().toUpperCase() || upperSymbols[0] || null;
    const key = `${focus ?? "desk"}:${upperSymbols.join(",")}`;

    return this.cache.getOrSet(
      `market-events:${key}`,
      async () => {
        const [calendar, news, watchlistEvents, earnings] = await Promise.all([
          this.getDeskCalendar(upperSymbols).catch(() => ({ events: [] })),
          this.getDeskNews(upperSymbols, focus).catch(() => ({ items: [] })),
          this.getWatchlistEvents(upperSymbols).catch(() => []),
          focus ? this.getEarningsIntel(focus, upperSymbols).catch(() => null) : null,
        ]);

        const timeline = [
          ...calendar.events.map((event) => ({
            id: `calendar-${event.id}`,
            kind: "calendar",
            category: event.category,
            importance: event.importance,
            timestamp: event.date,
            title: event.title,
            source: event.source,
            note: event.note,
            symbol: event.symbol ?? null,
            link: null,
          })),
          ...news.items.map((item) => ({
            id: `news-${item.id}`,
            kind: "news",
            category: item.category,
            importance: item.impact,
            timestamp: item.publishedAt,
            title: item.title,
            source: item.source,
            note: "Public live headline",
            symbol: null,
            link: item.link,
          })),
          ...watchlistEvents.map((entry) => ({
            id: `filing-${entry.symbol}-${entry.filing.accessionNumber}`,
            kind: "filing",
            category: "filing",
            importance: filingImportance(entry.filing.form),
            timestamp: entry.filing.filingDate,
            title: `${entry.symbol} filed ${entry.filing.form ?? "SEC filing"}`,
            source: "SEC",
            note: entry.companyName ?? entry.filing.primaryDocument ?? "Recent filing",
            symbol: entry.symbol,
            link: null,
          })),
        ];

        if (earnings?.earningsWindow?.start) {
          timeline.push({
            id: `focus-earnings-${earnings.symbol}`,
            kind: "earnings",
            category: "earnings",
            importance: "high",
            timestamp: earnings.earningsWindow.start,
            title: `${earnings.symbol} earnings window`,
            source: "Yahoo Finance",
            note: earnings.companyName,
            symbol: earnings.symbol,
            link: null,
          });
        }

        const ranked = timeline
          .filter((item) => Number.isFinite(Date.parse(item.timestamp)))
          .map((item) => ({ ...item, score: rankEvent(item) }))
          .sort((left, right) => right.score - left.score)
          .slice(0, 30);

        return {
          asOf: new Date().toISOString(),
          focusSymbol: focus,
          summary: {
            total: ranked.length,
            calendar: ranked.filter((item) => item.kind === "calendar").length,
            news: ranked.filter((item) => item.kind === "news").length,
            filings: ranked.filter((item) => item.kind === "filing").length,
          },
          events: ranked,
        };
      },
      { ttlMs: config.newsTtlMs, staleMs: config.newsTtlMs * 2 },
    );
  }
}

function mergeExecutives(curatedExecutives = [], officers = []) {
  const merged = new Map();

  for (const executive of curatedExecutives) {
    merged.set(executive.name, {
      name: executive.name,
      role: executive.role,
      background: executive.background ?? [],
      compensation: null,
    });
  }

  for (const officer of officers ?? []) {
    const existing = merged.get(officer.name) ?? {
      name: officer.name,
      role: officer.title,
      background: [],
      compensation: officer.totalPay ?? null,
    };
    merged.set(officer.name, {
      ...existing,
      role: existing.role ?? officer.title,
      compensation: existing.compensation ?? officer.totalPay ?? null,
    });
  }

  return [...merged.values()].slice(0, 12);
}

function emptySecSnapshot(symbol, error) {
  return {
    ticker: symbol,
    cik: null,
    title: symbol,
    filings: [],
    relationshipSignals: null,
    facts: {
      revenue: null,
      netIncome: null,
      assets: null,
      liabilities: null,
      cash: null,
      sharesOutstanding: null,
    },
    warning: error?.message ?? null,
  };
}

function emptyMarketOverview(symbol, title, error) {
  return {
    symbol,
    shortName: title ?? symbol,
    exchange: null,
    sector: null,
    industry: null,
    website: null,
    businessSummary: null,
    marketCap: null,
    trailingPe: null,
    forwardPe: null,
    dividendYield: null,
    beta: null,
    fiftyTwoWeekHigh: null,
    fiftyTwoWeekLow: null,
    totalRevenue: null,
    grossMargins: null,
    operatingMargins: null,
    profitMargins: null,
    freeCashflow: null,
    debtToEquity: null,
    returnOnEquity: null,
    currentRatio: null,
    analystRating: null,
    earningsStart: null,
    earningsEnd: null,
    institutionPercentHeld: null,
    insiderPercentHeld: null,
    floatShares: null,
    sharesShort: null,
    sharesShortPriorMonth: null,
    shortRatio: null,
    companyOfficers: [],
    topInstitutionalHolders: [],
    topFundHolders: [],
    insiderHolders: [],
    insiderTransactions: [],
    warning: error?.message ?? null,
  };
}

function emptyOptions(symbol, error) {
  return {
    symbol: symbol.toUpperCase(),
    expirations: [],
    quote: null,
    calls: [],
    puts: [],
    warning: error?.message ?? null,
  };
}

function emptyEarningsIntel(symbol) {
  return {
    symbol,
    shortName: symbol,
    earningsStart: null,
    earningsEnd: null,
    history: [],
    trend: [],
    earningsAverage: null,
    earningsLow: null,
    earningsHigh: null,
    revenueEstimate: null,
    recommendation: null,
    warning: null,
  };
}

function distanceFromAnchor(date, anchorDate) {
  const value = Date.parse(date);
  const anchor = Date.parse(anchorDate);
  if (!Number.isFinite(value) || !Number.isFinite(anchor)) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.abs(value - anchor);
}

function filingImportance(form) {
  if (["8-K", "10-Q", "10-K", "20-F"].includes(form)) {
    return "high";
  }
  return "medium";
}

function rankEvent(event) {
  const importanceScore = {
    critical: 100,
    high: 80,
    medium: 50,
    low: 20,
  }[event.importance] ?? 30;
  const timestamp = Date.parse(event.timestamp);
  if (!Number.isFinite(timestamp)) {
    return importanceScore;
  }
  const hoursDelta = Math.abs(Date.now() - timestamp) / (1000 * 60 * 60);
  const freshness = Math.max(0, 48 - hoursDelta);
  const futureBoost = timestamp >= Date.now() ? 18 : 0;
  return importanceScore + freshness + futureBoost;
}

function buildEarningsEvent(company) {
  const date = company?.market?.earningsStart ?? company?.market?.earningsEnd ?? null;
  if (!date || Number.isNaN(Date.parse(date))) {
    return null;
  }

  return {
    id: `earnings-${company.symbol}-${date}`,
    date,
    title: `${company.symbol} earnings window`,
    category: "earnings",
    importance: "high",
    source: "Yahoo Finance",
    note: company.market.shortName ?? company.sec.title ?? company.symbol,
    symbol: company.symbol,
  };
}
