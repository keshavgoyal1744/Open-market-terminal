import test from "node:test";
import assert from "node:assert/strict";

import { getSp500Universe, parseWikipediaConstituents } from "../src/providers/sp500.mjs";

test("wikipedia fallback parser extracts S&P 500 constituents", () => {
  const rows = parseWikipediaConstituents(`
    <table id="constituents">
      <tr>
        <th>Symbol</th>
        <th>Security</th>
        <th>GICS Sector</th>
      </tr>
      <tr>
        <td>BRK.B</td>
        <td>Berkshire Hathaway</td>
        <td>Financials</td>
      </tr>
      <tr>
        <td>MSFT</td>
        <td>Microsoft</td>
        <td>Information Technology</td>
      </tr>
    </table>
  `);

  assert.deepEqual(rows, [
    {
      symbol: "BRK-B",
      name: "Berkshire Hathaway",
      sector: "Financials",
      weight: null,
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      sector: "Information Technology",
      weight: null,
    },
  ]);
});

test("S&P 500 universe falls back to live wikipedia table when workbook source is unavailable", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.endsWith(".xlsx")) {
      return textResponse(404, "missing");
    }
    if (href.includes("List_of_S%26P_500_companies")) {
      return textResponse(200, `
        <table id="constituents">
          <tr>
            <th>Symbol</th>
            <th>Security</th>
            <th>GICS Sector</th>
          </tr>
          <tr>
            <td>AAPL</td>
            <td>Apple Inc.</td>
            <td>Information Technology</td>
          </tr>
          <tr>
            <td>MSFT</td>
            <td>Microsoft Corp.</td>
            <td>Information Technology</td>
          </tr>
        </table>
      `);
    }
    throw new Error(`Unexpected URL: ${href}`);
  };

  const payload = await getSp500Universe();

  assert.equal(payload.source.id, "wikipedia-sp500");
  assert.equal(payload.constituents.length, 2);
  assert.equal(payload.constituents[0].symbol, "AAPL");
  assert.match(payload.warnings[0], /State Street holdings unavailable/i);
});

function textResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    async text() {
      return payload;
    },
  };
}
