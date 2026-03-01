import test from "node:test";
import assert from "node:assert/strict";

import { MarketDataService } from "../src/market.mjs";

const cache = {
  async getOrSet(_key, factory) {
    return factory();
  },
  peek() {
    return null;
  },
};

class StubMarketDataService extends MarketDataService {
  async getPublicPeerUniverse() {
    return ["NVDA", "AMD", "AVGO"];
  }

  async getCompany(symbol) {
    const upper = symbol.toUpperCase();
    return {
      symbol: upper,
      warnings: [],
      sec: {
        title: "Acme Semiconductor Corp",
        filings: [],
        relationshipSignals: {
          insiderFormCount: 3,
          ownershipFormCount: 2,
          dealFormCount: 1,
          insiderForms: [],
          ownershipForms: [],
          dealForms: [],
        },
      },
      market: {
        shortName: "Acme Semiconductor",
        sector: "Technology",
        industry: "Semiconductors",
        website: "https://example.com",
        analystRating: "buy",
        institutionPercentHeld: 0.82,
        insiderPercentHeld: 0.03,
        floatShares: 1_200_000_000,
        sharesShort: 42_000_000,
        shortRatio: 2.7,
        topInstitutionalHolders: [
          {
            holder: "BlackRock",
            shares: 88_000_000,
            pctHeld: 0.073,
            reportDate: "2026-01-31",
          },
        ],
        topFundHolders: [
          {
            holder: "Vanguard",
            shares: 76_000_000,
            pctHeld: 0.063,
            reportDate: "2026-01-31",
          },
        ],
        companyOfficers: [
          {
            name: "Jane Doe",
            title: "Chief Executive Officer",
            totalPay: 12_500_000,
            age: 52,
            yearBorn: 1973,
          },
        ],
        insiderHolders: [
          {
            name: "Jane Doe",
            relation: "CEO",
            positionDirect: 1_400_000,
            latestTransDate: "2026-02-20",
            transactionDescription: "Open market purchase",
          },
        ],
        insiderTransactions: [
          {
            insider: "Jane Doe",
            position: "CEO",
            transactionText: "Bought shares",
            startDate: "2026-02-20",
            shares: 50_000,
          },
        ],
      },
    };
  }

  async getQuotes(symbols) {
    return symbols.map((symbol, index) => ({
      symbol,
      shortName: `${symbol} Holdings`,
      price: 100 + index,
      changePercent: index,
      marketCap: 100_000_000_000 + index,
      exchange: "NMS",
    }));
  }
}

test("company map fallback builds named supplier, ownership, and corporate rows for non-curated symbols", async () => {
  const service = new StubMarketDataService(cache);
  const payload = await service.getCompanyMap("ACME");

  assert.equal(payload.market.sector, "Technology");
  assert.equal(payload.market.industry, "Semiconductors");
  assert.equal(payload.suppliers.some((item) => item.target === "Taiwan Semiconductor Manufacturing"), true);
  assert.equal(payload.customers.some((item) => item.target === "Microsoft"), true);
  assert.equal(payload.holders.some((item) => item.holder === "BlackRock"), true);
  assert.equal(payload.corporate.relations.some((item) => item.target === "Jane Doe"), true);
  assert.equal(payload.corporate.relations.some((item) => item.target === "Beneficial ownership filings"), true);
  assert.equal(payload.competitors.some((item) => item.symbol === "NVDA"), true);
  assert.equal(payload.graph.nodes.some((item) => item.label === "Institutional base"), true);
  assert.equal(payload.graph.nodes.some((item) => item.label === "Beneficial ownership filings"), true);
  assert.equal(payload.graph.nodes.some((item) => item.symbol === "NVDA"), true);
});

test("company map falls back to SEC ownership and insider signals when named rows are unavailable", async () => {
  class SparseOwnershipService extends StubMarketDataService {
    async getCompany(symbol) {
      const company = await super.getCompany(symbol);
      return {
        ...company,
        market: {
          ...company.market,
          institutionPercentHeld: null,
          insiderPercentHeld: null,
          floatShares: null,
          sharesShort: null,
          shortRatio: null,
          topInstitutionalHolders: [],
          topFundHolders: [],
          insiderHolders: [],
          insiderTransactions: [],
        },
        sec: {
          ...company.sec,
          relationshipSignals: {
            insiderFormCount: 2,
            ownershipFormCount: 1,
            dealFormCount: 0,
            insiderForms: [
              { form: "4", filingDate: "2026-02-20", primaryDocument: "form4.xml" },
            ],
            ownershipForms: [
              { form: "SC 13G", filingDate: "2026-02-10", primaryDocument: "sc13g.htm" },
            ],
            dealForms: [],
          },
        },
      };
    }
  }

  const service = new SparseOwnershipService(cache);
  const payload = await service.getCompanyMap("ACME");

  assert.equal(payload.holders.some((item) => item.holder === "Beneficial ownership filings"), true);
  assert.equal(payload.holders.some((item) => item.holder === "Insider filing activity"), true);
  assert.equal(payload.insiderHolders.some((item) => item.name === "Jane Doe"), true);
  assert.equal(payload.insiderTransactions.some((item) => item.position === "4"), true);
});
