import { config } from "./config.mjs";
import { getCuratedIntelligence, listSupportedIntelligenceSymbols } from "./intelligence-graph.mjs";
import { getMacroSnapshot } from "./providers/bls.mjs";
import { generateHostedIdeas, hostedAiProviderStatus } from "./providers/ai.mjs";
import { getMacroCalendar, getNasdaqEarningsCalendar } from "./providers/calendar.mjs";
import { getOrderBook, getTicker } from "./providers/coinbase.mjs";
import { getMajorIndexMemberships, getPublicCompanyAliasDirectory, normalizeAliasKey } from "./providers/indices.mjs";
import { getMarketNews } from "./providers/news.mjs";
import { getCompanySnapshot } from "./providers/sec.mjs";
import { getSp500Universe } from "./providers/sp500.mjs";
import { getYieldCurve } from "./providers/treasury.mjs";
import { getCompanyOverview, getEarningsDetails, getHistory, getOptions, getQuotes } from "./providers/yahoo.mjs";

export class MarketDataService {
  constructor(cache, storage = null) {
    this.cache = cache;
    this.storage = storage;
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
        const [secResult, marketResult, quoteResult] = await Promise.allSettled([
          getCompanySnapshot(upper),
          getCompanyOverview(upper),
          this.getQuotes([upper]).then((quotes) => quotes[0] ?? null),
        ]);
        const warnings = [];
        const sec = secResult.status === "fulfilled" ? secResult.value : emptySecSnapshot(upper, secResult.reason);
        const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null;
        const marketBase =
          marketResult.status === "fulfilled"
            ? marketResult.value
            : emptyMarketOverview(upper, sec.title, marketResult.reason);
        const listingMeta = await this.getPublicListingMetadata(upper).catch(() => null);
        const derivedSharesOutstanding = numeric(sec.facts?.sharesOutstanding?.value);
        const derivedMarketCap =
          numeric(marketBase.marketCap)
          ?? numeric(quote?.marketCap)
          ?? (
            Number.isFinite(numeric(quote?.price)) && Number.isFinite(derivedSharesOutstanding)
              ? numeric(quote.price) * derivedSharesOutstanding
              : null
          );
        const market = {
          ...marketBase,
          shortName: marketBase.shortName ?? quote?.shortName ?? listingMeta?.name ?? sec.title ?? upper,
          type: marketBase.type ?? quote?.type ?? null,
          exchange: marketBase.exchange ?? quote?.exchange ?? null,
          sector: marketBase.sector ?? listingMeta?.sector ?? null,
          industry: marketBase.industry ?? listingMeta?.industry ?? listingMeta?.sector ?? null,
          marketCap: derivedMarketCap,
          trailingPe: marketBase.trailingPe ?? quote?.trailingPe ?? null,
          fiftyTwoWeekHigh: marketBase.fiftyTwoWeekHigh ?? quote?.yearHigh ?? null,
          fiftyTwoWeekLow: marketBase.fiftyTwoWeekLow ?? quote?.yearLow ?? null,
        };

        if (secResult.status === "rejected" && !shouldSuppressSecWarning(upper, market)) {
          warnings.push(`SEC data unavailable for ${upper}: ${secResult.reason?.message ?? "source error"}`);
        }
        if (marketResult.status === "rejected") {
          warnings.push(`Market profile unavailable for ${upper}: ${marketResult.reason?.message ?? "source error"}`);
        }
        if (quoteResult.status === "rejected") {
          warnings.push(`Quote fallback unavailable for ${upper}: ${quoteResult.reason?.message ?? "source error"}`);
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

  async getPublicListingMetadata(symbol) {
    const upper = String(symbol ?? "").trim().toUpperCase();
    if (!upper) {
      return null;
    }

    return this.cache.getOrSet(
      `listing-meta:${upper}`,
      async () => {
        const sp500 = await getSp500Universe().catch(() => null);
        const constituent = (sp500?.constituents ?? []).find((item) => item.symbol === upper);
        if (!constituent) {
          return null;
        }
        return {
          symbol: upper,
          name: constituent.name ?? upper,
          sector: constituent.sector ?? null,
          industry: constituent.sector ?? null,
          source: sp500?.source?.label ?? "S&P 500 public universe",
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 6 },
    );
  }

  async getPublicAliasDirectory() {
    return this.cache.getOrSet(
      "public-alias-directory",
      () => getPublicCompanyAliasDirectory(),
      { ttlMs: config.companyTtlMs * 6, staleMs: config.companyTtlMs * 24 },
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
        const aliasDirectory = toAliasLookup(await this.getPublicAliasDirectory().catch(() => []));
        const [company, curated] = await Promise.all([
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          Promise.resolve(getCuratedIntelligence(upper)),
        ]);

        const publicPeerUniverse = await this.getPublicPeerUniverse(upper, company).catch(() => []);
        const derived = buildDerivedRelationshipIntel(upper, company, aliasDirectory);
        const competitorUniverse = [...new Set([...(curated.peerSymbols ?? []), ...(curated.competitorSymbols ?? []), ...(derived.peerSymbols ?? []), ...publicPeerUniverse])]
          .filter((entry) => entry && entry !== upper)
          .slice(0, 12);
        const competitorQuotes = competitorUniverse.length ? await this.getQuotes(competitorUniverse).catch(() => []) : [];
        const competitorMap = new Map(competitorQuotes.map((quote) => [quote.symbol, quote]));
        const peerOverlay = buildPublicPeerOverlay(upper, company, competitorUniverse, competitorMap);

        return {
          symbol: upper,
          companyName: company.market.shortName ?? company.sec.title ?? upper,
          summary: company.market.businessSummary ?? curated.headline,
          coverage: {
            curated: curated.curated,
            notes: [...(curated.coverageNotes ?? []), ...(derived.coverageNotes ?? []), ...(peerOverlay.coverageNotes ?? []), ...(company.warnings ?? [])].slice(0, 10),
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
            ecosystem: mergeRelationshipLists(curated.ecosystemRelations, [...derived.ecosystemRelations, ...(peerOverlay.relations ?? [])]),
          },
          corporate: {
            relations: mergeRelationshipLists(curated.corporateRelations, derived.corporateRelations),
            tree: mergeNamedLists(curated.corporate, derived.corporate),
          },
          customerConcentration: mergeNamedLists(curated.customerConcentration, derived.customerConcentration),
          geography: mergeGeography(curated.geography, derived.geography),
          ecosystems: mergeNamedLists(curated.ecosystems, derived.ecosystems),
          eventChains: mergeNamedLists(curated.eventChains, [...derived.eventChains, ...(peerOverlay.eventChains ?? [])]),
          graph: mergeGraphs(mergeGraphs(curated.graph, derived.graph), peerOverlay.graph),
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

  async getPublicPeerUniverse(symbol, company, limit = 12) {
    const upper = String(symbol ?? "").trim().toUpperCase();
    const sectorKey = comparisonKey(company?.market?.sector);
    if (!upper || !sectorKey) {
      return [];
    }

    return this.cache.getOrSet(
      `public-peers:${upper}:${sectorKey}`,
      async () => {
        const universe = await getSp500Universe();
        const sameSector = (universe.constituents ?? [])
          .filter((item) => item.symbol && item.symbol !== upper && comparisonKey(item.sector) === sectorKey)
          .sort((left, right) => numeric(right.sourceWeight) - numeric(left.sourceWeight))
          .slice(0, limit);
        return sameSector.map((item) => item.symbol);
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
        const [[quote], company, intel, indexMemberships, aliasDirectoryEntries] = await Promise.all([
          this.getQuotes([upper]).catch(() => [null]),
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          this.getRelationshipIntel(upper).catch(() => emptyCompanyMapIntel(upper)),
          getMajorIndexMemberships(upper).catch(() => []),
          this.getPublicAliasDirectory().catch(() => []),
        ]);
        const aliasDirectory = toAliasLookup(aliasDirectoryEntries);

        const holders = dedupeHolders([
          ...(company.market.topInstitutionalHolders ?? []),
          ...(company.market.topFundHolders ?? []),
        ]);
        const ownershipFallbacks = [
          company.market.institutionPercentHeld != null
            ? {
                holder: "Institutions (aggregate)",
                shares: null,
                pctHeld: company.market.institutionPercentHeld,
                note: "aggregate institutional ownership",
              }
            : null,
          company.market.insiderPercentHeld != null
            ? {
                holder: "Insiders (aggregate)",
                shares: null,
                pctHeld: company.market.insiderPercentHeld,
                note: "aggregate insider ownership",
              }
            : null,
          company.market.floatShares != null
            ? {
                holder: "Public float",
                shares: company.market.floatShares,
                pctHeld: null,
                note: "estimated freely traded shares",
              }
            : null,
          company.market.sharesShort != null
            ? {
                holder: "Reported short interest",
                shares: company.market.sharesShort,
                pctHeld: null,
                note: company.market.shortRatio != null
                  ? `${roundTo(company.market.shortRatio, 2)} days to cover`
                  : "public short-interest signal",
              }
            : null,
        ].filter(Boolean);
        const resolvedHolders = dedupeHolders([...holders, ...ownershipFallbacks]);
        const resolvedInsiderHolders = (
          company.market.insiderHolders?.length
            ? company.market.insiderHolders
            : company.market.insiderPercentHeld != null
              ? [
                  {
                    name: "Reported insiders",
                    relation: "Aggregate insider ownership",
                    positionDirect: null,
                    transactionDescription: `${roundTo(company.market.insiderPercentHeld * 100, 2)}% held by insiders`,
                  },
                ]
              : []
        );
        const acquisitionsTimeline = buildAcquisitionTimeline(intel, company.sec?.filings ?? []);
        const indexTimeline = buildIndexTimeline(indexMemberships);
        const ownershipTrend = buildOwnershipTrend(company.market, resolvedHolders, company.market.insiderTransactions ?? []);
        const boardInterlocks = buildBoardInterlocks(upper, intel.executives ?? [], company.market.companyOfficers ?? [], aliasDirectory);
        const graphWithIndices = mergeGraphs(
          intel.graph ?? { nodes: [], edges: [] },
          buildIndexMembershipGraph(upper, indexMemberships),
        );

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
          suppliers: normalizeMapRelations(intel.supplyChain?.suppliers ?? [], aliasDirectory),
          customers: normalizeMapCustomers(intel, aliasDirectory),
          competitors: normalizeCompetitors(intel.competitors ?? [], aliasDirectory),
          holders: resolvedHolders,
          board: (
            company.market.companyOfficers?.length
              ? company.market.companyOfficers
              : (intel.executives ?? []).map((item) => ({
                  name: item.name ?? null,
                  title: item.role ?? null,
                  age: null,
                  yearBorn: null,
                  totalPay: item.compensation ?? null,
                }))
          ),
          insiderHolders: resolvedInsiderHolders,
          insiderTransactions: company.market.insiderTransactions ?? [],
          boardInterlocks,
          acquisitionsTimeline,
          indexTimeline,
          ownershipTrend,
          corporate: {
            tree: intel.corporate?.tree ?? [],
            relations: normalizeMapRelations(intel.corporate?.relations ?? [], aliasDirectory),
          },
          graph: graphWithIndices,
          geography: intel.geography ?? { revenueMix: [], manufacturing: [], supplyRegions: [] },
        };
      },
      { ttlMs: config.companyTtlMs, staleMs: config.companyTtlMs * 2 },
    );
  }

  async getQuoteMonitor(symbol, options = {}) {
    const upper = String(symbol ?? "").trim().toUpperCase();
    const range = String(options.range ?? "1d").trim() || "1d";
    const interval = String(options.interval ?? inferMonitorInterval(range)).trim() || inferMonitorInterval(range);
    const peerUniverse = [...new Set((options.peerSymbols ?? []).map((entry) => String(entry ?? "").trim().toUpperCase()).filter(Boolean))]
      .filter((entry) => entry !== upper)
      .slice(0, 10);

    return this.cache.getOrSet(
      `quote-monitor:${upper}:${range}:${interval}:${peerUniverse.join(",")}`,
      async () => {
        const [company, companyMap] = await Promise.all([
          this.getCompany(upper).catch((error) => ({
            symbol: upper,
            sec: emptySecSnapshot(upper, error),
            market: emptyMarketOverview(upper, upper, error),
            warnings: [error.message],
          })),
          this.getCompanyMap(upper).catch(() => null),
        ]);
        const focusedQuery = [companyMap?.companyName, company.market.shortName, company.sec.title]
          .map((value) => String(value ?? "").trim())
          .find((value) => value && value.toUpperCase() !== upper) ?? upper;
        const [history, optionsPayload, news, earnings] = await Promise.all([
          this.getHistory(upper, range, interval).catch(() => []),
          this.getOptions(upper).catch((error) => emptyOptions(upper, error)),
          this.getDeskNews([upper], upper, focusedQuery).catch(() => ({ items: [] })),
          this.getEarningsIntel(upper, peerUniverse).catch(() => null),
        ]);

        const quote = companyMap?.quote ?? (await this.getQuotes([upper]).catch(() => [null]))[0] ?? null;
        const filings = company.sec?.filings?.slice(0, 8) ?? [];
        const peers = (companyMap?.competitors ?? []).slice(0, 8);
        const holders = (companyMap?.holders ?? []).slice(0, 10);
        const timeline = [
          ...filings.slice(0, 6).map((filing) => ({
            id: `quote-filing-${upper}-${filing.accessionNumber ?? filing.filingDate ?? filing.form}`,
            kind: "filing",
            category: "filing",
            timestamp: filing.filingDate ?? null,
            title: `${upper} filed ${filing.form ?? "SEC filing"}`,
            source: "SEC",
            note: filing.primaryDocument ?? "Recent issuer filing",
            link: filing.filingUrl ?? filing.filingIndexUrl ?? null,
          })),
          ...(earnings?.earningsWindow?.start
            ? [{
                id: `quote-earnings-${upper}`,
                kind: "earnings",
                category: "earnings",
                timestamp: earnings.earningsWindow.start,
                title: `${upper} earnings window`,
                source: "Yahoo Finance",
                note: earnings.companyName ?? upper,
                link: null,
              }]
            : []),
          ...((companyMap?.acquisitionsTimeline ?? []).slice(0, 4).map((item, index) => ({
            id: `quote-corporate-${upper}-${index}`,
            kind: item.kind ?? "corporate",
            category: "corporate",
            timestamp: item.date ?? null,
            title: item.title ?? "Corporate event",
            source: item.source ?? "Relationship console",
            note: item.note ?? "Issuer corporate context",
            link: item.url ?? null,
          }))),
          ...((companyMap?.corporate?.tree ?? []).slice(0, 3).map((item, index) => ({
            id: `quote-tree-${upper}-${index}`,
            kind: item.type ?? "corporate",
            category: "corporate",
            timestamp: item.date ?? null,
            title: item.name ?? item.target ?? "Corporate link",
            source: "Relationship console",
            note: item.description ?? "Corporate relationship",
            link: null,
          }))),
          ...((companyMap?.graph?.nodes ?? [])
            .filter((node) => node?.kind === "issuer")
            .slice(0, 1)
            .flatMap(() => (companyMap?.ownershipTrend ?? []).slice(-2).map((item, index) => ({
              id: `quote-ownership-${upper}-${index}`,
              kind: "ownership",
              category: "ownership",
              timestamp: item.date ?? null,
              title: `${upper} ownership snapshot`,
              source: "Public ownership",
              note: item.note ?? "Institutional / insider reporting",
              link: null,
            })))),
          ...(news.items ?? []).slice(0, 6).map((item) => ({
            id: `quote-news-${item.id}`,
            kind: "news",
            category: item.category ?? "focus",
            timestamp: item.publishedAt,
            title: item.title,
            source: item.source,
            note: "Symbol-focused public headline",
            link: item.link ?? null,
          })),
        ]
          .filter((item) => Number.isFinite(Date.parse(item.timestamp)))
          .sort((left, right) => compareDatesDescending(left.timestamp, right.timestamp))
          .slice(0, 12);

        return {
          symbol: upper,
          companyName: companyMap?.companyName ?? company.market.shortName ?? company.sec.title ?? upper,
          summary: companyMap?.summary ?? company.market.businessSummary ?? null,
          quote,
          market: company.market,
          warnings: [...new Set([...(company.warnings ?? []), companyMap ? null : "Company map unavailable from current public sources."])].filter(Boolean),
          history: {
            range,
            interval,
            points: history,
          },
          options: optionsPayload,
          filings,
          peers,
          holders,
          board: (companyMap?.board ?? []).slice(0, 8),
          news: (news.items ?? []).slice(0, 10),
          timeline,
        };
      },
      { ttlMs: config.quoteTtlMs * 2, staleMs: config.quoteTtlMs * 6 },
    );
  }

  async getMarketBoards(symbols = []) {
    const watchlist = [...new Set((symbols ?? []).map((symbol) => String(symbol ?? "").trim().toUpperCase()).filter(Boolean))].slice(0, 20);
    return this.cache.getOrSet(
      `market-boards:${watchlist.join(",") || "default"}`,
      async () => {
        const [heatmap, watchlistQuotes, flow, macro, yieldCurve, etfQuotes] = await Promise.all([
          this.getSp500Heatmap().catch(() => ({ tiles: [], sectors: [], asOf: new Date().toISOString(), warnings: [] })),
          this.getQuotes(watchlist).catch(() => []),
          this.getWatchlistFlow(watchlist).catch(() => ({ rows: [], summary: {} })),
          this.getMacro().catch(() => ({ cards: [], highlights: [] })),
          this.getYieldCurve().catch(() => ({ points: [] })),
          this.getQuotes(["SPY", "QQQ", "DIA", "IWM", "TLT", "GLD", "USO", "XLE", "XLF", "XLK", "XLI", "XLV", "XLP", "XLY"]).catch(() => []),
        ]);

        const watchMap = new Map(watchlistQuotes.map((quote) => [quote.symbol, quote]));
        const universe = dedupeBySymbol([
          ...(heatmap.tiles ?? []).slice(0, 220),
          ...watchlistQuotes,
        ]);
        const flowMap = new Map((flow.rows ?? []).map((row) => [row.symbol, row]));

        const leaders = [...universe]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => right.changePercent - left.changePercent)
          .slice(0, 12);
        const laggards = [...universe]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => left.changePercent - right.changePercent)
          .slice(0, 12);
        const mostActive = [...universe]
          .filter((item) => Number.isFinite(item.volume))
          .sort((left, right) => numeric(right.volume) - numeric(left.volume))
          .slice(0, 12)
          .map((item) => ({ ...item, dollarVolume: numeric(item.price) * numeric(item.volume) }));
        const unusualVolume = [...(flow.rows ?? [])]
          .sort((left, right) => numeric(right.relativeVolume) - numeric(left.relativeVolume))
          .slice(0, 12)
          .map((row) => ({ ...row, quote: watchMap.get(row.symbol) ?? null }));
        const gapUp = [...universe]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => right.changePercent - left.changePercent)
          .slice(0, 10)
          .map((item) => ({ ...item, gapProxyPercent: item.changePercent }));
        const gapDown = [...universe]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => left.changePercent - right.changePercent)
          .slice(0, 10)
          .map((item) => ({ ...item, gapProxyPercent: item.changePercent }));
        const sectorPerformance = [...(heatmap.sectors ?? [])]
          .sort((left, right) => numeric(right.weight) - numeric(left.weight))
          .slice(0, 12);
        const etfFlows = etfQuotes
          .map((quote) => ({
            ...quote,
            tapeFlow: numeric(quote.price) * numeric(quote.volume),
          }))
          .sort((left, right) => numeric(right.tapeFlow) - numeric(left.tapeFlow))
          .slice(0, 12);

        return {
          asOf: new Date().toISOString(),
          warnings: [
            flow.rows?.some((row) => row.warning) ? "Options-flow fields are limited by the current free upstream source." : null,
            "ETF flows are public tape-flow proxies, not fund-creation/redemption data.",
            "Gap boards use public session gap proxies from quote feeds.",
          ].filter(Boolean),
          summary: {
            trackedSymbols: watchlist.length,
            leader: leaders[0]?.symbol ?? null,
            active: mostActive[0]?.symbol ?? null,
            unusual: unusualVolume[0]?.symbol ?? null,
          },
          leaders,
          laggards,
          mostActive,
          unusualVolume,
          gapUp,
          gapDown,
          sectorPerformance,
          etfFlows,
          macro: summarizeMacroDashboard(macro, yieldCurve),
        };
      },
      { ttlMs: config.quoteTtlMs * 3, staleMs: config.quoteTtlMs * 8 },
    );
  }

  async getAiIdeas(options = {}) {
    const universe = normalizeAiUniverse(options.universe);
    const horizon = normalizeAiHorizon(options.horizon);
    const bullishCount = clampAiIdeaCount(options.bullishCount, 20);
    const bearishCount = clampAiIdeaCount(options.bearishCount, 20);
    const providerStatus = hostedAiProviderStatus();
    const snapshotDate = options.snapshotDate ?? getVisibleAiSnapshotDate();
    const snapshotKey = buildAiSnapshotKey({ universe, horizon, bullishCount, bearishCount, snapshotDate });

    if (!options.force && this.storage) {
      const stored = await this.storage.getAiSnapshot(snapshotKey);
      if (stored) {
        return stored;
      }
    }

    return this.cache.getOrSet(
      `ai-ideas:${snapshotKey}`,
      async () => {
        const [heatmap, pulse, macro, yieldCurve] = await Promise.all([
          this.getSp500Heatmap(),
          this.getMarketPulse().catch(() => ({ cards: [], leaders: [], laggards: [] })),
          this.getMacro().catch(() => ({ cards: [], highlights: [] })),
          this.getYieldCurve().catch(() => ({ asOf: null, points: [] })),
        ]);

        const candidateUniverse = buildAiCandidateUniverse(heatmap);
        const bullishSeeds = selectAiCandidates(candidateUniverse, "bullishScore", bullishCount);
        const bearishSeeds = selectAiCandidates(candidateUniverse, "bearishScore", bearishCount);
        const selectedSymbols = [...new Set([...bullishSeeds, ...bearishSeeds].map((item) => item.symbol))];
        const tileMap = new Map((heatmap.tiles ?? []).map((item) => [item.symbol, item]));
        const sectorPeerMap = buildSectorPeerMap(heatmap.tiles ?? []);

        const candidateDetails = await Promise.all(
          selectedSymbols.map(async (symbol) => {
            const tile = tileMap.get(symbol);
            const sectorPeers = (sectorPeerMap.get(normalizeSectorKey(tile?.sector)) ?? [])
              .filter((peer) => peer !== symbol)
              .slice(0, 6);

            const [company, earnings, history] = await Promise.all([
              this.getCompany(symbol).catch((error) => ({
                symbol,
                sec: emptySecSnapshot(symbol, error),
                market: emptyMarketOverview(symbol, symbol, error),
                warnings: [error.message],
              })),
              this.getEarningsIntel(symbol, sectorPeers).catch(() => emptyEarningsIntel(symbol)),
              this.getHistory(symbol, "1mo", "1d").catch(() => []),
            ]);

            return buildAiIdeaEvidence({
              symbol,
              tile,
              company,
              earnings,
              history,
              sectorSummary: (heatmap.sectors ?? []).find((entry) => normalizeSectorKey(entry.sector) === normalizeSectorKey(tile?.sector)),
            });
          }),
        );

        const detailMap = new Map(candidateDetails.map((item) => [item.symbol, item]));
        const bullishCandidates = bullishSeeds.map((item) => detailMap.get(item.symbol)).filter(Boolean);
        const bearishCandidates = bearishSeeds.map((item) => detailMap.get(item.symbol)).filter(Boolean);
        const context = buildAiMarketContext({ heatmap, pulse, macro, yieldCurve, horizon });

        let hostedResult = null;
        const warnings = [];
        if (providerStatus.gemini || providerStatus.groq) {
          try {
            hostedResult = await generateHostedIdeas({
              prompt: buildAiPrompt({
                horizon,
                context,
                bullishCandidates,
                bearishCandidates,
                bullishCount,
                bearishCount,
              }),
              primaryProvider: providerStatus.primary,
              fallbackProvider: providerStatus.fallback,
            });
          } catch (error) {
            warnings.push(`Hosted AI unavailable: ${error.message}`);
          }
        } else {
          warnings.push("Hosted AI keys not configured. Showing deterministic ranked output.");
        }

        const normalized = hostedResult?.parsed
          ? normalizeAiIdeasOutput(
              hostedResult.parsed,
              { bullishCandidates, bearishCandidates, context },
              { bullishCount, bearishCount },
            )
          : buildDeterministicAiIdeas(
              { bullishCandidates, bearishCandidates, context },
              { bullishCount, bearishCount },
              warnings[0] ?? "Hosted AI unavailable.",
            );

        const payload = {
          asOf: new Date().toISOString(),
          snapshot: {
            date: snapshotDate,
            timeLabel: getAiSnapshotScheduleLabel(),
            timezone: config.aiDailyTimezone,
            mode: "shared-daily",
          },
          universe: universe === "sp500" ? "S&P 500" : universe.toUpperCase(),
          horizon: horizon === "1-4w" ? "1-4 weeks" : horizon,
          provider: {
            primary: providerStatus.primary ?? null,
            fallback: providerStatus.fallback ?? null,
            used: hostedResult?.provider ?? "rules",
            model: hostedResult?.model ?? null,
            hostedAvailable: providerStatus.gemini || providerStatus.groq,
          },
          coverage: {
            constituents: heatmap.coverage?.constituents ?? 0,
            quoted: heatmap.coverage?.quoted ?? 0,
            sectors: heatmap.coverage?.sectors ?? 0,
          },
          summary: {
            bullish: normalized.bullish.length,
            bearish: normalized.bearish.length,
            regime: normalized.marketView.summary,
            monitor: normalized.marketView.monitor?.length ?? 0,
          },
          marketView: normalized.marketView,
          bullish: normalized.bullish,
          bearish: normalized.bearish,
          warnings: [...new Set([...(heatmap.warnings ?? []), ...warnings, ...(normalized.warnings ?? [])].filter(Boolean))].slice(0, 8),
        };

        if (this.storage) {
          await this.storage.saveAiSnapshot(snapshotKey, payload);
        }

        return payload;
      },
      { ttlMs: config.aiTtlMs, staleMs: config.aiTtlMs * 2, force: Boolean(options.force) },
    );
  }

  async ensureDailyAiSnapshot(options = {}) {
    const runDate = options.snapshotDate ?? getScheduledAiRunDate();
    if (!runDate) {
      return {
        ok: true,
        status: "waiting",
        next: getAiSnapshotScheduleLabel(),
      };
    }

    const universe = normalizeAiUniverse(options.universe);
    const horizon = normalizeAiHorizon(options.horizon);
    const bullishCount = clampAiIdeaCount(options.bullishCount, 20);
    const bearishCount = clampAiIdeaCount(options.bearishCount, 20);
    const snapshotKey = buildAiSnapshotKey({ universe, horizon, bullishCount, bearishCount, snapshotDate: runDate });

    if (this.storage) {
      const existing = await this.storage.getAiSnapshot(snapshotKey);
      if (existing) {
        return {
          ok: true,
          status: "ready",
          snapshotDate: runDate,
          asOf: existing.asOf,
        };
      }
    }

    const payload = await this.getAiIdeas({
      universe,
      horizon,
      bullishCount,
      bearishCount,
      force: true,
      snapshotDate: runDate,
    });

    return {
      ok: true,
      status: "generated",
      snapshotDate: runDate,
      asOf: payload.asOf,
      provider: payload.provider?.used ?? "rules",
    };
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
        const universe = await getSp500Universe();
        const heatmap = await this.getSp500Heatmap();
        const availableSectors = [...groupBySector(universe.constituents).entries()]
          .map(([name, items]) => ({
            sector: name,
            count: items.length,
            weight: sum(items.map((item) => numeric(item.sourceWeight))),
          }))
          .sort((left, right) => (numeric(right.weight) ?? 0) - (numeric(left.weight) ?? 0));
        const availableSectorNames = [
          ...new Set(
            [
              ...universe.constituents.map((item) => item?.sector),
              ...availableSectors.map((item) => item?.sector),
              ...(heatmap.tiles ?? []).map((item) => item?.sector),
            ]
              .filter(Boolean),
          ),
        ];
        const matchedSector =
          availableSectorNames.find((name) => normalizeSectorKey(name) === normalizeSectorKey(requested))
          ?? resolveSectorName(requested, availableSectors)
          ?? universe.constituents.find((item) => normalizeSectorKey(item?.sector) === normalizeSectorKey(requested))?.sector
          ?? availableSectors[0]?.sector
          ?? requested
          ?? "Technology";
        const heatmapBySymbol = new Map((heatmap.tiles ?? []).map((item) => [item.symbol, item]));
        const members = universe.constituents
          .filter((item) => normalizeSectorKey(item.sector) === normalizeSectorKey(matchedSector));
        const quoteMap = await this.getQuoteMap(members.map((item) => item.symbol), 40);
        const items = members
          .map((item) => {
            const tile = heatmapBySymbol.get(item.symbol) ?? null;
            const quote = quoteMap.get(item.symbol) ?? null;
            return {
              symbol: item.symbol,
              name: item.name ?? tile?.name ?? quote?.shortName ?? item.symbol,
              sector: item.sector ?? tile?.sector ?? quote?.sector ?? matchedSector,
              price: tile?.price ?? quote?.price ?? null,
              change: tile?.change ?? quote?.change ?? null,
              changePercent: tile?.changePercent ?? quote?.changePercent ?? null,
              marketCap: tile?.marketCap ?? quote?.marketCap ?? null,
              volume: tile?.volume ?? quote?.volume ?? null,
              weight: tile?.weight ?? numeric(item.sourceWeight),
              sourceWeight: item.sourceWeight ?? tile?.sourceWeight ?? null,
            };
          })
          .sort((left, right) => (numeric(right.weight) ?? 0) - (numeric(left.weight) ?? 0))
          .map((item, index) => ({ ...item, rank: index + 1 }));

        const missingCapSymbols = items
          .filter((item) => !Number.isFinite(item.marketCap))
          .slice(0, 24)
          .map((item) => item.symbol);
        const marketCapMap = new Map();
        if (missingCapSymbols.length) {
          const companies = await Promise.all(
            missingCapSymbols.map(async (symbol) => {
              try {
                return await this.getCompany(symbol);
              } catch {
                return null;
              }
            }),
          );
          for (const company of companies.filter(Boolean)) {
            marketCapMap.set(company.symbol, company.market?.marketCap ?? null);
          }
        }

        const hydratedItems = items.map((item) => ({
          ...item,
          marketCap: item.marketCap ?? marketCapMap.get(item.symbol) ?? null,
        }));

        const leaders = [...hydratedItems]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => right.changePercent - left.changePercent)
          .slice(0, 6);
        const laggards = [...hydratedItems]
          .filter((item) => Number.isFinite(item.changePercent))
          .sort((left, right) => left.changePercent - right.changePercent)
          .slice(0, 6);
        const topSymbols = hydratedItems.slice(0, 10).map((item) => item.symbol);
        const news = topSymbols.length
          ? await this.getDeskNews(topSymbols, topSymbols[0] ?? null, matchedSector).catch(() => ({ items: [] }))
          : { items: [] };

        return {
          sector: matchedSector,
          sectors: availableSectors,
          symbols: hydratedItems.map((item) => item.symbol),
          asOf: heatmap.asOf,
          source: heatmap.source,
          warnings: heatmap.warnings ?? [],
          summary: {
            names: hydratedItems.length,
            averageMove: average(hydratedItems.map((item) => item.changePercent)),
            weight: sum(hydratedItems.map((item) => item.weight)),
            aggregateVolume: sum(hydratedItems.map((item) => item.volume)),
            aggregateCap: sum(hydratedItems.map((item) => item.marketCap)),
          },
          leaders,
          laggards,
          items: hydratedItems,
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
            const optionsWarning = normalizeFlowWarning(options?.warning);
            const optionsAvailable = Number.isFinite(callVolume) || Number.isFinite(putVolume) || Number.isFinite(openInterest);

            return {
              symbol,
              shortName: quote?.shortName ?? company?.market?.shortName ?? symbol,
              sector: company?.market?.sector ?? "Unclassified",
              instrumentType: quote?.type ?? company?.market?.type ?? null,
              exchange: quote?.exchange ?? company?.market?.exchange ?? null,
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
              optionsAvailable,
              shortRatio: company?.market?.shortRatio ?? null,
              sharesShort: company?.market?.sharesShort ?? null,
              analystRating: company?.market?.analystRating ?? null,
              warnings: [...new Set([...(company?.warnings ?? []), optionsWarning].filter(Boolean))].slice(0, 3),
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
            optionsCoverage: ranked.filter((row) => row.optionsAvailable).length,
            elevated: ranked.filter(
              (row) => (numeric(row.relativeVolume) ?? 0) >= 1.5 || (numeric(row.shortRatio) ?? 0) >= 3,
            ).length,
          },
          rows: ranked,
          warnings: buildFlowWarnings(ranked),
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

function buildDerivedRelationshipIntel(symbol, company, aliasDirectory = null) {
  const market = company?.market ?? {};
  const secSignals = company?.sec?.relationshipSignals ?? null;
  const issuerName = market.shortName ?? company?.sec?.title ?? symbol;
  const graphNodes = [{ id: symbol, label: issuerName, kind: "issuer", symbol }];
  const graphEdges = [];
  const coverageNotes = ["Fallback graph derived from public holders, officers, sector, industry, and positioning data."];
  const executives = [];
  const ecosystemRelations = [];
  const supplierRelations = [];
  const customerRelations = [];
  const corporate = [];
  const corporateRelations = [];
  const ecosystems = [];
  const eventChains = [];
  const customerConcentration = [];
  const geography = { revenueMix: [], manufacturing: [], supplyRegions: [] };
  const template = sectorTemplateForMarket(market);
  const ownershipRows = buildOwnershipRows(market);
  const insiderRows = (market.insiderHolders ?? []).slice(0, 10);
  const insiderTransactions = (market.insiderTransactions ?? []).slice(0, 8);
  const officerRows = (market.companyOfficers ?? []).slice(0, 10);

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

  const addCorporateRelation = (item) => {
    if (item?.target) {
      corporateRelations.push(item);
    }
  };

  const addCorporateNode = (item) => {
    if (item?.name) {
      corporate.push(item);
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

  if (ownershipRows.length) {
    coverageNotes.push(`Ownership overlay maps ${ownershipRows.length} named institutions and funds from public filings.`);
  }

  for (const holder of ownershipRows.slice(0, 14)) {
    if (!holder?.holder) {
      continue;
    }
    const holderSymbol = inferTickerFromText(holder.holder, aliasDirectory) ?? undefined;
    const id = `holder:${templateKey(holder.holder)}`;
    addNode({ id, label: holder.holder, kind: "investment", symbol: holderSymbol });
    addEdge({
      source: symbol,
      target: id,
      relation: holder.ownershipType === "fund" ? "fund holder" : "institutional holder",
      domain: "investment",
      label: holderOwnershipNote(holder),
      weight: 3,
    });
    addCorporateRelation(
      relation(
        holder.holder,
        holder.ownershipType === "fund" ? "fund holder" : "institutional holder",
        "investment",
        holderOwnershipNote(holder),
        3,
        holderSymbol ?? null,
      ),
    );
  }

  if (market.institutionPercentHeld != null) {
    const institutionalId = `ownership:institutions:${symbol}`;
    addNode({ id: institutionalId, label: "Institutional base", kind: "investment" });
    addEdge({
      source: symbol,
      target: institutionalId,
      relation: "institutional ownership",
      domain: "investment",
      label: `${roundTo(market.institutionPercentHeld * 100, 2)}% institutions held`,
      weight: 3,
    });
    addCorporateRelation(
      relation(
        "Institutional base",
        "institutional ownership",
        "investment",
        `${roundTo(market.institutionPercentHeld * 100, 2)}% institutions held`,
        3,
      ),
    );
  }

  if (market.insiderPercentHeld != null) {
    const insiderId = `ownership:insiders:${symbol}`;
    addNode({ id: insiderId, label: "Insider ownership", kind: "investment" });
    addEdge({
      source: symbol,
      target: insiderId,
      relation: "insider ownership",
      domain: "investment",
      label: `${roundTo(market.insiderPercentHeld * 100, 2)}% insiders held`,
      weight: 2,
    });
    addCorporateRelation(
      relation(
        "Insider ownership",
        "insider ownership",
        "investment",
        `${roundTo(market.insiderPercentHeld * 100, 2)}% insiders held`,
        2,
      ),
    );
  }

  if (market.floatShares != null) {
    const floatId = `ownership:float:${symbol}`;
    addNode({ id: floatId, label: "Public float", kind: "investment" });
    addEdge({
      source: symbol,
      target: floatId,
      relation: "float",
      domain: "investment",
      label: `${compactQuantity(market.floatShares)} shares`,
      weight: 2,
    });
  }

  for (const insider of insiderRows) {
    if (!insider?.name) {
      continue;
    }
    const insiderSymbol = inferTickerFromText(insider.name, aliasDirectory) ?? undefined;
    const id = `insider:${templateKey(insider.name)}`;
    const note = insiderHoldingNote(insider);
    addNode({ id, label: insider.name, kind: "investment", symbol: insiderSymbol });
    addEdge({
      source: symbol,
      target: id,
      relation: insider.relation ?? "insider holder",
      domain: "investment",
      label: note,
      weight: 2,
    });
    addCorporateRelation(
      relation(
        insider.name,
        insider.relation ?? "insider holder",
        "investment",
        note,
        2,
        insiderSymbol ?? null,
      ),
    );
    addCorporateNode({
      root: symbol,
      type: "insider",
      name: insider.name,
      description: `${insider.relation ?? "Insider holder"} | ${note}`,
    });
  }

  if (insiderTransactions.length) {
    const insiderActivityId = `insider-activity:${symbol}`;
    addNode({ id: insiderActivityId, label: "Recent insider activity", kind: "investment" });
    addEdge({
      source: symbol,
      target: insiderActivityId,
      relation: "insider activity",
      domain: "investment",
      label: `${insiderTransactions.length} recent insider transaction rows`,
      weight: 2,
    });
    addCorporateRelation(
      relation(
        "Recent insider activity",
        "insider filings",
        "investment",
        `${insiderTransactions.length} recent insider transaction rows`,
        2,
      ),
    );
    eventChains.push({
      title: "Insider activity signal",
      steps: [
        `${symbol} insider filings update`,
        "Positioning and governance watchers reassess the name",
        "Peer sentiment can shift with the signal",
      ],
    });
  }

  for (const officer of officerRows) {
    if (!officer?.name) {
      continue;
    }
    const id = `officer:${templateKey(officer.name)}`;
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
    addCorporateRelation(
      relation(
        officer.name,
        officer.title ?? "executive",
        "corporate",
        officer.totalPay != null ? `Comp ${Math.round(officer.totalPay).toLocaleString()}` : "Public officer listing",
        2,
      ),
    );
    addCorporateNode({
      root: symbol,
      type: "officer",
      name: officer.name,
      description: officer.title ?? "Public officer listing",
    });
  }

  if (secSignals?.ownershipFormCount) {
    const ownershipSignalId = `sec-ownership:${symbol}`;
    addNode({ id: ownershipSignalId, label: "Beneficial ownership filings", kind: "investment" });
    addEdge({
      source: symbol,
      target: ownershipSignalId,
      relation: "13D / 13G activity",
      domain: "investment",
      label: `${secSignals.ownershipFormCount} recent beneficial-ownership forms`,
      weight: 2,
    });
    addCorporateRelation(
      relation(
        "Beneficial ownership filings",
        "ownership filings",
        "investment",
        `${secSignals.ownershipFormCount} recent beneficial-ownership forms`,
        2,
      ),
    );
    addCorporateNode({
      root: symbol,
      type: "ownership filing",
      name: "Beneficial ownership filings",
      description: `${secSignals.ownershipFormCount} recent 13D / 13G-style forms`,
    });
    eventChains.push({
      title: "Ownership filing cluster",
      steps: [
        `${symbol} beneficial-ownership filing posts`,
        "Positioning watchers assess sponsor or activist interest",
        "Peer governance-sensitive names can reprice around the signal",
      ],
    });
  }

  if (secSignals?.dealFormCount) {
    const dealSignalId = `sec-deals:${symbol}`;
    addNode({ id: dealSignalId, label: "Strategic / deal filings", kind: "corporate" });
    addEdge({
      source: symbol,
      target: dealSignalId,
      relation: "deal filing activity",
      domain: "corporate",
      label: `${secSignals.dealFormCount} recent 8-K / S-4 / 425 deal signals`,
      weight: 2,
    });
    addCorporateRelation(
      relation(
        "Strategic / deal filings",
        "deal activity",
        "corporate",
        `${secSignals.dealFormCount} recent 8-K / S-4 / 425 deal signals`,
        2,
      ),
    );
    addCorporateNode({
      root: symbol,
      type: "deal signal",
      name: "Strategic / deal filings",
      description: `${secSignals.dealFormCount} recent deal-related filings`,
    });
    eventChains.push({
      title: "Strategic filing activity",
      steps: [
        `${symbol} deal-related filing posts`,
        "Counterparties, owners, and sector peers reassess optionality",
        "Corporate-event probability gets repriced",
      ],
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
    corporateRelations,
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

function buildOwnershipRows(market = {}) {
  const rows = [
    ...(market.topInstitutionalHolders ?? []).map((item) => ({ ...item, ownershipType: "institution" })),
    ...(market.topFundHolders ?? []).map((item) => ({ ...item, ownershipType: "fund" })),
  ];
  const seen = new Set();
  return rows.filter((item) => {
    const key = `${String(item?.holder ?? "").trim().toLowerCase()}:${String(item?.ownershipType ?? "").trim().toLowerCase()}`;
    if (!key.trim() || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function holderOwnershipNote(holder) {
  if (!holder) {
    return "public owner";
  }
  const pct = holder.pctHeld != null ? `${roundTo(holder.pctHeld * 100, 2)}% held` : null;
  const shares = holder.shares != null ? `${compactQuantity(holder.shares)} shares` : null;
  const reportDate = holder.reportDate ? `reported ${holder.reportDate}` : null;
  return [pct, shares, reportDate, holder.note ?? null].filter(Boolean).join(" | ") || "public owner";
}

function insiderHoldingNote(holder) {
  if (!holder) {
    return "public insider signal";
  }
  const direct = holder.positionDirect != null ? `Direct ${compactQuantity(holder.positionDirect)} shares` : null;
  const indirect = holder.positionIndirect != null ? `Indirect ${compactQuantity(holder.positionIndirect)} shares` : null;
  const latest = holder.latestTransDate ? `latest ${holder.latestTransDate}` : null;
  return [direct, indirect, latest, holder.transactionDescription ?? null].filter(Boolean).join(" | ") || "public insider signal";
}

function compactQuantity(value) {
  const amount = numeric(value);
  if (!Number.isFinite(amount)) {
    return "n/a";
  }
  if (amount >= 1_000_000_000) {
    return `${roundTo(amount / 1_000_000_000, 2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${roundTo(amount / 1_000_000, 2)}M`;
  }
  if (amount >= 1_000) {
    return `${roundTo(amount / 1_000, 2)}K`;
  }
  return `${roundTo(amount, 2)}`;
}

function comparisonKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPublicPeerOverlay(symbol, company, peerSymbols = [], competitorMap = new Map()) {
  const market = company?.market ?? {};
  const sector = market.sector ?? "Public sector";
  const industry = market.industry ?? sector;
  const peers = peerSymbols
    .map((entry) => competitorMap.get(entry))
    .filter(Boolean)
    .slice(0, 10);

  if (!peers.length) {
    return {
      coverageNotes: [],
      relations: [],
      eventChains: [],
      graph: { nodes: [], edges: [] },
    };
  }

  const nodes = [];
  const edges = [];
  const relations = [];

  for (const peer of peers) {
    const label = peer.shortName ?? peer.symbol;
    nodes.push({
      id: `peer:${peer.symbol}`,
      label,
      kind: "competitor",
      symbol: peer.symbol,
    });
    edges.push({
      source: symbol,
      target: `peer:${peer.symbol}`,
      relation: comparisonKey(industry) && comparisonKey(peer.shortName) ? "sector peer" : "peer",
      domain: "competition",
      label: [
        sector,
        peer.changePercent != null ? `${roundTo(peer.changePercent, 2)}% today` : null,
      ].filter(Boolean).join(" | "),
      weight: 2,
    });
    relations.push(
      relation(
        label,
        "sector peer",
        "ecosystem",
        `${sector} public peer basket${peer.changePercent != null ? ` | ${roundTo(peer.changePercent, 2)}% today` : ""}`,
        2,
        peer.symbol,
      ),
    );
  }

  return {
    coverageNotes: [`Public peer overlay adds ${peers.length} same-sector S&P 500 names to broaden fallback relationship coverage.`],
    relations,
    eventChains: [
      impact(`${sector} peer basket move`, [
        `${symbol} rerates with same-sector leaders and laggards`,
        "Relative valuation and sentiment shift across the peer set",
        "Second-order suppliers, customers, and owners can react with the basket",
      ]),
    ],
    graph: { nodes, edges },
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

function normalizeMapRelations(items = [], aliasDirectory = null) {
  return items.map((item) => ({
    target: item.target ?? item.name ?? "n/a",
    relation: item.relation ?? item.level ?? "related",
    label: item.label ?? item.commentary ?? item.description ?? "",
    domain: item.domain ?? "ecosystem",
    symbol: item.symbol ?? inferTickerFromText(item.target ?? item.name ?? "", aliasDirectory),
  }));
}

function normalizeMapCustomers(intel, aliasDirectory = null) {
  const concentrationRows = (intel.customerConcentration ?? []).map((item) => ({
    target: item.name ?? "Customer / end market",
    relation: item.level ?? "customer mix",
    label: item.commentary ?? item.description ?? "",
    domain: "customer",
    symbol: inferTickerFromText(item.name ?? "", aliasDirectory),
  }));

  return dedupeRelations([
    ...concentrationRows,
    ...normalizeMapRelations(intel.supplyChain?.customers ?? [], aliasDirectory),
  ]);
}

function normalizeCompetitors(items = [], aliasDirectory = null) {
  return items.map((item) => ({
    symbol: item.symbol ?? inferTickerFromText(item.companyName ?? "", aliasDirectory),
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

function toAliasLookup(entries = []) {
  const lookup = new Map();
  for (const entry of entries ?? []) {
    const key = String(entry?.key ?? "").trim();
    if (!key || lookup.has(key)) {
      continue;
    }
    lookup.set(key, entry);
  }
  return lookup;
}

function resolveAliasDirectorySymbol(normalized, aliasDirectory) {
  if (!normalized || !(aliasDirectory instanceof Map)) {
    return null;
  }
  const match = aliasDirectory.get(normalized);
  if (!match) {
    return null;
  }
  return typeof match === "string" ? match : match.symbol ?? null;
}

function inferTickerFromText(value, aliasDirectory = null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  const direct = raw.toUpperCase();
  if (/^[A-Z0-9.\-]{1,5}$/.test(direct)) {
    return direct.replace(/\./g, "-");
  }

  const parenMatch = direct.match(/\(([A-Z0-9.\-]{1,5})\)/);
  if (parenMatch?.[1]) {
    return parenMatch[1].replace(/\./g, "-");
  }

  const normalized = normalizeAliasKey(
    direct.replace(/\b(CORPORATION|CORP|INCORPORATED|INC|COMPANY|CO|HOLDINGS|HOLDING|GROUP|LTD|LIMITED|PLC|SA|NV)\b/g, " "),
  );

  return (
    KNOWN_PUBLIC_TICKER_ALIASES.get(normalized)
    ?? resolveAliasDirectorySymbol(normalized, aliasDirectory)
    ?? null
  );
}

const KNOWN_PUBLIC_TICKER_ALIASES = new Map([
  ["APPLE", "AAPL"],
  ["APPLE INC", "AAPL"],
  ["MICROSOFT", "MSFT"],
  ["MICROSOFT CORP", "MSFT"],
  ["GOOGLE", "GOOGL"],
  ["ALPHABET", "GOOGL"],
  ["ALPHABET INC", "GOOGL"],
  ["YOUTUBE", "GOOGL"],
  ["AMAZON", "AMZN"],
  ["AMAZON WEB SERVICES", "AMZN"],
  ["AMAZON COM", "AMZN"],
  ["NVIDIA", "NVDA"],
  ["NVIDIA CORP", "NVDA"],
  ["ADVANCED MICRO DEVICES", "AMD"],
  ["AMD", "AMD"],
  ["INTEL", "INTC"],
  ["QUALCOMM", "QCOM"],
  ["BROADCOM", "AVGO"],
  ["MARVELL", "MRVL"],
  ["MICRON", "MU"],
  ["TAIWAN SEMICONDUCTOR MANUFACTURING", "TSM"],
  ["TSMC", "TSM"],
  ["ASML", "ASML"],
  ["APPLIED MATERIALS", "AMAT"],
  ["LAM RESEARCH", "LRCX"],
  ["TESLA", "TSLA"],
  ["META", "META"],
  ["META PLATFORMS", "META"],
  ["NETFLIX", "NFLX"],
  ["UBER", "UBER"],
  ["ORACLE", "ORCL"],
  ["SALESFORCE", "CRM"],
  ["ADOBE", "ADBE"],
  ["SERVICENOW", "NOW"],
  ["IBM", "IBM"],
  ["CISCO", "CSCO"],
  ["ARISTA NETWORKS", "ANET"],
  ["DELL", "DELL"],
  ["HEWLETT PACKARD ENTERPRISE", "HPE"],
  ["HP", "HPQ"],
  ["JPMORGAN CHASE", "JPM"],
  ["JPMORGAN", "JPM"],
  ["GOLDMAN SACHS", "GS"],
  ["BLACKROCK", "BLK"],
  ["STATE STREET", "STT"],
  ["CHARLES SCHWAB", "SCHW"],
  ["MORGAN STANLEY", "MS"],
  ["BANK OF NEW YORK MELLON", "BK"],
  ["BANK OF AMERICA", "BAC"],
  ["WELLS FARGO", "WFC"],
  ["CITIGROUP", "C"],
  ["BLACKSTONE", "BX"],
  ["KKR", "KKR"],
  ["APOLLO GLOBAL MANAGEMENT", "APO"],
  ["INVESCO", "IVZ"],
  ["FRANKLIN RESOURCES", "BEN"],
  ["T ROWE PRICE", "TROW"],
  ["BERKSHIRE HATHAWAY", "BRK-B"],
  ["VISA", "V"],
  ["MASTERCARD", "MA"],
  ["PAYPAL", "PYPL"],
  ["AMERICAN EXPRESS", "AXP"],
  ["EXXON MOBIL", "XOM"],
  ["CHEVRON", "CVX"],
  ["CONOCOPHILLIPS", "COP"],
  ["SLB", "SLB"],
  ["HALLIBURTON", "HAL"],
  ["BAKER HUGHES", "BKR"],
  ["VALERO ENERGY", "VLO"],
  ["PHILLIPS 66", "PSX"],
  ["KINDER MORGAN", "KMI"],
  ["ONEOK", "OKE"],
  ["TARGA RESOURCES", "TRGP"],
  ["UNITEDHEALTH", "UNH"],
  ["UNITEDHEALTH GROUP", "UNH"],
  ["CVS HEALTH", "CVS"],
  ["CIGNA", "CI"],
  ["ELEVANCE HEALTH", "ELV"],
  ["MCKESSON", "MCK"],
  ["CARDINAL HEALTH", "CAH"],
  ["CENCORA", "COR"],
  ["MERCK", "MRK"],
  ["ABBVIE", "ABBV"],
  ["ELI LILLY", "LLY"],
  ["BRISTOL MYERS SQUIBB", "BMY"],
  ["PFIZER", "PFE"],
  ["AMGEN", "AMGN"],
  ["GILEAD", "GILD"],
  ["VERTEX PHARMACEUTICALS", "VRTX"],
  ["ABBOTT", "ABT"],
  ["DANAHER", "DHR"],
  ["THERMO FISHER", "TMO"],
  ["CARRIER GLOBAL", "CARR"],
  ["BOEING", "BA"],
  ["RTX", "RTX"],
  ["LOCKHEED MARTIN", "LMT"],
  ["NORTHROP GRUMMAN", "NOC"],
  ["GENERAL DYNAMICS", "GD"],
  ["HONEYWELL", "HON"],
  ["HOWMET AEROSPACE", "HWM"],
  ["UNITED PARCEL SERVICE", "UPS"],
  ["FEDEX", "FDX"],
  ["GENERAL ELECTRIC", "GE"],
  ["GE VERNOVA", "GEV"],
  ["DEERE", "DE"],
  ["CATERPILLAR", "CAT"],
  ["PARKER HANNIFIN", "PH"],
  ["EATON", "ETN"],
  ["EMERSON ELECTRIC", "EMR"],
  ["ROCKWELL AUTOMATION", "ROK"],
  ["WALMART", "WMT"],
  ["COSTCO", "COST"],
  ["HOME DEPOT", "HD"],
  ["TARGET", "TGT"],
  ["NIKE", "NKE"],
  ["STARBUCKS", "SBUX"],
  ["COCA COLA", "KO"],
  ["PROCTER AND GAMBLE", "PG"],
  ["PROCTER GAMBLE", "PG"],
  ["PEPSICO", "PEP"],
  ["MCDONALDS", "MCD"],
  ["SPDR GOLD SHARES", "GLD"],
  ["SPY", "SPY"],
  ["QQQ", "QQQ"],
  ["TLT", "TLT"],
]);

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
  const industryLower = String(market?.industry ?? "").toLowerCase();

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
    if (industryLower.includes("semiconductor")) {
      return {
        ...defaults,
        peerSymbols: ["NVDA", "AMD", "AVGO", "QCOM", "MU", "INTC"],
        suppliers: [
          relation("Taiwan Semiconductor Manufacturing", "foundry supplier", "supply-chain", "Advanced-node wafer capacity and packaging dependency", 4, "TSM"),
          relation("ASML", "second-order supplier", "supply-chain", "Lithography bottleneck to leading-edge expansion", 3, "ASML"),
          relation("Applied Materials", "equipment supplier", "supply-chain", "Wafer-fab equipment and process tooling", 3, "AMAT"),
          relation("Lam Research", "equipment supplier", "supply-chain", "Etch and deposition process capacity", 3, "LRCX"),
        ],
        customers: [
          relation("Microsoft", "cloud customer", "customer", "AI and cloud infrastructure demand", 3, "MSFT"),
          relation("Amazon", "cloud / platform customer", "customer", "Datacenter and edge compute demand", 3, "AMZN"),
          relation("Apple", "device / compute customer", "customer", "Consumer and edge silicon demand", 2, "AAPL"),
        ],
        ecosystem: [
          relation("NVIDIA", "AI compute benchmark", "ecosystem", "AI accelerator pricing and platform read-through", 3, "NVDA"),
          relation("Broadcom", "adjacent silicon platform", "ecosystem", "Networking and custom silicon adjacency", 2, "AVGO"),
          relation(industry, "industry map", "ecosystem", "Public semiconductor peer cluster", 2),
        ],
        customerConcentration: [
          concentration("Hyperscaler demand", "High", "Cloud and AI infrastructure buyers often drive the marginal read-through."),
          concentration("Device / OEM demand", "Moderate", "PC, handset, and embedded channels still matter across many chip franchises."),
        ],
        geography: {
          revenueMix: weights([["North America", 4, "Cloud and enterprise silicon demand"], ["Asia", 5, "Assembly, electronics, and regional customer base"], ["Europe", 2, "Industrial and auto exposure"]]),
          manufacturing: weights([["Taiwan", 5, "Leading-edge foundry concentration"], ["US", 3, "Design, validation, and some advanced packaging"], ["Southeast Asia", 3, "Assembly and test ecosystem"]]),
          supplyRegions: weights([["Taiwan", 5, "Foundry and packaging bottleneck"], ["Netherlands", 4, "Lithography tool dependency"], ["Japan", 3, "Materials and equipment inputs"]]),
        },
        ecosystems: [
          ecosystem("Semiconductor stack", ["Design", "Foundry", "Packaging", "Cloud / OEM demand"]),
        ],
        eventChains: [
          impact("Foundry or packaging constraint", ["TSMC capacity tightens", "Lead times and margins reprice", "Adjacent chip and equipment names react"]),
          impact("AI infrastructure demand surprise", ["Cloud capex outlook changes", "Compute and memory peers rerate", "Second-order equipment suppliers move"]),
        ],
        coverageNote: "Semiconductor fallback maps add named public foundries, equipment vendors, and hyperscaler demand nodes when no curated map exists.",
      };
    }

    if (industryLower.includes("software") || industryLower.includes("application") || industryLower.includes("systems")) {
      return {
        ...defaults,
        peerSymbols: ["MSFT", "ORCL", "CRM", "NOW", "ADBE"],
        suppliers: [
          relation("Microsoft", "platform partner", "supply-chain", "Azure and enterprise-stack dependency", 3, "MSFT"),
          relation("Amazon", "cloud partner", "supply-chain", "AWS infrastructure and partner-stack sensitivity", 3, "AMZN"),
          relation("Alphabet", "cloud partner", "supply-chain", "GCP and developer-platform dependency", 2, "GOOGL"),
          relation("Accenture", "implementation partner", "supply-chain", "Systems-integrator and deployment channel", 2, "ACN"),
        ],
        customers: [
          relation("Enterprise IT buyers", "customer base", "customer", "Seat growth, renewal, and enterprise-spend sensitivity", 3),
          relation("Public sector / regulated buyers", "customer base", "customer", "Multi-year digital transformation and compliance budgets", 2),
        ],
        ecosystem: [
          relation("ServiceNow", "workflow peer", "ecosystem", "Platform software and automation adjacency", 2, "NOW"),
          relation("Salesforce", "application peer", "ecosystem", "Enterprise application and CRM read-through", 2, "CRM"),
          relation(industry, "industry map", "ecosystem", "Public software peer cluster", 2),
        ],
        customerConcentration: [
          concentration("Enterprise renewals", "High", "Renewal cadence, expansion, and pricing often dominate the setup."),
          concentration("Cloud attach", "Moderate", "Public cloud and services partners often influence delivery and margin mix."),
        ],
        eventChains: [
          impact("Enterprise software demand shift", ["Pipeline and renewal outlook move", "Peer software names rerate", "Cloud and services partners react"]),
        ],
        coverageNote: "Software fallback maps connect the issuer to cloud platforms, implementation channels, and enterprise budget drivers.",
      };
    }

    if (industryLower.includes("communication equipment") || industryLower.includes("computer") || industryLower.includes("consumer electronics")) {
      return {
        ...defaults,
        peerSymbols: ["AAPL", "CSCO", "QCOM", "DELL", "HPQ"],
        suppliers: [
          relation("Taiwan Semiconductor Manufacturing", "chip supplier", "supply-chain", "Advanced silicon dependency", 3, "TSM"),
          relation("Broadcom", "component supplier", "supply-chain", "Connectivity and custom silicon inputs", 2, "AVGO"),
          relation("FedEx", "logistics partner", "supply-chain", "Global device fulfillment", 2, "FDX"),
          relation("United Parcel Service", "logistics partner", "supply-chain", "Distribution throughput and last-mile flow", 2, "UPS"),
        ],
        customers: [
          relation("Carrier / reseller channels", "distribution", "customer", "Telecom and reseller demand channels", 2),
          relation("Consumers / device fleets", "end demand", "customer", "Upgrade cycle and replacement demand", 3),
        ],
        ecosystem: [
          relation("Apple", "device platform anchor", "ecosystem", "Consumer hardware and services read-through", 2, "AAPL"),
          relation("Qualcomm", "chip ecosystem peer", "ecosystem", "Wireless and edge silicon adjacency", 2, "QCOM"),
        ],
        customerConcentration: [
          concentration("Channel inventory", "Moderate", "Carrier, distribution, and OEM inventory can drive quarter-to-quarter volatility."),
        ],
        eventChains: [
          impact("Device cycle turns", ["Order visibility shifts", "Component and logistics partners react", "Consumer hardware peers rerate"]),
        ],
        coverageNote: "Hardware fallback maps emphasize chip supply, logistics, and channel inventory dependence.",
      };
    }

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
    if (industryLower.includes("drug") || industryLower.includes("biotech") || industryLower.includes("pharmaceutical")) {
      return {
        ...defaults,
        peerSymbols: ["LLY", "MRK", "ABBV", "BMY", "AMGN", "PFE"],
        suppliers: [
          relation("McKesson", "distribution partner", "supply-chain", "Drug wholesale channel and inventory flow", 3, "MCK"),
          relation("Cardinal Health", "distribution partner", "supply-chain", "Drug distribution and provider channel", 2, "CAH"),
          relation("Cencora", "distribution partner", "supply-chain", "Commercial and specialty distribution", 2, "COR"),
        ],
        customers: [
          relation("PBMs / payers", "reimbursement channel", "customer", "Formulary access and reimbursement sensitivity", 3),
          relation("Hospitals / providers", "care channel", "customer", "Treatment volume and site-of-care demand", 2),
        ],
        ecosystem: [
          relation("UnitedHealth", "payer ecosystem", "ecosystem", "Managed-care reimbursement read-through", 2, "UNH"),
          relation("CVS Health", "PBM ecosystem", "ecosystem", "Pharmacy benefit and retail-health adjacency", 2, "CVS"),
        ],
        customerConcentration: [
          concentration("Reimbursement access", "High", "Payers, PBMs, and formulary positioning often dominate the revenue outlook."),
        ],
        eventChains: [
          impact("Drug price or trial outcome shifts", ["Commercial outlook changes", "Payer and distributor channels react", "Therapeutic-area peers rerate"]),
        ],
        coverageNote: "Pharma fallback maps add distribution, payer, and reimbursement nodes around the issuer.",
      };
    }

    if (industryLower.includes("healthcare plans") || industryLower.includes("managed health")) {
      return {
        ...defaults,
        peerSymbols: ["UNH", "ELV", "CVS", "CI", "HUM"],
        suppliers: [
          relation("Hospitals / provider networks", "care supply", "supply-chain", "Medical-cost and negotiated-rate sensitivity", 3),
          relation("CVS Health", "pharmacy / PBM partner", "supply-chain", "Pharmacy and benefit-management channel", 2, "CVS"),
        ],
        customers: [
          relation("Employers / members", "covered lives", "customer", "Enrollment and premium growth", 3),
          relation("Government programs", "public coverage channel", "customer", "Medicare / Medicaid exposure", 2),
        ],
        ecosystem: [
          relation("UnitedHealth", "managed-care benchmark", "ecosystem", "Managed-care and medical-cost read-through", 3, "UNH"),
          relation("Humana", "senior-focused peer", "ecosystem", "Medicare Advantage sensitivity", 2, "HUM"),
        ],
        customerConcentration: [
          concentration("Government / employer mix", "High", "Payer economics are heavily driven by enrollment mix, rate filings, and medical-loss trends."),
        ],
        eventChains: [
          impact("Medical-cost trend changes", ["MLR outlook shifts", "Managed-care peers rerate", "Provider and PBM baskets react"]),
        ],
        coverageNote: "Managed-care fallback maps emphasize provider cost, PBM rails, and enrollment mix.",
      };
    }

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
    if (industryLower.includes("bank")) {
      return {
        ...defaults,
        peerSymbols: ["JPM", "BAC", "WFC", "C", "PNC", "USB"],
        suppliers: [
          relation("Funding markets", "liquidity source", "supply-chain", "Deposit beta and wholesale funding sensitivity", 3),
          relation("Visa", "payments rail", "supply-chain", "Card network and transaction-flow dependency", 2, "V"),
          relation("Mastercard", "payments rail", "supply-chain", "Card network and fee sensitivity", 2, "MA"),
        ],
        customers: [
          relation("Consumers", "deposit / lending base", "customer", "Cards, deposits, and unsecured credit demand", 3),
          relation("Corporate clients", "treasury / lending base", "customer", "Treasury, loan, and capital-markets demand", 2),
        ],
        ecosystem: [
          relation("JPMorgan Chase", "money-center benchmark", "ecosystem", "Large-bank funding and fee benchmark", 3, "JPM"),
          relation("Bank of America", "consumer-banking peer", "ecosystem", "Consumer and commercial banking read-through", 2, "BAC"),
        ],
        customerConcentration: [
          concentration("Funding and credit quality", "High", "Deposit stability, credit costs, and fee momentum dominate most large-bank setups."),
        ],
        eventChains: [
          impact("Funding or credit conditions tighten", ["NIM and credit-loss outlook move", "Bank peers rerate", "Payment and broker rails react"]),
        ],
        coverageNote: "Banking fallback maps link issuers to funding markets, payment rails, and consumer / corporate demand.",
      };
    }

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
    if (industryLower.includes("integrated") || industryLower.includes("oil gas")) {
      return {
        ...defaults,
        peerSymbols: ["XOM", "CVX", "COP", "VLO", "PSX"],
        suppliers: [
          relation("SLB", "service partner", "supply-chain", "Field-service and upstream efficiency dependency", 3, "SLB"),
          relation("Halliburton", "service partner", "supply-chain", "Completion and drilling support", 2, "HAL"),
          relation("Baker Hughes", "equipment partner", "supply-chain", "Equipment and oilfield services", 2, "BKR"),
          relation("Kinder Morgan", "midstream partner", "supply-chain", "Gathering, storage, and transport capacity", 2, "KMI"),
        ],
        customers: [
          relation("Valero Energy", "refining customer", "customer", "Downstream margin and product demand read-through", 2, "VLO"),
          relation("Phillips 66", "refining customer", "customer", "Refining and product channel sensitivity", 2, "PSX"),
          relation("Global industrial demand", "macro demand", "customer", "Oil, gas, and product consumption", 3),
        ],
        ecosystem: [
          relation("ConocoPhillips", "upstream benchmark", "ecosystem", "Exploration and production read-through", 2, "COP"),
          relation("Chevron", "integrated major peer", "ecosystem", "Integrated major benchmark", 2, "CVX"),
          relation("Exxon Mobil", "integrated major peer", "ecosystem", "Integrated major benchmark", 2, "XOM"),
        ],
        customerConcentration: [
          concentration("Commodity pricing", "High", "Benchmark crude / gas curves usually matter more than any one named customer."),
        ],
        eventChains: [
          impact("Oil or gas price spike", ["Integrated majors rerate", "Service and midstream names follow", "Transport-sensitive sectors feel pressure"]),
          impact("Refining margin compression", ["Downstream earnings fade", "Integrated majors diverge from refiners", "Product-sensitive peers reprice"]),
        ],
        coverageNote: "Integrated-energy fallback maps add named service, midstream, and downstream public nodes.",
      };
    }

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
    if (industryLower.includes("aerospace") || industryLower.includes("defense")) {
      return {
        ...defaults,
        peerSymbols: ["RTX", "BA", "LMT", "NOC", "GD", "HWM"],
        suppliers: [
          relation("Howmet Aerospace", "component supplier", "supply-chain", "Engine and structural component inputs", 3, "HWM"),
          relation("Honeywell", "avionics supplier", "supply-chain", "Avionics and control systems", 2, "HON"),
          relation("RTX", "program partner", "supply-chain", "Defense and engine program overlap", 2, "RTX"),
        ],
        customers: [
          relation("US / allied governments", "program customer", "customer", "Defense budget and program timing", 3),
          relation("Commercial airlines", "fleet demand", "customer", "Aircraft and aftermarket demand", 2),
        ],
        ecosystem: [
          relation("Boeing", "platform benchmark", "ecosystem", "Commercial-aerospace program sensitivity", 2, "BA"),
          relation("Lockheed Martin", "defense benchmark", "ecosystem", "Defense spending and program execution", 2, "LMT"),
        ],
        customerConcentration: [
          concentration("Government budgets", "High", "Program timing and defense budgets often dominate aerospace / defense setups."),
        ],
        eventChains: [
          impact("Program timing or defense budget shifts", ["Backlog and margin outlook change", "Aerospace peers rerate", "Supplier chain names react"]),
        ],
        coverageNote: "Aerospace fallback maps emphasize program customers, avionics, and component suppliers.",
      };
    }

    if (industryLower.includes("air freight") || industryLower.includes("logistics")) {
      return {
        ...defaults,
        peerSymbols: ["UPS", "FDX", "CHRW", "EXPD", "JBHT"],
        suppliers: [
          relation("FedEx", "logistics peer / partner", "supply-chain", "Air and parcel throughput read-through", 3, "FDX"),
          relation("United Parcel Service", "logistics peer / partner", "supply-chain", "Parcel network and pricing discipline", 3, "UPS"),
          relation("Wabtec", "equipment supplier", "supply-chain", "Transport equipment and service support", 2, "WAB"),
        ],
        customers: [
          relation("Amazon", "large shipper", "customer", "E-commerce shipping demand", 3, "AMZN"),
          relation("Retail / industrial shippers", "customer base", "customer", "Freight and parcel volume mix", 2),
        ],
        ecosystem: [
          relation("Transportation demand", "macro node", "ecosystem", "Industrial output and consumer demand sensitivity", 3),
        ],
        customerConcentration: [
          concentration("Large shipping accounts", "Moderate", "Parcel and freight names can carry meaningful concentration to large enterprise shippers."),
        ],
        eventChains: [
          impact("Freight demand shifts", ["Volume and yield outlook move", "Transport peers rerate", "Retail and industrial shipment baskets react"]),
        ],
        coverageNote: "Logistics fallback maps emphasize large shipping accounts and transport-throughput signals.",
      };
    }

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
    if (industryLower.includes("beverage") || industryLower.includes("packaged") || industryLower.includes("food")) {
      return {
        ...defaults,
        peerSymbols: ["KO", "PEP", "PG", "MDLZ", "KHC", "GIS"],
        suppliers: [
          relation("Walmart", "retail customer", "customer", "Large retail distribution and shelf exposure", 3, "WMT"),
          relation("Costco", "club customer", "customer", "Large-format retail throughput", 2, "COST"),
          relation("Target", "retail customer", "customer", "Broadline retail shelf and promotion exposure", 2, "TGT"),
          relation("Global packaging / ingredient suppliers", "input base", "supply-chain", "Packaging, sweetener, and agricultural input sensitivity", 2),
        ],
        customers: [
          relation("Consumers", "end demand", "customer", "Brand strength, pricing, and household demand", 3),
          relation("Retail channels", "distribution", "customer", "Shelf space and merchandising execution", 2),
        ],
        ecosystem: [
          relation("Consumer staples basket", "sector basket", "ecosystem", "Pricing power and volume trade-off across staples peers", 3),
        ],
        customerConcentration: [
          concentration("Retail channel exposure", "Moderate", "Large grocery, club, and big-box channels can influence sell-through and promo cadence."),
        ],
        eventChains: [
          impact("Staples demand or input-cost shift", ["Pricing / volume mix changes", "Staples peers rerate", "Retail channels and ingredient baskets react"]),
        ],
        coverageNote: "Consumer-defensive fallback maps emphasize big retail channels, ingredient exposure, and pricing-power dynamics.",
      };
    }

    if (industryLower.includes("internet") || industryLower.includes("direct marketing") || industryLower.includes("retail")) {
      return {
        ...defaults,
        peerSymbols: ["AMZN", "WMT", "COST", "TGT", "EBAY", "BKNG"],
        suppliers: [
          relation("United Parcel Service", "logistics partner", "supply-chain", "Parcel throughput and delivery economics", 3, "UPS"),
          relation("FedEx", "logistics partner", "supply-chain", "Parcel throughput and delivery economics", 3, "FDX"),
          relation("Visa", "payments rail", "supply-chain", "Payment mix and transaction conversion", 2, "V"),
          relation("Mastercard", "payments rail", "supply-chain", "Payment mix and transaction conversion", 2, "MA"),
        ],
        customers: [
          relation("Consumers", "end demand", "customer", "Traffic, basket size, and discretionary spending", 3),
          relation("Third-party sellers / merchants", "platform demand", "customer", "Marketplace and take-rate sensitivity", 2),
        ],
        ecosystem: [
          relation("Amazon", "platform benchmark", "ecosystem", "E-commerce demand and logistics intensity", 3, "AMZN"),
          relation("Walmart", "retail benchmark", "ecosystem", "Omnichannel and physical-retail benchmark", 2, "WMT"),
        ],
        customerConcentration: [
          concentration("Traffic and basket size", "High", "Consumer spending and merchant activity dominate most retail and platform setups."),
        ],
        eventChains: [
          impact("Consumer traffic inflects", ["Gross merchandise volume or comps move", "Retail peers rerate", "Logistics and payments rails react"]),
        ],
        coverageNote: "Retail fallback maps add logistics, payment rails, and merchant / consumer demand nodes.",
      };
    }

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

  if (sector.includes("utilities")) {
    return {
      ...defaults,
      peerSymbols: ["NEE", "DUK", "SO", "AEP", "EXC", "SRE"],
      suppliers: [
        relation("Fuel / generation inputs", "supply base", "supply-chain", "Natural gas, nuclear, or power-generation input sensitivity", 3),
        relation("Grid / transmission buildout", "capital program", "supply-chain", "Transmission, maintenance, and equipment capex", 2),
      ],
      customers: [
        relation("Residential load", "customer base", "customer", "Household power and rate-base demand", 2),
        relation("Commercial / industrial load", "customer base", "customer", "Industrial load growth and data-center demand", 3),
      ],
      ecosystem: [
        relation("Rate-case / regulator path", "policy node", "ecosystem", "Allowed-return and rate-case sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Regulated load growth", "High", "Rate cases, allowed returns, and data-center load growth dominate many utility setups."),
      ],
      eventChains: [
        impact("Load-growth or rate-case shift", ["Rate-base outlook changes", "Utility peers rerate", "Generation and equipment baskets react"]),
      ],
      coverageNote: "Utilities fallback maps emphasize regulated load growth, capital programs, and rate-case sensitivity.",
    };
  }

  if (sector.includes("real estate")) {
    return {
      ...defaults,
      peerSymbols: ["PLD", "AMT", "EQIX", "WELL", "O", "SPG"],
      suppliers: [
        relation("Construction / maintenance vendors", "property services", "supply-chain", "Buildout, maintenance, and redevelopment spend", 2),
        relation("Debt / funding markets", "capital source", "supply-chain", "Funding-cost and refinancing sensitivity", 3),
      ],
      customers: [
        relation("Tenants", "lease base", "customer", "Occupancy, rent spreads, and tenant quality", 3),
        relation("Data-center / tower tenants", "infrastructure customer", "customer", "Hyperscaler and wireless carrier demand", 2),
      ],
      ecosystem: [
        relation("Rate-sensitive REIT basket", "macro node", "ecosystem", "Funding-cost and cap-rate sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Tenant concentration", "Moderate", "Occupancy, renewal spreads, and large tenants are core REIT sensitivities."),
      ],
      eventChains: [
        impact("Rates or occupancy shift", ["Cap rates and rents reprice", "REIT peers rerate", "Funding-sensitive baskets react"]),
      ],
      coverageNote: "Real-estate fallback maps emphasize tenants, funding markets, and occupancy / rate sensitivity.",
    };
  }

  if (sector.includes("materials") || sector.includes("basic materials")) {
    return {
      ...defaults,
      peerSymbols: ["LIN", "APD", "FCX", "NEM", "ALB", "DD"],
      suppliers: [
        relation("Mining / feedstock inputs", "raw-material base", "supply-chain", "Ore, chemicals, and feedstock sensitivity", 3),
        relation("Industrial equipment vendors", "equipment base", "supply-chain", "Processing and extraction equipment dependence", 2),
      ],
      customers: [
        relation("Industrial manufacturers", "end demand", "customer", "Construction, chemicals, and manufacturing demand", 3),
        relation("Energy transition buyers", "theme demand", "customer", "Battery, electrification, and infrastructure demand", 2),
      ],
      ecosystem: [
        relation("Commodity / chemical curve", "price node", "ecosystem", "Realized-price and spread sensitivity", 3),
      ],
      customerConcentration: [
        concentration("Commodity-linked demand", "High", "Benchmark prices and industrial demand often matter more than single named buyers."),
      ],
      eventChains: [
        impact("Commodity or industrial-demand shift", ["Realized-price outlook changes", "Materials peers rerate", "Industrial and energy-transition baskets react"]),
      ],
      coverageNote: "Materials fallback maps connect issuers to raw inputs, industrial buyers, and commodity-price sensitivity.",
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
    type: null,
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

function shouldSuppressSecWarning(symbol, market) {
  const clean = String(symbol ?? "").trim().toUpperCase();
  const shortName = String(market?.shortName ?? "").toLowerCase();
  const type = String(market?.type ?? "").toLowerCase();
  if (!clean) {
    return false;
  }
  if (clean.startsWith("^") || clean.includes("=") || clean.endsWith("-USD")) {
    return true;
  }
  if (/\betf\b|\bfund\b|\bmutualfund\b|\bindex\b|\bcurrency\b/.test(type)) {
    return true;
  }
  return /\betf\b|\btrust\b|\bfund\b|\bshares\b|\bindex\b|\bcurrency\b|\btreasury\b|\bspdr\b|\bishares\b|\binvesco\b|\bvanguard\b/.test(shortName);
}

function normalizeFlowWarning(warning) {
  const message = String(warning ?? "").trim();
  if (!message) {
    return null;
  }
  if (/invalid crumb|unauthorized|unable to access this feature/i.test(message)) {
    return null;
  }
  return message;
}

function buildFlowWarnings(rows = []) {
  const warnings = rows.flatMap((row) => row.warnings.map((warning) => `${row.symbol}: ${warning}`)).slice(0, 6);
  if (warnings.length) {
    return warnings;
  }
  const optionsCoverage = rows.filter((row) => row.optionsAvailable).length;
  if (!rows.length || optionsCoverage === rows.length) {
    return [];
  }
  return ["Options flow is partially unavailable from the current free upstream source. Share volume and short-interest signals are still live."];
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

function buildAcquisitionTimeline(intel, filings = []) {
  const corporateRows = [
    ...((intel?.corporate?.tree ?? []).map((item) => ({
      date: item.date ?? null,
      title: item.name ?? item.target ?? "Corporate event",
      kind: item.type ?? "corporate",
      note: item.description ?? "Curated/public corporate relationship",
      source: "Relationship console",
    }))),
    ...((intel?.corporate?.relations ?? []).map((item) => ({
      date: item.date ?? null,
      title: item.target ?? "Corporate link",
      kind: item.relation ?? "relationship",
      note: item.label ?? "Curated/public relationship",
      source: "Relationship console",
    }))),
  ]
    .filter((item) => /acqu|subs|invest|spin|merge|joint/i.test(`${item.kind} ${item.title} ${item.note}`))
    .slice(0, 8);

  const filingRows = (filings ?? [])
    .filter((filing) => /8-K|S-4|SC 13D|425|10-K/i.test(String(filing.form ?? "")))
    .slice(0, 6)
    .map((filing) => ({
      date: filing.filingDate ?? null,
      title: filing.form ?? "SEC filing",
      kind: "filing",
      note: filing.primaryDocument ?? "Recent corporate disclosure",
      source: "SEC",
      url: filing.filingUrl ?? filing.filingIndexUrl ?? null,
    }));

  return [...corporateRows, ...filingRows]
    .sort((left, right) => compareDatesDescending(left.date, right.date))
    .slice(0, 12);
}

function buildIndexTimeline(indices = []) {
  const verifiedAt = new Date().toISOString();
  return (indices ?? []).slice(0, 8).map((item) => ({
    date: item.verifiedAt ?? verifiedAt,
    title: item.label ?? "Index membership",
    kind: "index",
    note: item.note ?? `Current membership via ${item.source ?? "public source"}`,
    source: item.source ?? "Public source",
    url: item.sourceUrl ?? null,
  }));
}

function buildOwnershipTrend(market = {}, holders = [], insiderTransactions = []) {
  const grouped = new Map();

  for (const holder of holders ?? []) {
    const date = normalizeDateKey(holder.reportDate);
    if (!date || !Number.isFinite(holder.pctHeld)) {
      continue;
    }
    const row = grouped.get(date) ?? { date, institutionPercent: 0, insiderEvents: 0, note: "holder reports" };
    row.institutionPercent += holder.pctHeld;
    grouped.set(date, row);
  }

  for (const item of insiderTransactions ?? []) {
    const date = normalizeDateKey(item.startDate);
    if (!date) {
      continue;
    }
    const row = grouped.get(date) ?? { date, institutionPercent: null, insiderEvents: 0, note: "insider transactions" };
    row.insiderEvents += 1;
    grouped.set(date, row);
  }

  const rows = [...grouped.values()]
    .sort((left, right) => compareDatesAscending(left.date, right.date))
    .slice(-10);

  if (rows.length) {
    return rows;
  }

  return [
    {
      date: new Date().toISOString().slice(0, 10),
      institutionPercent: market.institutionPercentHeld ?? null,
      insiderEvents: (insiderTransactions ?? []).length || null,
      note: "current public ownership snapshot",
    },
  ];
}

function buildBoardInterlocks(symbol, executives = [], officers = [], aliasDirectory = null) {
  const interlocks = new Map();
  const nodes = [{ id: symbol, label: symbol, kind: "issuer", symbol }];
  const edges = [];

  const addNode = (id, label, kind, symbol = undefined) => {
    if (id && !nodes.find((node) => node.id === id)) {
      nodes.push({ id, label, kind, symbol });
    }
  };

  const addEdge = (source, target, relation, domain, label) => {
    if (!source || !target) {
      return;
    }
    const key = `${source}:${target}:${relation}:${domain}`;
    if (!edges.find((entry) => `${entry.source}:${entry.target}:${entry.relation}:${entry.domain}` === key)) {
      edges.push({ source, target, relation, domain, label, weight: 2 });
    }
  };

  for (const executive of executives ?? []) {
    if (!executive?.name) {
      continue;
    }
    const background = Array.isArray(executive.background) ? executive.background : [];
    for (const companyName of background) {
      if (!companyName || /^age |^born /i.test(companyName)) {
        continue;
      }
      const cleanName = String(companyName).trim();
      const nodeId = `interlock:${templateKey(cleanName)}`;
      addNode(nodeId, cleanName, "investment", inferTickerFromText(cleanName, aliasDirectory) ?? undefined);
      addEdge(symbol, nodeId, executive.role ?? "executive", "corporate", `${executive.name} career link`);
      interlocks.set(cleanName, (interlocks.get(cleanName) ?? 0) + 1);
    }
  }

  return {
    nodes,
    edges,
    summary: [...interlocks.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, symbol: inferTickerFromText(name, aliasDirectory) ?? null })),
  };
}

function buildIndexMembershipGraph(symbol, indices = []) {
  const nodes = [];
  const edges = [];

  for (const item of indices ?? []) {
    const label = item?.label ?? null;
    if (!label) {
      continue;
    }
    const id = `index:${templateKey(label)}`;
    if (!nodes.find((node) => node.id === id)) {
      nodes.push({
        id,
        label,
        kind: "ecosystem",
        symbol: item.vehicle ?? undefined,
      });
    }
    edges.push({
      source: symbol,
      target: id,
      relation: "index membership",
      domain: "ecosystem",
      label: item.note ?? `Current membership via ${item.source ?? "public source"}`,
      weight: 2,
    });
  }

  return { nodes, edges };
}

function summarizeMacroDashboard(macro, yieldCurve) {
  const cards = [
    {
      label: "Unemployment",
      value: macro?.unemploymentRate?.display ?? "n/a",
      note: macro?.unemploymentRate?.date ? `BLS ${macro.unemploymentRate.date}` : "BLS",
    },
    {
      label: "Inflation YoY",
      value: macro?.inflationYoY?.display ?? "n/a",
      note: macro?.inflationYoY?.date ? `BLS ${macro.inflationYoY.date}` : "BLS",
    },
    {
      label: "Payrolls",
      value: macro?.nonfarmPayrolls?.display ?? "n/a",
      note: macro?.nonfarmPayrolls?.date ? `BLS ${macro.nonfarmPayrolls.date}` : "BLS",
    },
    {
      label: "Curve As Of",
      value: yieldCurve?.asOf ?? "n/a",
      note: "Treasury",
    },
  ];
  const curve = (yieldCurve?.points ?? []).slice(0, 8).map((point) => ({
    tenor: point.tenor ?? point.label ?? "n/a",
    value: point.value ?? point.rate ?? null,
  }));
  return {
    cards,
    curve,
    invertedSegments: countInvertedCurveSegments(curve),
  };
}

function countInvertedCurveSegments(points = []) {
  let count = 0;
  for (let index = 1; index < points.length; index += 1) {
    if (numeric(points[index - 1]?.value) != null && numeric(points[index]?.value) != null && points[index].value < points[index - 1].value) {
      count += 1;
    }
  }
  return count;
}

function inferMonitorInterval(range) {
  const clean = String(range ?? "").trim();
  if (clean === "1d") {
    return "5m";
  }
  if (clean === "1w") {
    return "30m";
  }
  if (clean === "1mo") {
    return "1d";
  }
  if (clean === "3mo") {
    return "1d";
  }
  if (clean === "6mo") {
    return "1d";
  }
  return "1wk";
}

function dedupeBySymbol(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    const key = String(item?.symbol ?? "").trim().toUpperCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function normalizeDateKey(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : null;
}

function compareDatesDescending(left, right) {
  const leftTime = Date.parse(left ?? "");
  const rightTime = Date.parse(right ?? "");
  if (!Number.isFinite(leftTime) && !Number.isFinite(rightTime)) {
    return 0;
  }
  if (!Number.isFinite(leftTime)) {
    return 1;
  }
  if (!Number.isFinite(rightTime)) {
    return -1;
  }
  return rightTime - leftTime;
}

function compareDatesAscending(left, right) {
  const leftTime = Date.parse(left ?? "");
  const rightTime = Date.parse(right ?? "");
  if (!Number.isFinite(leftTime) && !Number.isFinite(rightTime)) {
    return 0;
  }
  if (!Number.isFinite(leftTime)) {
    return 1;
  }
  if (!Number.isFinite(rightTime)) {
    return -1;
  }
  return leftTime - rightTime;
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
  if (weight >= 7) {
    return 5;
  }
  if (weight >= 4) {
    return 4;
  }
  if (weight >= 2) {
    return 3;
  }
  if (weight >= 0.75) {
    return 2;
  }
  return 1;
}

function heatmapRowSpan(weight) {
  if (!Number.isFinite(weight)) {
    return 1;
  }
  if (weight >= 7) {
    return 4;
  }
  if (weight >= 4) {
    return 3;
  }
  if (weight >= 1.5) {
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

function normalizeAiUniverse(value) {
  return String(value ?? "").trim().toLowerCase() === "sp500" ? "sp500" : "sp500";
}

function normalizeAiHorizon(value) {
  return String(value ?? "").trim().toLowerCase() === "1-4w" ? "1-4w" : "1-4w";
}

function clampAiIdeaCount(value, fallback = 20) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(parsed), 5), 20);
}

function buildAiCandidateUniverse(heatmap) {
  const tiles = (heatmap?.tiles ?? []).filter(
    (item) => item?.symbol && Number.isFinite(item?.price) && Number.isFinite(item?.changePercent),
  );
  const sectorMap = new Map((heatmap?.sectors ?? []).map((item) => [normalizeSectorKey(item.sector), item]));
  const moveValues = tiles.map((item) => numeric(item.changePercent)).filter(Number.isFinite);
  const weightValues = tiles.map((item) => numeric(item.weight)).filter(Number.isFinite);
  const volumeValues = tiles.map((item) => numeric(item.volume)).filter(Number.isFinite);
  const sectorMoveValues = (heatmap?.sectors ?? []).map((item) => numeric(item.averageMove)).filter(Number.isFinite);

  return tiles.map((item) => {
    const sectorSummary = sectorMap.get(normalizeSectorKey(item.sector)) ?? null;
    const sectorAverageMove = numeric(sectorSummary?.averageMove) ?? 0;
    const moveRank = percentileRank(moveValues, numeric(item.changePercent));
    const sectorRank = percentileRank(sectorMoveValues, sectorAverageMove);
    const weightRank = percentileRank(weightValues, numeric(item.weight));
    const volumeRank = percentileRank(volumeValues, numeric(item.volume));

    return {
      ...item,
      sectorAverageMove,
      bullishScore: moveRank * 0.6 + sectorRank * 0.25 + weightRank * 0.1 + volumeRank * 0.05,
      bearishScore: (1 - moveRank) * 0.6 + (1 - sectorRank) * 0.25 + weightRank * 0.1 + volumeRank * 0.05,
    };
  });
}

function percentileRank(values, target) {
  const valid = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (!valid.length || !Number.isFinite(target)) {
    return 0.5;
  }
  let index = 0;
  while (index < valid.length && valid[index] <= target) {
    index += 1;
  }
  if (valid.length === 1) {
    return 1;
  }
  return (index - 1) / (valid.length - 1);
}

function selectAiCandidates(candidates, scoreKey, limit) {
  const sorted = [...candidates].sort((left, right) => (numeric(right?.[scoreKey]) ?? 0) - (numeric(left?.[scoreKey]) ?? 0));
  const sectorCounts = new Map();
  const selected = [];

  for (const item of sorted) {
    const sectorKey = normalizeSectorKey(item.sector) || "unclassified";
    const currentCount = sectorCounts.get(sectorKey) ?? 0;
    if (currentCount >= 5) {
      continue;
    }
    selected.push(item);
    sectorCounts.set(sectorKey, currentCount + 1);
    if (selected.length >= limit) {
      return selected;
    }
  }

  for (const item of sorted) {
    if (selected.some((entry) => entry.symbol === item.symbol)) {
      continue;
    }
    selected.push(item);
    if (selected.length >= limit) {
      break;
    }
  }

  return selected.slice(0, limit);
}

function buildSectorPeerMap(tiles = []) {
  const map = new Map();
  for (const tile of tiles) {
    const key = normalizeSectorKey(tile?.sector);
    if (!key) {
      continue;
    }
    const bucket = map.get(key) ?? [];
    bucket.push(tile.symbol);
    map.set(key, bucket);
  }
  return map;
}

function buildAiIdeaEvidence({ symbol, tile, company, earnings, history, sectorSummary }) {
  const closes = (history ?? []).map((point) => numeric(point.close)).filter(Number.isFinite);
  const firstClose = closes[0] ?? null;
  const lastClose = closes.at(-1) ?? null;
  const oneMonthChange =
    Number.isFinite(firstClose) && Number.isFinite(lastClose) && firstClose > 0
      ? ((lastClose - firstClose) / firstClose) * 100
      : null;
  const latestFiling = company?.sec?.filings?.[0] ?? null;

  return {
    symbol,
    name: tile?.name ?? company?.market?.shortName ?? company?.sec?.title ?? symbol,
    sector: company?.market?.sector ?? tile?.sector ?? "Unclassified",
    industry: company?.market?.industry ?? null,
    price: tile?.price ?? null,
    dayChangePercent: tile?.changePercent ?? null,
    oneMonthChange,
    sectorAverageMove: numeric(sectorSummary?.averageMove),
    sectorWeight: numeric(sectorSummary?.weight),
    marketCap: company?.market?.marketCap ?? tile?.marketCap ?? null,
    volume: tile?.volume ?? null,
    weight: tile?.weight ?? null,
    analystRating: company?.market?.analystRating ?? earnings?.estimates?.recommendation ?? null,
    trailingPe: company?.market?.trailingPe ?? null,
    forwardPe: company?.market?.forwardPe ?? null,
    shortRatio: company?.market?.shortRatio ?? null,
    earningsWindow: {
      start: earnings?.earningsWindow?.start ?? null,
      end: earnings?.earningsWindow?.end ?? null,
    },
    latestFiling: latestFiling
      ? {
          form: latestFiling.form ?? null,
          filingDate: latestFiling.filingDate ?? null,
        }
      : null,
    summary: truncateText(company?.market?.businessSummary ?? "", 180),
    warnings: [...(company?.warnings ?? [])].slice(0, 2),
  };
}

function buildAiMarketContext({ heatmap, pulse, macro, yieldCurve, horizon }) {
  const sectorLeaders = [...(heatmap?.sectors ?? [])]
    .filter((item) => Number.isFinite(item.averageMove))
    .sort((left, right) => right.averageMove - left.averageMove)
    .slice(0, 2)
    .map((item) => `${item.sector} ${formatSignedPercent(item.averageMove)}`);
  const sectorLaggards = [...(heatmap?.sectors ?? [])]
    .filter((item) => Number.isFinite(item.averageMove))
    .sort((left, right) => left.averageMove - right.averageMove)
    .slice(0, 2)
    .map((item) => `${item.sector} ${formatSignedPercent(item.averageMove)}`);
  const pulseLeaders = (pulse?.leaders ?? []).slice(0, 2).map((item) => `${item.symbol} ${formatSignedPercent(item.changePercent)}`);
  const pulseLaggards = (pulse?.laggards ?? []).slice(0, 2).map((item) => `${item.symbol} ${formatSignedPercent(item.changePercent)}`);
  const macroCards = (macro?.cards ?? [])
    .slice(0, 3)
    .map((card) => `${card.label}: ${card.value ?? "n/a"}`);
  const curveSummary = summarizeCurveShape(yieldCurve?.points ?? []);

  return {
    universe: "S&P 500",
    horizon: horizon === "1-4w" ? "1-4 weeks" : horizon,
    asOf: heatmap?.asOf ?? new Date().toISOString(),
    sectorLeaders,
    sectorLaggards,
    pulseLeaders,
    pulseLaggards,
    macroCards,
    curveSummary,
  };
}

function buildAiPrompt({ horizon, context, bullishCandidates, bearishCandidates, bullishCount, bearishCount }) {
  const payload = {
    task: "Rank S&P 500 long and short ideas using only supplied data.",
    horizon: horizon === "1-4w" ? "1-4 weeks" : horizon,
    output: {
      bullish: bullishCount,
      bearish: bearishCount,
      schema: ["symbol", "thesis", "reasons[3]", "risk", "confidence"],
    },
    rules: [
      "Only use symbols from candidate lists.",
      "Keep reasons short and evidence-based.",
      "Return strict JSON only with keys marketView, bullish, bearish.",
    ],
    context,
    bullish: bullishCandidates.map(compactAiCandidateForPrompt),
    bearish: bearishCandidates.map(compactAiCandidateForPrompt),
  };

  return `Return strict JSON only.\n${JSON.stringify(payload)}`;
}

function compactAiCandidateForPrompt(candidate) {
  return {
    symbol: candidate.symbol,
    sector: candidate.sector,
    px: candidate.price,
    d1: candidate.dayChangePercent,
    m1: candidate.oneMonthChange,
    sectorMove: candidate.sectorAverageMove,
    weight: candidate.weight,
    cap: candidate.marketCap,
    vol: candidate.volume,
    rating: candidate.analystRating,
    pe: candidate.trailingPe,
    fpe: candidate.forwardPe,
    short: candidate.shortRatio,
    earn: candidate.earningsWindow,
    filing: candidate.latestFiling,
  };
}

function normalizeAiIdeasOutput(raw, data, counts) {
  const bullishMap = new Map(data.bullishCandidates.map((item) => [item.symbol, item]));
  const bearishMap = new Map(data.bearishCandidates.map((item) => [item.symbol, item]));
  const marketViewSource = raw?.marketView ?? raw?.market_view ?? {};
  const marketView = {
    summary:
      cleanAiText(marketViewSource.summary)
      ?? `${data.context.sectorLeaders[0] ?? "Market"} leads while ${data.context.sectorLaggards[0] ?? "other sectors"} lag.`,
    bullishBias:
      cleanAiText(marketViewSource.bullishBias ?? marketViewSource.bullish_bias)
      ?? "Favor liquid names with positive tape and supportive sector context.",
    bearishBias:
      cleanAiText(marketViewSource.bearishBias ?? marketViewSource.bearish_bias)
      ?? "Be cautious with names underperforming weak sectors or carrying deteriorating tape signals.",
    risks: cleanAiStringList(marketViewSource.risks, 4),
    monitor: cleanAiStringList(marketViewSource.monitor ?? raw?.monitor, 5),
  };

  return {
    marketView,
    bullish: coerceAiIdeaList(raw?.bullish, data.bullishCandidates, bullishMap, counts.bullishCount, "bullish"),
    bearish: coerceAiIdeaList(raw?.bearish, data.bearishCandidates, bearishMap, counts.bearishCount, "bearish"),
    warnings: [],
  };
}

function coerceAiIdeaList(rawItems, orderedCandidates, candidateMap, limit, side) {
  const source = Array.isArray(rawItems) ? rawItems : [];
  const items = [];
  const seen = new Set();

  for (const entry of source) {
    const symbol = String(entry?.symbol ?? "").trim().toUpperCase();
    const candidate = candidateMap.get(symbol);
    if (!candidate || seen.has(symbol)) {
      continue;
    }
    seen.add(symbol);
    items.push({
      ...candidate,
      thesis: cleanAiText(entry?.thesis) ?? defaultAiThesis(candidate, side),
      reasons: cleanAiStringList(entry?.reasons, 3).length ? cleanAiStringList(entry?.reasons, 3) : buildFallbackReasons(candidate, side),
      risk: cleanAiText(entry?.risk) ?? buildFallbackRisk(candidate, side),
      confidence: normalizeAiConfidence(entry?.confidence, candidate, side),
    });
    if (items.length >= limit) {
      return items;
    }
  }

  for (const candidate of orderedCandidates) {
    if (seen.has(candidate.symbol)) {
      continue;
    }
    items.push(buildFallbackAiIdea(candidate, side));
    if (items.length >= limit) {
      break;
    }
  }

  return items;
}

function buildDeterministicAiIdeas(data, counts, warning) {
  return {
    marketView: {
      summary: `${data.context.sectorLeaders[0] ?? "Leadership"} is setting the tape while ${data.context.sectorLaggards[0] ?? "laggards"} remain under pressure.`,
      bullishBias: "Prefer liquid names with positive short-term trend, stronger sector backdrop, and supportive earnings posture.",
      bearishBias: "Lean against names with weak tape, soft sector context, or deteriorating positioning ahead of the next 1-4 weeks.",
      risks: [
        warning,
        "Public earnings and analyst fields can be incomplete for some symbols.",
      ].filter(Boolean),
      monitor: [
        ...data.context.sectorLeaders.slice(0, 2),
        ...data.context.sectorLaggards.slice(0, 2),
        data.context.curveSummary,
      ].filter(Boolean).slice(0, 5),
    },
    bullish: data.bullishCandidates.slice(0, counts.bullishCount).map((candidate) => buildFallbackAiIdea(candidate, "bullish")),
    bearish: data.bearishCandidates.slice(0, counts.bearishCount).map((candidate) => buildFallbackAiIdea(candidate, "bearish")),
    warnings: [warning].filter(Boolean),
  };
}

function buildFallbackAiIdea(candidate, side) {
  return {
    ...candidate,
    thesis: defaultAiThesis(candidate, side),
    reasons: buildFallbackReasons(candidate, side),
    risk: buildFallbackRisk(candidate, side),
    confidence: normalizeAiConfidence(null, candidate, side),
  };
}

function defaultAiThesis(candidate, side) {
  if (side === "bullish") {
    return `${candidate.symbol} is showing stronger tape than much of the index, with supportive sector and liquidity context for the next 1-4 weeks.`;
  }
  return `${candidate.symbol} is underperforming the broader tape, with weaker sector context and downside sensitivity over the next 1-4 weeks.`;
}

function buildFallbackReasons(candidate, side) {
  const reasons = [];
  if (Number.isFinite(candidate.dayChangePercent)) {
    reasons.push(`Day move ${formatSignedPercent(candidate.dayChangePercent)} versus a ${formatSignedPercent(candidate.sectorAverageMove)} sector backdrop.`);
  }
  if (Number.isFinite(candidate.oneMonthChange)) {
    reasons.push(`1M trend ${formatSignedPercent(candidate.oneMonthChange)} keeps the ${side === "bullish" ? "momentum" : "pressure"} signal live.`);
  }
  if (candidate.analystRating) {
    reasons.push(`Street stance reads ${candidate.analystRating}.`);
  } else if (candidate.earningsWindow?.start) {
    reasons.push(`Earnings window starts ${formatShortDate(candidate.earningsWindow.start)}.`);
  } else if (Number.isFinite(candidate.marketCap)) {
    reasons.push(`Large-cap footprint at ${formatCompactNumber(candidate.marketCap)} market value keeps liquidity strong.`);
  }

  while (reasons.length < 3) {
    if (candidate.latestFiling?.form) {
      reasons.push(`Recent ${candidate.latestFiling.form} filing adds fresh public disclosure context.`);
    } else if (Number.isFinite(candidate.weight)) {
      reasons.push(`Index weight ${formatSignedPercent(candidate.weight)} keeps the name relevant in sector rotation.`);
    } else {
      reasons.push("Public tape and sector rotation remain the main live signal drivers.");
    }
  }

  return reasons.slice(0, 3);
}

function buildFallbackRisk(candidate, side) {
  if (candidate.earningsWindow?.start) {
    return `Upcoming earnings around ${formatShortDate(candidate.earningsWindow.start)} can quickly change the ${side} setup.`;
  }
  if (Number.isFinite(candidate.shortRatio) && candidate.shortRatio >= 3) {
    return "Short-interest pressure can amplify reversals if the tape squeezes unexpectedly.";
  }
  return "Public-feed momentum can reverse quickly if sector leadership changes or macro risk reprices.";
}

function normalizeAiConfidence(value, candidate, side) {
  const clean = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["high", "medium", "low"].includes(clean)) {
    return clean;
  }
  const signal = side === "bullish"
    ? Math.abs(numeric(candidate.dayChangePercent) ?? 0) + Math.abs(numeric(candidate.oneMonthChange) ?? 0)
    : Math.abs(numeric(candidate.dayChangePercent) ?? 0) + Math.abs(numeric(candidate.oneMonthChange) ?? 0);
  if (signal >= 12) {
    return "high";
  }
  if (signal >= 5) {
    return "medium";
  }
  return "low";
}

function cleanAiStringList(value, limit) {
  return (Array.isArray(value) ? value : [])
    .map((entry) => cleanAiText(entry))
    .filter(Boolean)
    .slice(0, limit);
}

function cleanAiText(value) {
  const text = String(value ?? "").trim();
  return text ? text.replace(/\s+/g, " ") : null;
}

function truncateText(value, limit = 180) {
  const clean = cleanAiText(value);
  if (!clean) {
    return null;
  }
  return clean.length > limit ? `${clean.slice(0, limit - 1).trimEnd()}…` : clean;
}

function summarizeCurveShape(points = []) {
  const twoYear = points.find((point) => /2\s*yr/i.test(point.tenor ?? ""));
  const tenYear = points.find((point) => /10\s*yr/i.test(point.tenor ?? ""));
  if (Number.isFinite(twoYear?.value) && Number.isFinite(tenYear?.value)) {
    const spread = tenYear.value - twoYear.value;
    return `2Y/10Y spread ${formatSignedPercent(spread)}.`;
  }
  return "Treasury curve context unavailable.";
}

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatCompactNumber(value) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  return `${value.toFixed(0)}`;
}

function buildAiSnapshotKey({ universe, horizon, bullishCount, bearishCount, snapshotDate }) {
  return [snapshotDate, universe, horizon, bullishCount, bearishCount].join(":");
}

function getVisibleAiSnapshotDate(now = new Date()) {
  const parts = getZonedDateParts(now, config.aiDailyTimezone);
  if (parts.hour > config.aiDailyHour || (parts.hour === config.aiDailyHour && parts.minute >= config.aiDailyMinute)) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const prior = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const priorParts = getZonedDateParts(prior, config.aiDailyTimezone);
  return `${priorParts.year}-${priorParts.month}-${priorParts.day}`;
}

function getScheduledAiRunDate(now = new Date()) {
  const parts = getZonedDateParts(now, config.aiDailyTimezone);
  if (parts.hour > config.aiDailyHour || (parts.hour === config.aiDailyHour && parts.minute >= config.aiDailyMinute)) {
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  return null;
}

function getAiSnapshotScheduleLabel() {
  const hour = String(config.aiDailyHour).padStart(2, "0");
  const minute = String(config.aiDailyMinute).padStart(2, "0");
  return `${hour}:${minute} ${config.aiDailyTimezone}`;
}

function getZonedDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}
