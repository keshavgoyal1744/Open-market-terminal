import { config } from "./config.mjs";
import { getCuratedIntelligence, listSupportedIntelligenceSymbols } from "./intelligence-graph.mjs";
import { getMacroSnapshot } from "./providers/bls.mjs";
import { getMacroCalendar, getNasdaqEarningsCalendar } from "./providers/calendar.mjs";
import { getOrderBook, getTicker } from "./providers/coinbase.mjs";
import { getMajorIndexMemberships } from "./providers/indices.mjs";
import { getMarketNews } from "./providers/news.mjs";
import { getCompanySnapshot } from "./providers/sec.mjs";
import { getSp500Universe } from "./providers/sp500.mjs";
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

  async getCryptoTickers(products) {
    const cleanProducts = [...new Set(products.map((product) => product?.trim().toUpperCase()).filter(Boolean))];
    if (!cleanProducts.length) {
      return [];
    }

    const snapshots = await Promise.all(
      cleanProducts.map(async (productId) => {
        try {
          return await this.getCryptoTicker(productId);
        } catch (error) {
          return {
            productId,
            price: null,
            size: null,
            bid: null,
            ask: null,
            volume: null,
            time: null,
            changePercent24h: null,
            warning: error.message,
          };
        }
      }),
    );

    return snapshots.filter(Boolean);
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

  async getResearchRail(symbols) {
    const universe = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 18);
    const key = universe.join(",");

    return this.cache.getOrSet(
      `research-rail:${key}`,
      async () => {
        const quotes = await this.getQuotes(universe).catch(() => []);
        const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));

        const detailRows = await Promise.all(
          universe.map(async (symbol) => {
            const [overview, history] = await Promise.all([
              this.cache.getOrSet(
                `overview:${symbol}`,
                async () => {
                  try {
                    return await getCompanyOverview(symbol);
                  } catch {
                    return emptyMarketOverview(symbol, symbol, null);
                  }
                },
                { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 4 },
              ),
              this.getHistory(symbol, "1mo", "1d").catch(() => []),
            ]);

            const sparkline = history
              .map((point) => point.close)
              .filter(Number.isFinite)
              .slice(-16);

            const quote = quoteMap.get(symbol) ?? null;
            return {
              symbol,
              shortName: quote?.shortName ?? overview.shortName ?? symbol,
              price: quote?.price ?? null,
              changePercent: quote?.changePercent ?? null,
              change: quote?.change ?? null,
              sector: overview.sector ?? "Unclassified",
              industry: overview.industry ?? null,
              exchange: quote?.exchange ?? overview.exchange ?? null,
              type: quote?.type ?? null,
              sparkline,
            };
          }),
        );

        return {
          asOf: new Date().toISOString(),
          items: detailRows,
        };
      },
      { ttlMs: config.quoteTtlMs * 2, staleMs: config.quoteTtlMs * 6 },
    );
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
        const [company, curated] = await Promise.all([
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          Promise.resolve(getCuratedIntelligence(upper)),
        ]);

        const derived = buildDerivedRelationshipIntel(upper, company);
        const competitorUniverse = [...new Set([...(curated.peerSymbols ?? []), ...(curated.competitorSymbols ?? []), ...(derived.peerSymbols ?? [])])]
          .filter((entry) => entry && entry !== upper)
          .slice(0, 8);
        const competitorQuotes = competitorUniverse.length ? await this.getQuotes(competitorUniverse).catch(() => []) : [];
        const competitorMap = new Map(competitorQuotes.map((quote) => [quote.symbol, quote]));

        return {
          symbol: upper,
          companyName: company.market.shortName ?? company.sec.title ?? upper,
          summary: company.market.businessSummary ?? curated.headline,
          coverage: {
            curated: curated.curated,
            notes: [...(curated.coverageNotes ?? []), ...(derived.coverageNotes ?? []), ...(company.warnings ?? [])].slice(0, 8),
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
          executives: mergeExecutives([...(curated.executives ?? []), ...(derived.executives ?? [])], company.market.companyOfficers),
          supplyChain: {
            suppliers: mergeRelationshipLists(
              curated.supplyChain.filter((item) => item.relation.includes("supplier") || item.relation.includes("logistics")),
              derived.supplyChain.suppliers,
            ),
            customers: mergeRelationshipLists(curated.customers, derived.customers),
            ecosystem: mergeRelationshipLists(curated.ecosystemRelations, derived.ecosystemRelations),
          },
          corporate: {
            relations: mergeRelationshipLists(curated.corporateRelations, derived.corporateRelations),
            tree: mergeNamedLists(curated.corporate, derived.corporate),
          },
          customerConcentration: mergeNamedLists(curated.customerConcentration, derived.customerConcentration),
          geography: mergeGeography(curated.geography, derived.geography),
          ecosystems: mergeNamedLists(curated.ecosystems, derived.ecosystems),
          eventChains: mergeNamedLists(curated.eventChains, derived.eventChains),
          graph: mergeGraphs(curated.graph, derived.graph),
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

  async getDeskCalendar(symbols, options = {}) {
    const upperSymbols = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 16);
    const windowDays = clampWindowDays(options.windowDays);
    const key = `${windowDays}:${upperSymbols.join(",")}`;
    return this.cache.getOrSet(
      `calendar:${key}`,
      async () => {
        const [macroEvents, nasdaqEarnings, companies] = await Promise.all([
          getMacroCalendar().catch(() => []),
          getNasdaqEarningsCalendar(windowDays).catch(() => []),
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

        const fallbackEarnings = companies
          .filter(Boolean)
          .map((company) => buildEarningsEvent(company))
          .filter(Boolean);

        const earnings = nasdaqEarnings.length ? nasdaqEarnings : fallbackEarnings;

        const events = [...macroEvents, ...earnings]
          .filter((event) => withinWindow(event.date, windowDays))
          .sort((left, right) => new Date(left.date) - new Date(right.date))
          .slice(0, windowDays >= 90 ? 400 : 220);

        return {
          asOf: new Date().toISOString(),
          events,
          warnings: nasdaqEarnings.length ? [] : ["Nasdaq earnings calendar unavailable. Showing fallback issuer dates from public company modules."],
        };
      },
      { ttlMs: config.calendarTtlMs, staleMs: config.calendarTtlMs * 2 },
    );
  }

  async getDeskNews(symbols, focusSymbol, query = null) {
    const universe = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 8);
    const cleanQuery = String(query ?? "").trim().slice(0, 80);
    const key = `${focusSymbol ?? "desk"}:${cleanQuery || "all"}:${universe.join(",")}`;
    return this.cache.getOrSet(
      `news:${key}`,
      async () => ({
        asOf: new Date().toISOString(),
        items: await getMarketNews({ symbols: universe, focusSymbol, query: cleanQuery || null }),
      }),
      { ttlMs: config.newsTtlMs, staleMs: config.newsTtlMs * 2 },
    );
  }

  async getCompanyMap(symbol) {
    const upper = String(symbol ?? "").trim().toUpperCase();
    return this.cache.getOrSet(
      `company-map:${upper}`,
      async () => {
        const [[quote], company, intel, indexMemberships] = await Promise.all([
          this.getQuotes([upper]).catch(() => [null]),
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          this.getRelationshipIntel(upper).catch(() => emptyCompanyMapIntel(upper)),
          getMajorIndexMemberships(upper).catch(() => []),
        ]);

        const holders = dedupeHolders([
          ...(company.market.topInstitutionalHolders ?? []),
          ...(company.market.topFundHolders ?? []),
        ]).slice(0, 16);

        return {
          symbol: upper,
          companyName: company.market.shortName ?? company.sec.title ?? upper,
          quote: quote ?? null,
          market: {
            sector: company.market.sector ?? null,
            industry: company.market.industry ?? null,
            website: company.market.website ?? null,
            marketCap: company.market.marketCap ?? quote?.marketCap ?? null,
            analystRating: company.market.analystRating ?? null,
          },
          summary: intel.summary ?? company.market.businessSummary ?? null,
          coverage: {
            curated: Boolean(intel.coverage?.curated),
            notes: [...new Set([...(intel.coverage?.notes ?? []), ...(company.warnings ?? [])])].slice(0, 8),
          },
          indices: indexMemberships,
          suppliers: normalizeMapRelations(intel.supplyChain?.suppliers ?? []),
          customers: normalizeMapCustomers(intel),
          competitors: normalizeCompetitors(intel.competitors ?? []),
          holders,
          board: (company.market.companyOfficers ?? []).slice(0, 16),
          insiderHolders: (company.market.insiderHolders ?? []).slice(0, 12),
          insiderTransactions: (company.market.insiderTransactions ?? []).slice(0, 12),
          corporate: {
            tree: intel.corporate?.tree ?? [],
            relations: normalizeMapRelations(intel.corporate?.relations ?? []),
          },
          graph: intel.graph ?? { nodes: [], edges: [] },
          geography: intel.geography ?? { revenueMix: [], manufacturing: [], supplyRegions: [] },
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 2 },
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

  async getSp500Heatmap() {
    return this.cache.getOrSet(
      "heatmap:sp500",
      async () => {
        const universe = await getSp500Universe();
        const quoteMap = await this.getQuoteMap(universe.constituents.map((item) => item.symbol), 40);
        const populated = universe.constituents
          .map((item) => {
            const quote = quoteMap.get(item.symbol) ?? null;
            const sizeBasis = numeric(item.sourceWeight) ?? numeric(quote?.marketCap);
            return {
              symbol: item.symbol,
              name: item.name,
              sector: item.sector ?? quote?.sector ?? "Unclassified",
              price: quote?.price ?? null,
              change: quote?.change ?? null,
              changePercent: quote?.changePercent ?? null,
              marketCap: quote?.marketCap ?? null,
              dayHigh: quote?.dayHigh ?? null,
              dayLow: quote?.dayLow ?? null,
              volume: quote?.volume ?? null,
              sourceWeight: item.sourceWeight ?? null,
              sizeBasis,
            };
          })
          .filter((item) => Number.isFinite(item.sizeBasis) || Number.isFinite(item.marketCap) || Number.isFinite(item.price));

        const totalSize = sum(populated.map((item) => numeric(item.sizeBasis))) || 1;
        const tiles = populated
          .map((item) => {
            const weight = Number.isFinite(item.sizeBasis) ? (item.sizeBasis / totalSize) * 100 : null;
            return {
              ...item,
              weight,
              columnSpan: heatmapColumnSpan(weight),
              rowSpan: heatmapRowSpan(weight),
            };
          })
          .sort((left, right) => {
            const sectorCompare = String(left.sector).localeCompare(String(right.sector));
            if (sectorCompare !== 0) {
              return sectorCompare;
            }
            return (numeric(right.weight) ?? 0) - (numeric(left.weight) ?? 0);
          })
          .map((item, index) => ({ ...item, rank: index + 1 }));

        const sectors = [...groupBySector(tiles).entries()]
          .map(([sector, items]) => ({
            sector,
            count: items.length,
            averageMove: average(items.map((item) => item.changePercent)),
            weight: sum(items.map((item) => item.weight)),
          }))
          .sort((left, right) => (numeric(right.weight) ?? 0) - (numeric(left.weight) ?? 0));

        return {
          index: "S&P 500",
          asOf: new Date().toISOString(),
          source: universe.source,
          warnings: universe.warnings ?? [],
          coverage: {
            constituents: universe.constituents.length,
            quoted: tiles.filter((item) => Number.isFinite(item.price)).length,
            sectors: sectors.length,
          },
          sectors,
          leaders: [...tiles]
            .filter((item) => Number.isFinite(item.changePercent))
            .sort((left, right) => right.changePercent - left.changePercent)
            .slice(0, 8),
          laggards: [...tiles]
            .filter((item) => Number.isFinite(item.changePercent))
            .sort((left, right) => left.changePercent - right.changePercent)
            .slice(0, 8),
          tiles,
        };
      },
      { ttlMs: config.quoteTtlMs * 4, staleMs: config.quoteTtlMs * 12 },
    );
  }

  async getSectorBoard(sector) {
    const requested = String(sector ?? "").trim();
    const cacheKey = requested ? requested.toLowerCase() : "default";

    return this.cache.getOrSet(
      `sector-board:${cacheKey}`,
      async () => {
        const heatmap = await this.getSp500Heatmap();
        const availableSectors = heatmap.sectors ?? [];
        const matchedSector = resolveSectorName(requested, availableSectors) ?? availableSectors[0]?.sector ?? "Technology";
        const items = (heatmap.tiles ?? [])
          .filter((item) => normalizeSectorKey(item.sector) === normalizeSectorKey(matchedSector))
          .sort((left, right) => (numeric(right.weight) ?? 0) - (numeric(left.weight) ?? 0))
          .map((item, index) => ({ ...item, rank: index + 1 }));

        const leaders = [...items]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => right.changePercent - left.changePercent)
          .slice(0, 6);
        const laggards = [...items]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => left.changePercent - right.changePercent)
          .slice(0, 6);
        const topSymbols = items.slice(0, 10).map((item) => item.symbol);
        const news = topSymbols.length
          ? await this.getDeskNews(topSymbols, topSymbols[0] ?? null, matchedSector).catch(() => ({ items: [] }))
          : { items: [] };

        return {
          sector: matchedSector,
          asOf: heatmap.asOf,
          source: heatmap.source,
          warnings: heatmap.warnings ?? [],
          summary: {
            names: items.length,
            averageMove: average(items.map((item) => item.changePercent)),
            weight: sum(items.map((item) => item.weight)),
            aggregateVolume: sum(items.map((item) => item.volume)),
            aggregateCap: sum(items.map((item) => item.marketCap)),
          },
          leaders,
          laggards,
          items: items.slice(0, 48),
          news: (news.items ?? []).slice(0, 12),
        };
      },
      { ttlMs: config.quoteTtlMs * 3, staleMs: config.quoteTtlMs * 8 },
    );
  }

  async getWatchlistFlow(symbols) {
    const universe = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))].slice(0, 16);
    const key = universe.join(",");

    return this.cache.getOrSet(
      `flow:${key}`,
      async () => {
        const quotes = await this.getQuotes(universe).catch(() => []);
        const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));

        const rows = await Promise.all(
          universe.map(async (symbol) => {
            const quote = quoteMap.get(symbol) ?? null;
            const [company, options] = await Promise.all([
              this.getCompany(symbol).catch(() => null),
              this.getOptions(symbol).catch((error) => emptyOptions(symbol, error)),
            ]);

            const callVolume = sum((options.calls ?? []).map((contract) => numeric(contract.volume)));
            const putVolume = sum((options.puts ?? []).map((contract) => numeric(contract.volume)));
            const openInterest = sum(
              [...(options.calls ?? []), ...(options.puts ?? [])].map((contract) => numeric(contract.openInterest)),
            );

            return {
              symbol,
              shortName: quote?.shortName ?? company?.market?.shortName ?? symbol,
              sector: company?.market?.sector ?? "Unclassified",
              price: quote?.price ?? null,
              changePercent: quote?.changePercent ?? null,
              shareVolume: quote?.volume ?? null,
              averageShareVolume: quote?.averageVolume ?? null,
              relativeVolume:
                Number.isFinite(quote?.volume) && Number.isFinite(quote?.averageVolume) && quote.averageVolume > 0
                  ? quote.volume / quote.averageVolume
                  : null,
              callVolume,
              putVolume,
              optionsVolume: sum([callVolume, putVolume]),
              putCallRatio:
                Number.isFinite(callVolume) && callVolume > 0 && Number.isFinite(putVolume)
                  ? putVolume / callVolume
                  : null,
              openInterest,
              shortRatio: company?.market?.shortRatio ?? null,
              sharesShort: company?.market?.sharesShort ?? null,
              analystRating: company?.market?.analystRating ?? null,
              warnings: [...new Set([...(company?.warnings ?? []), options?.warning].filter(Boolean))].slice(0, 3),
            };
          }),
        );

        const ranked = [...rows].sort((left, right) => {
          const optionsCompare = (numeric(right.optionsVolume) ?? 0) - (numeric(left.optionsVolume) ?? 0);
          if (optionsCompare !== 0) {
            return optionsCompare;
          }
          return (numeric(right.relativeVolume) ?? 0) - (numeric(left.relativeVolume) ?? 0);
        });

        return {
          asOf: new Date().toISOString(),
          summary: {
            symbols: ranked.length,
            shareVolume: sum(ranked.map((row) => row.shareVolume)),
            optionsVolume: sum(ranked.map((row) => row.optionsVolume)),
            averagePutCall: average(ranked.map((row) => row.putCallRatio)),
            elevated: ranked.filter(
              (row) => (numeric(row.relativeVolume) ?? 0) >= 1.5 || (numeric(row.shortRatio) ?? 0) >= 3,
            ).length,
          },
          rows: ranked,
          warnings: ranked.flatMap((row) => row.warnings.map((warning) => `${row.symbol}: ${warning}`)).slice(0, 6),
        };
      },
      { ttlMs: config.quoteTtlMs * 2, staleMs: config.quoteTtlMs * 6 },
    );
  }

  async getHeatmapContext(symbol) {
    const upper = symbol.trim().toUpperCase();
    return this.cache.getOrSet(
      `heatmap-context:${upper}`,
      async () => {
        const [quotes, company, earnings, intel, news] = await Promise.all([
          this.getQuotes([upper]).catch(() => []),
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          this.getEarningsIntel(upper, []).catch(() => null),
          this.getRelationshipIntel(upper).catch(() => null),
          this.getDeskNews([upper], upper).catch(() => ({ items: [] })),
        ]);

        const quote = quotes[0] ?? null;
        const focusNews = (news.items ?? []).filter((item) => item.category === "focus").slice(0, 3);
        const macroNews = (news.items ?? []).filter((item) => item.category !== "focus").slice(0, 2);
        const filings = (company.sec?.filings ?? []).slice(0, 4);
        const catalysts = buildHeatmapCatalysts({
          symbol: upper,
          quote,
          company,
          earnings,
          intel,
          focusNews,
          macroNews,
          filings,
        });
        const references = buildHeatmapReferences({
          upper,
          company,
          focusNews,
          macroNews,
          filings,
        });

        return {
          symbol: upper,
          companyName: company.market.shortName ?? company.sec.title ?? upper,
          quote,
          company: {
            sector: company.market.sector,
            industry: company.market.industry,
            marketCap: company.market.marketCap ?? quote?.marketCap ?? null,
            website: company.market.website ?? null,
            analystRating: company.market.analystRating ?? null,
          },
          scenario: {
            headline: catalysts[0]?.title ?? `${upper} live context`,
            summary: summarizeHeatmapContext(upper, quote, focusNews, macroNews, earnings, filings),
            bullets: catalysts,
          },
          earnings: earnings
            ? {
                window: earnings.earningsWindow,
                recommendation: earnings.estimates?.recommendation ?? null,
                surpriseHistory: earnings.history?.slice(0, 4) ?? [],
              }
            : null,
          relationships: {
            suppliers: intel?.supplyChain?.suppliers?.slice(0, 3) ?? [],
            customers: intel?.customerConcentration?.slice(0, 3) ?? [],
            competitors: intel?.competitors?.slice(0, 4) ?? [],
            eventChains: intel?.eventChains?.slice(0, 2) ?? [],
          },
          references,
          warnings: [...new Set([...(company.warnings ?? []), ...(intel?.coverage?.notes ?? []).filter(Boolean)])].slice(0, 6),
        };
      },
      { ttlMs: config.newsTtlMs, staleMs: config.newsTtlMs * 3 },
    );
  }

  async getQuoteMap(symbols, chunkSize = 48) {
    const clean = [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))];
    const map = new Map();
    const batches = await Promise.all(
      chunkList(clean, chunkSize).map((chunk) => this.getQuotes(chunk).catch(() => [])),
    );
    for (const quotes of batches) {
      for (const quote of quotes) {
        map.set(quote.symbol, quote);
      }
    }
    return map;
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

