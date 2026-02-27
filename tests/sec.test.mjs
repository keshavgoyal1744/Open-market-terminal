import test from "node:test";
import assert from "node:assert/strict";

import { getCompanySnapshot } from "../src/providers/sec.mjs";

test("SEC company snapshot includes direct filing references", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("company_tickers.json")) {
      return jsonResponse(200, {
        0: {
          ticker: "AAPL",
          title: "Apple Inc.",
          cik_str: 320193,
        },
      });
    }
    if (href.includes("submissions/CIK0000320193.json")) {
      return jsonResponse(200, {
        filings: {
          recent: {
            accessionNumber: ["0000320193-26-000010"],
            form: ["8-K"],
            filingDate: ["2026-02-10"],
            reportDate: ["2026-02-10"],
            primaryDocument: ["a8-k20260210.htm"],
            primaryDocDescription: ["Current report"],
          },
        },
      });
    }
    if (href.includes("companyfacts/CIK0000320193.json")) {
      return jsonResponse(200, { facts: {} });
    }
    throw new Error(`Unexpected URL: ${href}`);
  };

  const snapshot = await getCompanySnapshot("AAPL");

  assert.equal(snapshot.filings.length, 1);
  assert.equal(
    snapshot.filings[0].filingUrl,
    "https://www.sec.gov/Archives/edgar/data/320193/000032019326000010/a8-k20260210.htm",
  );
  assert.equal(
    snapshot.filings[0].filingIndexUrl,
    "https://www.sec.gov/Archives/edgar/data/320193/000032019326000010/0000320193-26-000010-index.html",
  );
});

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    async text() {
      return JSON.stringify(payload);
    },
  };
}
