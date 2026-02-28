import test from "node:test";
import assert from "node:assert/strict";

import { parseConstituentTable } from "../src/providers/indices.mjs";

test("parseConstituentTable extracts symbol and company rows from generic public tables", () => {
  const rows = parseConstituentTable(`
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Company</th>
          <th>Sector</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AAPL</td>
          <td>Apple Inc.</td>
          <td>Technology</td>
        </tr>
        <tr>
          <td>MSFT</td>
          <td>Microsoft Corporation</td>
          <td>Technology</td>
        </tr>
      </tbody>
    </table>
  `);

  assert.equal(rows.length, 0);
});

test("parseConstituentTable returns rows when a constituent table is large enough", () => {
  const body = Array.from({ length: 20 }, (_, index) => `
    <tr>
      <td>SYM${index}</td>
      <td>Company ${index}</td>
      <td>Sector ${index}</td>
    </tr>
  `).join("");

  const rows = parseConstituentTable(`
    <table>
      <tr><th>Ticker</th><th>Company Name</th><th>Sector</th></tr>
      ${body}
    </table>
  `);

  assert.equal(rows.length, 20);
  assert.equal(rows[0].symbol, "SYM0");
  assert.equal(rows[0].name, "Company 0");
});
