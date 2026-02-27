import test from "node:test";
import assert from "node:assert/strict";

import { getCompanyOverview, getQuotes } from "../src/providers/yahoo.mjs";

test("quotes fall back to chart data when Yahoo batch quotes are unauthorized", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("/v7/finance/quote")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "User is unable to access this feature",
          },
        },
      });
    }

    if (href.includes("/v8/finance/chart/AAPL")) {
      return jsonResponse(200, makeChartPayload({
        symbol: "AAPL",
        shortName: "Apple Inc.",
        exchangeName: "NMS",
        currency: "USD",
        regularMarketPrice: 193.5,
        previousClose: 190,
        regularMarketTime: 1709251200,
        regularMarketDayHigh: 194.2,
        regularMarketDayLow: 189.8,
        close: [188, 190, 193.5],
        volume: [100, 110, 125],
      }));
    }

    if (href.includes("/v8/finance/chart/MSFT")) {
      return jsonResponse(200, makeChartPayload({
        symbol: "MSFT",
        shortName: "Microsoft Corp.",
        exchangeName: "NMS",
        currency: "USD",
        regularMarketPrice: 410,
        previousClose: 400,
        regularMarketTime: 1709251200,
        regularMarketDayHigh: 411,
        regularMarketDayLow: 399.5,
        close: [401, 405, 410],
        volume: [200, 240, 260],
      }));
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const quotes = await getQuotes(["AAPL", "MSFT"]);

  assert.equal(quotes.length, 2);
  assert.deepEqual(quotes.map((quote) => quote.symbol), ["AAPL", "MSFT"]);
  assert.equal(quotes[0].price, 193.5);
  assert.equal(quotes[0].change, 3.5);
  assert.equal(quotes[1].changePercent, 2.5);
});

test("company overview falls back to minimal quote data when summary endpoint is unauthorized", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("/v10/finance/quoteSummary/TSM")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "User is unable to access this feature",
          },
        },
      });
    }

    if (href.includes("/v7/finance/quote")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "User is unable to access this feature",
          },
        },
      });
    }

    if (href.includes("/v8/finance/chart/TSM")) {
      return jsonResponse(200, makeChartPayload({
        symbol: "TSM",
        shortName: "Taiwan Semiconductor",
        exchangeName: "NYQ",
        currency: "USD",
        regularMarketPrice: 160,
        previousClose: 155,
        regularMarketTime: 1709251200,
        fiftyTwoWeekHigh: 170,
        fiftyTwoWeekLow: 90,
        close: [150, 155, 160],
        volume: [300, 320, 350],
      }));
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const overview = await getCompanyOverview("TSM");

  assert.equal(overview.symbol, "TSM");
  assert.equal(overview.shortName, "Taiwan Semiconductor");
  assert.equal(overview.exchange, "NYQ");
  assert.equal(overview.fiftyTwoWeekHigh, 170);
  assert.equal(overview.fiftyTwoWeekLow, 90);
  assert.deepEqual(overview.companyOfficers, []);
  assert.deepEqual(overview.topInstitutionalHolders, []);
});

test("company overview extracts earnings dates from calendar events", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("/v10/finance/quoteSummary/MSFT")) {
      return jsonResponse(200, {
        quoteSummary: {
          result: [
            {
              price: {
                symbol: "MSFT",
                shortName: "Microsoft Corporation",
                exchangeName: "NMS",
              },
              summaryDetail: {
                marketCap: { raw: 1000 },
                trailingPE: { raw: 30 },
              },
              financialData: {
                recommendationKey: "buy",
              },
              calendarEvents: {
                earnings: {
                  earningsDate: [
                    { raw: 1772236800, fmt: "2026-02-28" },
                    { raw: 1772323200, fmt: "2026-03-01" },
                  ],
                },
              },
              assetProfile: {
                sector: "Technology",
                industry: "Software",
                longBusinessSummary: "Summary",
                companyOfficers: [],
              },
            },
          ],
        },
      });
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const overview = await getCompanyOverview("MSFT");

  assert.equal(overview.symbol, "MSFT");
  assert.equal(overview.earningsStart, "2026-02-28T00:00:00.000Z");
  assert.equal(overview.earningsEnd, "2026-03-01T00:00:00.000Z");
});

function makeChartPayload({
  symbol,
  shortName,
  exchangeName,
  currency,
  regularMarketPrice,
  previousClose,
  regularMarketTime,
  regularMarketDayHigh,
  regularMarketDayLow,
  fiftyTwoWeekHigh,
  fiftyTwoWeekLow,
  close,
  volume,
}) {
  return {
    chart: {
      result: [
        {
          meta: {
            symbol,
            shortName,
            exchangeName,
            currency,
            regularMarketPrice,
            previousClose,
            regularMarketTime,
            regularMarketDayHigh,
            regularMarketDayLow,
            fiftyTwoWeekHigh,
            fiftyTwoWeekLow,
          },
          indicators: {
            quote: [
              {
                close,
                volume,
                high: close,
                low: close,
                open: close,
              },
            ],
          },
        },
      ],
      error: null,
    },
  };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Unauthorized",
    async text() {
      return JSON.stringify(payload);
    },
  };
}
