import test from "node:test";
import assert from "node:assert/strict";

import { getCompanyOverview, getEarningsDetails, getOptions, getQuotes } from "../src/providers/yahoo.mjs";

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

test("earnings details parses trend and surprise history", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("/v10/finance/quoteSummary/NVDA")) {
      return jsonResponse(200, {
        quoteSummary: {
          result: [
            {
              price: {
                symbol: "NVDA",
                shortName: "NVIDIA Corporation",
              },
              calendarEvents: {
                earnings: {
                  earningsDate: [{ raw: 1772236800, fmt: "2026-02-28" }],
                },
              },
              financialData: {
                earningsAverage: { raw: 1.2 },
                earningsLow: { raw: 1.1 },
                earningsHigh: { raw: 1.3 },
                revenueEstimate: { raw: 45000000000 },
                recommendationKey: "buy",
              },
              earningsHistory: {
                history: [
                  {
                    quarter: { raw: 1764547200, fmt: "2025-12-01" },
                    epsEstimate: { raw: 0.88 },
                    epsActual: { raw: 0.95 },
                    surprisePercent: { raw: 7.95 },
                  },
                ],
              },
              earningsTrend: {
                trend: [
                  {
                    period: "0q",
                    endDate: { raw: 1772236800, fmt: "2026-02-28" },
                    earningsEstimate: {
                      avg: { raw: 1.2 },
                      low: { raw: 1.1 },
                      high: { raw: 1.3 },
                      numberOfAnalysts: { raw: 22 },
                    },
                    revenueEstimate: {
                      avg: { raw: 45000000000 },
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const earnings = await getEarningsDetails("NVDA");

  assert.equal(earnings.symbol, "NVDA");
  assert.equal(earnings.earningsAverage, 1.2);
  assert.equal(earnings.history[0].epsActual, 0.95);
  assert.equal(earnings.trend[0].earningsEstimate.numberOfAnalysts, 22);
});

test("options fall back to Yahoo public HTML when JSON chain endpoints are unauthorized", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("query1.finance.yahoo.com/v7/finance/options/AAPL")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "Invalid Crumb",
          },
        },
      });
    }

    if (href.includes("query2.finance.yahoo.com/v7/finance/options/AAPL")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "Invalid Crumb",
          },
        },
      });
    }

    if (href.includes("finance.yahoo.com/quote/AAPL/options")) {
      return htmlResponse(200, `
        <html>
          <body>
            <script id="__NEXT_DATA__" type="application/json">
              ${JSON.stringify({
                props: {
                  pageProps: {
                    optionChain: {
                      result: [
                        {
                          underlyingSymbol: "AAPL",
                          expirationDates: [1772236800],
                          quote: {
                            symbol: "AAPL",
                            shortName: "Apple Inc.",
                            quoteType: "EQUITY",
                            regularMarketPrice: 200,
                            regularMarketVolume: 1000,
                          },
                          options: [
                            {
                              calls: [
                                {
                                  contractSymbol: "AAPL260228C00200000",
                                  strike: 200,
                                  lastPrice: 5.5,
                                  bid: 5.4,
                                  ask: 5.6,
                                  impliedVolatility: 0.24,
                                  volume: 120,
                                  openInterest: 900,
                                  inTheMoney: false,
                                },
                              ],
                              puts: [
                                {
                                  contractSymbol: "AAPL260228P00200000",
                                  strike: 200,
                                  lastPrice: 4.2,
                                  bid: 4.1,
                                  ask: 4.3,
                                  impliedVolatility: 0.22,
                                  volume: 80,
                                  openInterest: 700,
                                  inTheMoney: false,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              })}
            </script>
          </body>
        </html>
      `);
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const options = await getOptions("AAPL");

  assert.equal(options.symbol, "AAPL");
  assert.equal(options.calls.length, 1);
  assert.equal(options.puts.length, 1);
  assert.equal(options.calls[0].strike, 200);
  assert.equal(options.puts[0].openInterest, 700);
});

test("company overview falls back to Yahoo public HTML for holder rows when summary endpoints are unauthorized", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("/v10/finance/quoteSummary/AAPL")) {
      return jsonResponse(401, {
        finance: {
          result: null,
          error: {
            code: "Unauthorized",
            description: "Invalid Crumb",
          },
        },
      });
    }

    if (href.includes("finance.yahoo.com/quote/AAPL")) {
      return htmlResponse(200, `
        <html>
          <body>
            <script id="__NEXT_DATA__" type="application/json">
              ${JSON.stringify({
                props: {
                  pageProps: {
                    quoteSummary: {
                      result: [
                        {
                          price: {
                            symbol: "AAPL",
                            shortName: "Apple Inc.",
                            quoteType: "EQUITY",
                            exchangeName: "NMS",
                          },
                          summaryDetail: {
                            marketCap: { raw: 3000000000000 },
                            trailingPE: { raw: 28.5 },
                          },
                          majorHoldersBreakdown: {
                            institutionsPercentHeld: { raw: 0.61 },
                            insidersPercentHeld: { raw: 0.02 },
                          },
                          institutionOwnership: {
                            ownershipList: [
                              {
                                organization: "BlackRock, Inc.",
                                position: { raw: 120000000 },
                                pctHeld: { raw: 0.07 },
                                reportDate: "2026-01-31",
                              },
                            ],
                          },
                          fundOwnership: {
                            ownershipList: [
                              {
                                organization: "Vanguard Group, Inc.",
                                position: { raw: 110000000 },
                                pctHeld: { raw: 0.065 },
                                reportDate: "2026-01-31",
                              },
                            ],
                          },
                          assetProfile: {
                            sector: "Technology",
                            industry: "Consumer Electronics",
                            companyOfficers: [],
                          },
                        },
                      ],
                    },
                  },
                },
              })}
            </script>
          </body>
        </html>
      `);
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const overview = await getCompanyOverview("AAPL");

  assert.equal(overview.symbol, "AAPL");
  assert.equal(overview.topInstitutionalHolders[0].holder, "BlackRock, Inc.");
  assert.equal(overview.topFundHolders[0].holder, "Vanguard Group, Inc.");
  assert.equal(overview.institutionPercentHeld, 0.61);
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

function htmlResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Unauthorized",
    async text() {
      return payload;
    },
  };
}
