import { config } from "./config.mjs";
import { getCuratedIntelligence, listSupportedIntelligenceSymbols } from "./intelligence-graph.mjs";
import { getMacroSnapshot } from "./providers/bls.mjs";
import { getOrderBook, getTicker } from "./providers/coinbase.mjs";
import { getCompanySnapshot } from "./providers/sec.mjs";
import { getYieldCurve } from "./providers/treasury.mjs";
import { getCompanyOverview, getHistory, getOptions, getQuotes } from "./providers/yahoo.mjs";

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
      () => getHistory(symbol, range, interval),
      { ttlMs: config.historyTtlMs, staleMs: config.historyTtlMs * 2 },
    );
  }

  async getOptions(symbol, expiration) {
    const suffix = expiration ?? "front";
    return this.cache.getOrSet(
      `options:${symbol}:${suffix}`,
      () => getOptions(symbol, expiration),
      { ttlMs: config.quoteTtlMs, staleMs: config.quoteTtlMs * 4 },
    );
  }

  async getCompany(symbol) {
    return this.cache.getOrSet(
      `company:${symbol}`,
      async () => {
        const [sec, market] = await Promise.all([getCompanySnapshot(symbol), getCompanyOverview(symbol)]);
        return {
          symbol: symbol.toUpperCase(),
          sec,
          market,
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
        const company = await this.getCompany(symbol);
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
