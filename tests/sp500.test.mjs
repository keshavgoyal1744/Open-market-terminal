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

test("S&P 500 universe backfills missing workbook sectors from wikipedia and normalizes labels", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  const workbookRows = [["Ticker", "Name", "Weight"], ["AAPL", "Apple Inc.", "7.1"], ["MSFT", "Microsoft Corp.", "6.8"], ["JPM", "JPMorgan Chase", "1.4"]];
  for (let index = 0; index < 401; index += 1) {
    workbookRows.push([`X${String(index).padStart(3, "0")}`, `Company ${index}`, "0.01"]);
  }

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.endsWith(".xlsx")) {
      return workbookResponse(buildWorkbookXml({
        rows: workbookRows,
      }));
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
          <tr>
            <td>JPM</td>
            <td>JPMorgan Chase</td>
            <td>Financials</td>
          </tr>
        </table>
      `);
    }
    throw new Error(`Unexpected URL: ${href}`);
  };

  const payload = await getSp500Universe();

  assert.equal(payload.source.id, "ssga-spy-holdings");
  assert.ok(payload.constituents.length >= 404);
  assert.equal(payload.constituents.find((item) => item.symbol === "AAPL")?.sector, "Technology");
  assert.equal(payload.constituents.find((item) => item.symbol === "JPM")?.sector, "Financial Services");
});

test("S&P 500 universe treats placeholder sector values as missing and backfills them", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  const workbookRows = [["Ticker", "Name", "Sector", "Weight"], ["XOM", "Exxon Mobil", "-", "1.1"], ["CVX", "Chevron", "-", "0.6"]];
  for (let index = 0; index < 399; index += 1) {
    workbookRows.push([`X${String(index).padStart(3, "0")}`, `Company ${index}`, "-", "0.01"]);
  }

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.endsWith(".xlsx")) {
      return workbookResponse(buildWorkbookXml({
        rows: workbookRows,
      }));
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
            <td>XOM</td>
            <td>Exxon Mobil</td>
            <td>Energy</td>
          </tr>
          <tr>
            <td>CVX</td>
            <td>Chevron</td>
            <td>Energy</td>
          </tr>
        </table>
      `);
    }
    throw new Error(`Unexpected URL: ${href}`);
  };

  const payload = await getSp500Universe();

  assert.equal(payload.constituents.find((item) => item.symbol === "XOM")?.sector, "Energy");
  assert.equal(payload.constituents.find((item) => item.symbol === "CVX")?.sector, "Energy");
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

function workbookResponse(payload) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    async arrayBuffer() {
      return payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength);
    },
  };
}

function buildWorkbookXml({ rows }) {
  const entries = [
    { name: "xl/sharedStrings.xml", content: buildSharedStrings(rows.flat()) },
    { name: "xl/worksheets/sheet1.xml", content: buildWorksheet(rows) },
  ];

  return buildZip(entries);
}

function buildSharedStrings(values) {
  const unique = [...new Set(values)];
  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
    <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${values.length}" uniqueCount="${unique.length}">
      ${unique.map((value) => `<si><t>${escapeXml(String(value))}</t></si>`).join("")}
    </sst>`,
  );
}

function buildWorksheet(rows) {
  const unique = [...new Set(rows.flat())];
  const indexOf = (value) => unique.indexOf(value);
  const xmlRows = rows.map((row, rowIndex) => `
    <row r="${rowIndex + 1}">
      ${row.map((value, columnIndex) => `<c r="${toColumn(columnIndex)}${rowIndex + 1}" t="s"><v>${indexOf(value)}</v></c>`).join("")}
    </row>
  `).join("");

  return Buffer.from(
    `<?xml version="1.0" encoding="UTF-8"?>
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <sheetData>${xmlRows}</sheetData>
    </worksheet>`,
  );
}

function buildZip(entries) {
  const files = [];
  const directory = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    files.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const directoryBuffer = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directoryBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...files, directoryBuffer, end]);
}

function toColumn(index) {
  let value = index + 1;
  let column = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - 1) / 26);
  }
  return column;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