function mergeRelationshipLists(primary = [], secondary = []) {
  const seen = new Set();
  return [...(primary ?? []), ...(secondary ?? [])].filter((item) => {
    const key = `${item?.target ?? ""}:${item?.relation ?? ""}:${item?.label ?? ""}`;
    if (!key.trim() || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function mergeNamedLists(primary = [], secondary = []) {
  const seen = new Set();
  return [...(primary ?? []), ...(secondary ?? [])].filter((item) => {
    const key = `${item?.name ?? item?.title ?? ""}:${item?.level ?? item?.type ?? item?.role ?? ""}`;
    if (!key.trim() || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function mergeGeography(primary = {}, secondary = {}) {
  return {
    revenueMix: mergeLabeledLists(primary?.revenueMix ?? [], secondary?.revenueMix ?? []),
    manufacturing: mergeLabeledLists(primary?.manufacturing ?? [], secondary?.manufacturing ?? []),
    supplyRegions: mergeLabeledLists(primary?.supplyRegions ?? [], secondary?.supplyRegions ?? []),
  };
}

function mergeLabeledLists(primary = [], secondary = []) {
  const seen = new Set();
  return [...(primary ?? []), ...(secondary ?? [])].filter((item) => {
    const key = `${item?.label ?? ""}:${item?.commentary ?? ""}`;
    if (!key.trim() || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function mergeGraphs(primary = { nodes: [], edges: [] }, secondary = { nodes: [], edges: [] }) {
  const nodes = new Map();
  for (const node of [...(primary?.nodes ?? []), ...(secondary?.nodes ?? [])]) {
    if (node?.id && !nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  }

  const edgeSeen = new Set();
  const edges = [...(primary?.edges ?? []), ...(secondary?.edges ?? [])].filter((edge) => {
    const key = `${edge?.source ?? ""}:${edge?.target ?? ""}:${edge?.relation ?? ""}:${edge?.domain ?? ""}`;
    if (!edge?.source || !edge?.target || edgeSeen.has(key)) {
      return false;
    }
    edgeSeen.add(key);
    return true;
  });

  return {
    nodes: [...nodes.values()],
    edges,
  };
}

function buildDerivedRelationshipIntel(symbol, company) {
  const market = company?.market ?? {};
  const issuerName = market.shortName ?? company?.sec?.title ?? symbol;
  const graphNodes = [{ id: symbol, label: issuerName, kind: "issuer", symbol }];
  const graphEdges = [];
  const coverageNotes = ["Fallback graph derived from public holders, officers, sector, industry, and positioning data."];
  const executives = [];
  const ecosystemRelations = [];
  const supplierRelations = [];
  const customerRelations = [];
  const corporate = [];
  const ecosystems = [];
  const eventChains = [];
  const customerConcentration = [];
  const geography = { revenueMix: [], manufacturing: [], supplyRegions: [] };
  const template = sectorTemplateForMarket(market);

  const addNode = (node) => {
    if (node?.id && !graphNodes.find((entry) => entry.id === node.id)) {
      graphNodes.push(node);
    }
  };

  const addEdge = (edge) => {
    const key = `${edge.source}:${edge.target}:${edge.relation}:${edge.domain}`;
    if (edge.source && edge.target && !graphEdges.find((entry) => `${entry.source}:${entry.target}:${entry.relation}:${entry.domain}` === key)) {
      graphEdges.push(edge);
    }
  };

  if (market.sector) {
    const sectorId = `sector:${market.sector}`;
    addNode({ id: sectorId, label: market.sector, kind: "ecosystem" });
    addEdge({
      source: symbol,
      target: sectorId,
      relation: "sector",
      domain: "ecosystem",
      label: market.industry ?? "public market classification",
      weight: 2,
    });
    ecosystemRelations.push({
      target: market.sector,
      relation: "sector map",
      label: market.industry ?? "public market classification",
      domain: "ecosystem",
      weight: 2,
    });
  }

  if (market.industry) {
    const industryId = `industry:${market.industry}`;
    addNode({ id: industryId, label: market.industry, kind: "ecosystem" });
    addEdge({
      source: symbol,
      target: industryId,
      relation: "industry",
      domain: "ecosystem",
      label: "industry peer cluster",
      weight: 2,
    });
    ecosystems.push({ name: market.industry, stages: [market.sector ?? "Sector", "Peer set", "Public market comp set"] });
  }

  if (template.coverageNote) {
    coverageNotes.push(template.coverageNote);
  }

  for (const item of [...template.suppliers, ...template.customers, ...template.ecosystem]) {
    const id = `template:${item.domain}:${templateKey(item.target)}`;
    addNode({ id, label: item.target, kind: templateNodeKind(item.domain), symbol: item.symbol ?? undefined });
    addEdge({
      source: symbol,
      target: id,
      relation: item.relation,
      domain: item.domain,
      label: item.label,
      weight: item.weight ?? 2,
    });
  }

  supplierRelations.push(...template.suppliers);
  customerRelations.push(...template.customers);
  ecosystemRelations.push(...template.ecosystem);
  customerConcentration.push(...template.customerConcentration);
  geography.revenueMix.push(...(template.geography?.revenueMix ?? []));
  geography.manufacturing.push(...(template.geography?.manufacturing ?? []));
  geography.supplyRegions.push(...(template.geography?.supplyRegions ?? []));
  ecosystems.push(...template.ecosystems);
  eventChains.push(...template.eventChains);

  for (const holder of [...(market.topInstitutionalHolders ?? []), ...(market.topFundHolders ?? [])].slice(0, 5)) {
    if (!holder?.holder) {
      continue;
    }
    const id = `holder:${holder.holder}`;
    addNode({ id, label: holder.holder, kind: "investment" });
    addEdge({
      source: symbol,
      target: id,
      relation: "holder",
      domain: "investment",
      label: holder.pctHeld != null ? `${roundTo(holder.pctHeld * 100, 2)}% public hold` : "public holder",
      weight: 3,
    });
  }

  for (const officer of (market.companyOfficers ?? []).slice(0, 4)) {
    if (!officer?.name) {
      continue;
    }
    const id = `officer:${officer.name}`;
    addNode({ id, label: officer.name, kind: "corporate" });
    addEdge({
      source: symbol,
      target: id,
      relation: officer.title ?? "executive",
      domain: "corporate",
      label: officer.totalPay != null ? `Pay ${Math.round(officer.totalPay).toLocaleString()}` : "public officer listing",
      weight: 2,
    });
    executives.push({
      name: officer.name,
      role: officer.title ?? "Executive",
      background: [officer.age != null ? `Age ${officer.age}` : null, officer.yearBorn != null ? `Born ${officer.yearBorn}` : null].filter(Boolean),
      compensation: officer.totalPay ?? null,
    });
    corporate.push({
      root: symbol,
      type: "officer",
      name: officer.name,
      description: officer.title ?? "Public officer listing",
    });
  }

  if (market.analystRating) {
    const ratingId = `rating:${market.analystRating}`;
    addNode({ id: ratingId, label: `Street ${market.analystRating}`, kind: "ecosystem" });
    addEdge({
      source: symbol,
      target: ratingId,
      relation: "analyst stance",
      domain: "ecosystem",
      label: "public recommendation snapshot",
      weight: 2,
    });
    eventChains.push({
      title: "Street stance shifts",
      steps: [
        `${symbol} recommendation changes`,
        "Public holders and active desks rebalance",
        "Peer sentiment and relative volume reprice",
      ],
    });
  }

  if (market.sharesShort != null || market.shortRatio != null) {
    const shortId = `short:${symbol}`;
    addNode({ id: shortId, label: "Short interest", kind: "competitor" });
    addEdge({
      source: symbol,
      target: shortId,
      relation: "positioning",
      domain: "competition",
      label: market.shortRatio != null ? `${roundTo(market.shortRatio, 2)} days to cover` : "public short-interest signal",
      weight: 2,
    });
    eventChains.push({
      title: "Positioning unwind",
      steps: [
        `${symbol} volume accelerates`,
        "Short positioning or de-risking becomes visible",
        "Nearby peer basket names can react with it",
      ],
    });
  }

  return {
    peerSymbols: template.peerSymbols,
    coverageNotes,
    executives,
    supplyChain: { suppliers: supplierRelations, customers: customerRelations, ecosystem: ecosystemRelations },
    customers: customerRelations,
    ecosystemRelations,
    corporateRelations: [],
    corporate,
    customerConcentration,
    geography,
    ecosystems,
    eventChains,
    graph: {
      nodes: graphNodes,
      edges: graphEdges,
    },
  };
}

function emptyCompanyMapIntel(symbol) {
  return {
    symbol,
    summary: null,
    coverage: { curated: false, notes: [] },
    supplyChain: { suppliers: [], customers: [], ecosystem: [] },
    customerConcentration: [],
    competitors: [],
    corporate: { tree: [], relations: [] },
    graph: { nodes: [{ id: symbol, label: symbol, kind: "issuer", symbol }], edges: [] },
    geography: { revenueMix: [], manufacturing: [], supplyRegions: [] },
  };
}

function normalizeMapRelations(items = []) {
  return items.map((item) => ({
    target: item.target ?? item.name ?? "n/a",
    relation: item.relation ?? item.level ?? "related",
    label: item.label ?? item.commentary ?? item.description ?? "",
    domain: item.domain ?? "ecosystem",
    symbol: item.symbol ?? inferTickerFromText(item.target ?? item.name ?? ""),
  }));
}

function normalizeMapCustomers(intel) {
  const concentrationRows = (intel.customerConcentration ?? []).map((item) => ({
    target: item.name ?? "Customer / end market",
    relation: item.level ?? "customer mix",
    label: item.commentary ?? item.description ?? "",
    domain: "customer",
    symbol: inferTickerFromText(item.name ?? ""),
  }));

  return dedupeRelations([
    ...concentrationRows,
    ...normalizeMapRelations(intel.supplyChain?.customers ?? []),
  ]);
}

function normalizeCompetitors(items = []) {
  return items.map((item) => ({
    symbol: item.symbol ?? inferTickerFromText(item.companyName ?? ""),
    companyName: item.companyName ?? item.symbol ?? "n/a",
    price: item.price ?? null,
    changePercent: item.changePercent ?? null,
  }));
}

function dedupeHolders(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.holder ?? "").trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function dedupeRelations(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${String(item?.target ?? "").trim().toLowerCase()}:${String(item?.relation ?? "").trim().toLowerCase()}`;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function inferTickerFromText(value) {
  const text = String(value ?? "").trim().toUpperCase();
  return /^[A-Z0-9.\-]{1,5}$/.test(text) ? text.replace(/\./g, "-") : null;
}

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function templateNodeKind(domain) {
  return {
    "supply-chain": "supplier",
    customer: "customer",
    ecosystem: "ecosystem",
  }[domain] ?? "ecosystem";
}

function templateKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function sectorTemplateForMarket(market) {
  const sector = String(market?.sector ?? "").toLowerCase();
  const industry = market?.industry ?? market?.sector ?? "public market cluster";

  const defaults = {
    peerSymbols: [],
    suppliers: [
      relation(`${industry} suppliers`, "supply cluster", "supply-chain", `${industry} input and vendor chain`, 2),
    ],
    customers: [
      relation(`${industry} customers`, "customer cluster", "customer", `${industry} end-market demand`, 2),
    ],
    ecosystem: [
      relation(industry, "industry map", "ecosystem", "public sector / industry classification", 2),
    ],
    customerConcentration: [
      concentration("End-market mix", "Varies", `${industry} demand sensitivity depends on the issuer's disclosed customer mix.`),
    ],
    geography: {
      revenueMix: weights([["North America", 3, "Common reporting base"], ["Europe", 2, "Diversified developed-market exposure"], ["Asia", 3, "Supply and demand linkage"]]),
      manufacturing: weights([["Global footprint", 3, "Issuer-specific production and service footprint varies"]]),
      supplyRegions: weights([["Global supply chain", 3, "Upstream exposure depends on disclosed vendors and manufacturing base"]]),
    },
    ecosystems: [
      ecosystem(industry, [market?.sector ?? "Sector", industry, "Customers / suppliers", "Public market peers"]),
    ],
    eventChains: [
      impact(`${industry} demand surprise`, [`${symbolFromSectorLabel(market?.sector)} end-market expectations move`, "Sector peers reprice", "Supplier and customer baskets adjust"]),
    ],
    coverageNote: `Sector-template relationships are generalized for ${industry} when no curated company map is available.`,
  };

  if (sector.includes("technology")) {
    return {
      ...defaults,
      peerSymbols: ["MSFT", "AAPL", "NVDA", "AMD", "AVGO"],
      suppliers: [
        relation("Semiconductor / hardware vendors", "supplier cluster", "supply-chain", "Chips, networking, and equipment inputs", 3),
        relation("Cloud / infrastructure vendors", "platform suppliers", "supply-chain", "Hosting, compute, and software dependencies", 2),
      ],
      customers: [
        relation("Enterprise IT buyers", "customer base", "customer", "Corporate software and infrastructure budgets", 3),
        relation("Consumers / devices", "end demand", "customer", "Consumer hardware, software, and platform demand", 2),
      ],
      ecosystem: [
        relation("AI / cloud ecosystem", "ecosystem node", "ecosystem", "Model, cloud, and developer-stack read-through", 3),
        relation(industry, "industry map", "ecosystem", "Public technology peer cluster", 2),
      ],
      customerConcentration: [
        concentration("Enterprise spend", "Moderate", "Enterprise budgets and hyperscaler capex often drive second-order moves."),
        concentration("Platform partners", "Moderate", "Large distributors, OEMs, or cloud partners can matter depending on the company model."),
      ],
      geography: {
        revenueMix: weights([["US", 4, "Core software and cloud demand"], ["Europe", 3, "Enterprise demand"], ["Asia", 4, "Hardware assembly and semiconductor chain"]]),
        manufacturing: weights([["Taiwan / Asia", 4, "Semiconductor and component dependence"], ["US / Europe", 2, "Software and design footprint"]]),
        supplyRegions: weights([["Taiwan", 4, "Foundry and advanced-node exposure"], ["North America", 3, "Cloud and software stack"], ["Europe / Japan", 2, "Equipment and materials"]]),
      },
      ecosystems: [
        ecosystem("Technology stack", ["Semis", "Cloud", "Enterprise demand", "Distribution channels"]),
      ],
      eventChains: [
        impact("Enterprise / AI demand accelerates", ["Budgets and backlog improve", "Peer technology names rerate", "Hardware and infrastructure suppliers react"]),
      ],
      coverageNote: `Technology fallback maps connect the issuer to hardware, software, cloud, and AI ecosystem layers when no curated map exists.`,
    };
  }

  if (sector.includes("health")) {
    return {
      ...defaults,
      peerSymbols: ["UNH", "LLY", "MRK", "ABBV", "CVS"],
      suppliers: [
        relation("Clinical / manufacturing vendors", "supplier cluster", "supply-chain", "Clinical, ingredient, and manufacturing support", 2),
        relation("Distribution / PBM channels", "distribution", "supply-chain", "Drug and care delivery channels", 2),
      ],
      customers: [
        relation("Patients / payers", "end demand", "customer", "Treatment volumes and reimbursement", 3),
        relation("Providers / hospitals", "care network", "customer", "Clinical channel demand", 2),
      ],
      ecosystem: [
        relation("Reimbursement / regulation", "policy node", "ecosystem", "Pricing, reimbursement, and regulation sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Payers / reimbursement", "High", "Public reimbursement and payer dynamics are often the core revenue sensitivity."),
      ],
      eventChains: [
        impact("Reimbursement or trial readout shifts", ["Care volumes or pricing outlook change", "Managed-care / pharma peers react", "Distribution and provider baskets reprice"]),
      ],
      coverageNote: `Healthcare fallback maps focus on payers, providers, reimbursement, and manufacturing channels.`,
    };
  }

  if (sector.includes("financial")) {
    return {
      ...defaults,
      peerSymbols: ["JPM", "BAC", "GS", "MS", "V"],
      suppliers: [
        relation("Funding markets", "liquidity source", "supply-chain", "Deposit and wholesale funding conditions", 3),
        relation("Core banking / market infrastructure", "platform dependency", "supply-chain", "Payments, exchanges, and clearing rails", 2),
      ],
      customers: [
        relation("Consumers / corporates", "client base", "customer", "Loan, card, and treasury-service demand", 3),
        relation("Institutional clients", "capital-markets demand", "customer", "Trading, underwriting, and advisory activity", 2),
      ],
      ecosystem: [
        relation("Rates / credit spreads", "macro node", "ecosystem", "Policy-rate and spread sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Loan / card demand", "Moderate", "Credit demand, funding costs, and asset quality often dominate the setup."),
      ],
      eventChains: [
        impact("Rates or credit backdrop shifts", ["Net-interest or fee outlook changes", "Bank / broker peers rerate", "Funding-sensitive baskets adjust"]),
      ],
      coverageNote: `Financial-sector fallback maps link issuers to funding markets, client demand, and rate sensitivity.`,
    };
  }

  if (sector.includes("energy")) {
    return {
      ...defaults,
      peerSymbols: ["XOM", "CVX", "SLB", "EOG", "VLO"],
      suppliers: [
        relation("Service / equipment vendors", "upstream services", "supply-chain", "Drilling, completion, and field-service exposure", 3),
        relation("Midstream / logistics", "transport and storage", "supply-chain", "Gathering, pipelines, and shipping", 2),
      ],
      customers: [
        relation("Refiners / industrial buyers", "commodity demand", "customer", "Hydrocarbon demand and realized-price sensitivity", 3),
        relation("Global end markets", "macro demand", "customer", "Oil, gas, and product consumption", 2),
      ],
      ecosystem: [
        relation("Oil / gas curves", "price node", "ecosystem", "Commodity-price and spread sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Commodity demand", "High", "Benchmark prices and global demand often matter more than named customer concentration."),
      ],
      eventChains: [
        impact("Commodity curve moves", ["Realized-price outlook changes", "Exploration / service peers react", "Refining and transport baskets move next"]),
      ],
      coverageNote: `Energy fallback maps connect issuers to service vendors, logistics layers, and commodity-price sensitivity.`,
    };
  }

  if (sector.includes("industrial")) {
    return {
      ...defaults,
      peerSymbols: ["GE", "CAT", "RTX", "BA", "UPS"],
      suppliers: [
        relation("Component / machinery suppliers", "supplier cluster", "supply-chain", "Industrial components, automation, and equipment inputs", 3),
        relation("Freight / logistics", "distribution", "supply-chain", "Freight throughput and delivery channels", 2),
      ],
      customers: [
        relation("Infrastructure / manufacturing buyers", "capital spend", "customer", "Capex and industrial-production demand", 3),
        relation("Aerospace / transport customers", "end market", "customer", "Transport and mobility demand", 2),
      ],
      ecosystem: [
        relation("PMI / capex cycle", "macro node", "ecosystem", "Industrial cycle and order-book sensitivity", 3),
      ],
      eventChains: [
        impact("Industrial orders accelerate", ["Backlogs improve", "Capital-goods peers rerate", "Component and freight names follow"]),
      ],
      coverageNote: `Industrial fallback maps emphasize suppliers, logistics, and capital-spending end markets.`,
    };
  }

  if (sector.includes("consumer")) {
    return {
      ...defaults,
      peerSymbols: ["AMZN", "WMT", "COST", "NKE", "HD"],
      suppliers: [
        relation("Consumer goods / sourcing vendors", "supplier base", "supply-chain", "Sourcing, merchandising, and import exposure", 2),
        relation("Logistics / retail channels", "distribution", "supply-chain", "Warehousing, shipping, and store/channel operations", 2),
      ],
      customers: [
        relation("Consumers", "end demand", "customer", "Discretionary and defensive spending trends", 3),
        relation("Retail / wholesale channels", "sell-through", "customer", "Shelf space and channel demand", 2),
      ],
      ecosystem: [
        relation("Consumer spending", "macro node", "ecosystem", "Disposable income and traffic sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Retail channels", "Moderate", "Large retail or digital channels can dominate public consumer-company setups."),
      ],
      eventChains: [
        impact("Consumer demand inflects", ["Sell-through or traffic changes", "Retail / brand peers move", "Logistics and sourcing names react"]),
      ],
      coverageNote: `Consumer fallback maps focus on retail channels, logistics, and discretionary-demand sensitivity.`,
    };
  }

  if (sector.includes("communication")) {
    return {
      ...defaults,
      peerSymbols: ["META", "GOOGL", "NFLX", "TMUS", "T"],
      suppliers: [
        relation("Content / ad-tech vendors", "supply cluster", "supply-chain", "Content, traffic-acquisition, and infrastructure inputs", 2),
      ],
      customers: [
        relation("Advertisers / subscribers", "revenue base", "customer", "Ad budgets and subscriber demand", 3),
      ],
      ecosystem: [
        relation("Ad spend / subscriber churn", "demand node", "ecosystem", "Media and telecom demand sensitivity", 3),
      ],
      eventChains: [
        impact("Ad or subscriber trends shift", ["Revenue mix changes", "Platform / media peers rerate", "Content and distribution names move"]),
      ],
      coverageNote: `Communication-services fallback maps focus on advertisers, subscribers, and platform distribution.`,
    };
  }

  return defaults;
}

function symbolFromSectorLabel(value) {
  const sector = String(value ?? "").toLowerCase();
  if (sector.includes("technology")) return "tech";
  if (sector.includes("financial")) return "bank";
  if (sector.includes("health")) return "healthcare";
  if (sector.includes("energy")) return "energy";
  if (sector.includes("industrial")) return "industrial";
  if (sector.includes("consumer")) return "consumer";
  return "sector";
}

function relation(target, relationLabel, domain, label, weight = 2, symbol = null) {
  return {
    target,
    relation: relationLabel,
    domain,
    label,
    weight,
    symbol,
  };
}

function concentration(name, level, description) {
  return {
    name,
    level,
    commentary: description,
  };
}

function ecosystem(name, stages) {
  return {
    name,
    stages,
  };
}

function impact(title, steps) {
  return {
    title,
    steps,
  };
}

function weights(entries) {
  return entries.map(([label, weight, commentary]) => ({
    label,
    weight,
    commentary,
  }));
}

function emptySecSnapshot(symbol, error) {
  return {
    ticker: symbol,
    cik: null,
    submissionsUrl: null,
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

function buildHeatmapCatalysts({ symbol, quote, company, earnings, intel, focusNews, macroNews, filings }) {
  const bullets = [];

  if (Number.isFinite(quote?.changePercent)) {
    bullets.push({
      kind: "price",
      title: `${symbol} is ${quote.changePercent >= 0 ? "up" : "down"} ${Math.abs(quote.changePercent).toFixed(2)}% today`,
      detail: `Last ${quote.price != null ? quote.price.toFixed(2) : "n/a"} with ${quote.volume != null ? `${Math.round(quote.volume).toLocaleString()} shares` : "live price context"}.`,
      source: "Market quote",
    });
  }

  if (focusNews[0]) {
    bullets.push({
      kind: "news",
      title: focusNews[0].title,
      detail: `${focusNews[0].source ?? "News"} · ${focusNews[0].publishedAt ?? ""}`.trim(),
      source: focusNews[0].source ?? "News",
    });
  }

  if (earnings?.earningsWindow?.start) {
    bullets.push({
      kind: "earnings",
      title: `${symbol} earnings window is ${formatShortDate(earnings.earningsWindow.start)}`,
      detail: earnings.estimates?.recommendation
        ? `Street view: ${earnings.estimates.recommendation}.`
        : "Next earnings window is on the tape.",
      source: "Yahoo Finance",
    });
  }

  if (filings[0]) {
    bullets.push({
      kind: "filing",
      title: `${symbol} filed ${filings[0].form ?? "a recent SEC form"}`,
      detail: `${filings[0].primaryDocument ?? "Recent disclosure"} · ${filings[0].filingDate ?? "recent"}`,
      source: "SEC",
    });
  }

  if (macroNews[0]) {
    bullets.push({
      kind: "macro",
      title: macroNews[0].title,
      detail: `${macroNews[0].source ?? "Macro news"} · broader market context`,
      source: macroNews[0].source ?? "News",
    });
  }

  const firstChain = intel?.eventChains?.[0];
  if (firstChain?.steps?.length) {
    bullets.push({
      kind: "chain",
      title: firstChain.title ?? `${symbol} mapped impact chain`,
      detail: firstChain.steps.slice(0, 3).join(" -> "),
      source: "Relationship console",
    });
  }

  const firstCustomer = intel?.customerConcentration?.[0];
  if (firstCustomer?.name) {
    bullets.push({
      kind: "customer",
      title: `${symbol} customer exposure: ${firstCustomer.name}`,
      detail: firstCustomer.commentary ?? firstCustomer.level ?? "Concentration signal",
      source: "Relationship console",
    });
  }

  if (company.market?.sector || company.market?.industry) {
    bullets.push({
      kind: "profile",
      title: `${company.market.sector ?? "Sector"} / ${company.market.industry ?? "Industry"}`,
      detail: company.market.analystRating ? `Analyst stance: ${company.market.analystRating}.` : "Public company profile.",
      source: "Company profile",
    });
  }

  return bullets.slice(0, 6);
}

function summarizeHeatmapContext(symbol, quote, focusNews, macroNews, earnings, filings) {
  const fragments = [];
  if (Number.isFinite(quote?.price) && Number.isFinite(quote?.changePercent)) {
    fragments.push(`${symbol} is trading at ${quote.price.toFixed(2)}, ${quote.changePercent >= 0 ? "up" : "down"} ${Math.abs(quote.changePercent).toFixed(2)}% on the session.`);
  }
  if (focusNews[0]?.title) {
    fragments.push(`The most recent company-specific headline is "${focusNews[0].title}".`);
  }
  if (earnings?.earningsWindow?.start) {
    fragments.push(`Its next earnings window starts ${formatShortDate(earnings.earningsWindow.start)}.`);
  }
  if (filings[0]?.form) {
    fragments.push(`The latest SEC filing on this tape is ${filings[0].form} from ${formatShortDate(filings[0].filingDate)}.`);
  }
  if (macroNews[0]?.title) {
    fragments.push(`Broader market context is being influenced by "${macroNews[0].title}".`);
  }
  return fragments.join(" ");
}

function buildHeatmapReferences({ upper, company, focusNews, macroNews, filings }) {
  const references = [];

  for (const item of [...focusNews, ...macroNews].slice(0, 5)) {
    if (!item.link) {
      continue;
    }
    references.push({
      kind: "news",
      label: item.title,
      source: item.source ?? "News",
      publishedAt: item.publishedAt ?? null,
      url: item.link,
    });
  }

  for (const filing of filings) {
    if (!filing.filingUrl && !filing.filingIndexUrl) {
      continue;
    }
    references.push({
      kind: "filing",
      label: `${upper} ${filing.form ?? "SEC filing"} · ${filing.primaryDocument ?? "document"}`,
      source: "SEC",
      publishedAt: filing.filingDate ?? null,
      url: filing.filingUrl ?? filing.filingIndexUrl,
    });
  }

  if (company.sec?.submissionsUrl) {
    references.push({
      kind: "sec",
      label: `${upper} SEC submissions feed`,
      source: "SEC",
      publishedAt: null,
      url: company.sec.submissionsUrl,
    });
  }

  if (company.market?.website) {
    references.push({
      kind: "company",
      label: `${upper} investor website`,
      source: "Company",
      publishedAt: null,
      url: company.market.website,
    });
  }

  const seen = new Set();
  return references.filter((reference) => {
    if (!reference.url || seen.has(reference.url)) {
      return false;
    }
    seen.add(reference.url);
    return true;
  }).slice(0, 8);
}

function chunkList(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function numeric(value) {
  return Number.isFinite(value) ? value : null;
}

function sum(values) {
  const valid = values.filter(Number.isFinite);
  if (!valid.length) {
    return null;
  }
  return valid.reduce((total, value) => total + value, 0);
}

function average(values) {
  const total = sum(values);
  const count = values.filter(Number.isFinite).length;
  return count ? total / count : null;
}

function groupBySector(items) {
  return items.reduce((map, item) => {
    const key = item.sector ?? "Unclassified";
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
    return map;
  }, new Map());
}

function clampWindowDays(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 30;
  }
  return Math.min(Math.max(Math.round(numericValue), 7), 90);
}

function withinWindow(value, windowDays = 30) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  const now = Date.now();
  const earliest = now - 1000 * 60 * 60 * 24 * 2;
  const latest = now + clampWindowDays(windowDays) * 1000 * 60 * 60 * 24;
  return timestamp >= earliest && timestamp <= latest;
}

function normalizeSectorKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveSectorName(input, sectors) {
  const normalized = normalizeSectorKey(input);
  if (!normalized) {
    return null;
  }
  return sectors.find((sector) => normalizeSectorKey(sector.sector) === normalized)?.sector ?? null;
}

function heatmapColumnSpan(weight) {
  if (!Number.isFinite(weight)) {
    return 1;
  }
  if (weight >= 6) {
    return 3;
  }
  if (weight >= 3) {
    return 2;
  }
  if (weight >= 1) {
    return 2;
  }
  return 1;
}

function heatmapRowSpan(weight) {
  if (!Number.isFinite(weight)) {
    return 1;
  }
  if (weight >= 6) {
    return 2;
  }
  if (weight >= 2) {
    return 2;
  }
  return 1;
}

function formatShortDate(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "n/a";
  }
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
