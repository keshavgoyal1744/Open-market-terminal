import { inflateRawSync } from "node:zlib";

import { fetchText, fetchWithTimeout } from "../http.mjs";

const SPY_HOLDINGS_URL =
  "https://www.ssga.com/us/en/intermediary/etfs/library-content/products/fund-data/etfs/us/holdings-daily-us-en-spy.xlsx";
const SP500_WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies";

export async function getSp500Universe() {
  const warnings = [];

  try {
    const workbook = await fetchWorkbookBuffer(SPY_HOLDINGS_URL);
    const parsed = parseSpyHoldingsWorkbook(workbook);
    if (parsed.length >= 400) {
      let normalized = normalizeConstituents(parsed);
      if (needsSectorBackfill(normalized)) {
        try {
          const html = await fetchText(SP500_WIKI_URL);
          const fallback = normalizeConstituents(parseWikipediaConstituents(html));
          normalized = applySectorBackfill(normalized, fallback);
        } catch (error) {
          warnings.push(`Wikipedia sector backfill unavailable: ${error.message}`);
        }
      }
      return {
        asOf: new Date().toISOString(),
        source: {
          id: "ssga-spy-holdings",
          label: "State Street SPY Holdings",
          url: SPY_HOLDINGS_URL,
        },
        warnings,
        constituents: normalized,
      };
    }
    warnings.push(`State Street holdings parser returned only ${parsed.length} rows.`);
  } catch (error) {
    warnings.push(`State Street holdings unavailable: ${error.message}`);
  }

  const html = await fetchText(SP500_WIKI_URL);
  const fallback = parseWikipediaConstituents(html);
  if (!fallback.length) {
    throw new Error("Unable to build an S&P 500 universe from the configured public sources.");
  }

  return {
    asOf: new Date().toISOString(),
    source: {
      id: "wikipedia-sp500",
      label: "Wikipedia S&P 500 Constituents",
      url: SP500_WIKI_URL,
    },
    warnings,
    constituents: normalizeConstituents(fallback),
  };
}

async function fetchWorkbookBuffer(url) {
  const response = await fetchWithTimeout(url, {
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream;q=0.9, */*;q=0.5",
    },
  });
  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}: ${payload.slice(0, 120)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export function parseSpyHoldingsWorkbook(buffer) {
  const entries = unzipEntries(buffer);
  const sharedStrings = parseSharedStrings(entries.get("xl/sharedStrings.xml"));
  const worksheetNames = [...entries.keys()].filter((name) => name.startsWith("xl/worksheets/sheet") && name.endsWith(".xml"));

  for (const worksheetName of worksheetNames) {
    const rows = parseWorksheet(entries.get(worksheetName), sharedStrings);
    const holdings = extractHoldingsRows(rows);
    if (holdings.length >= 100) {
      return holdings;
    }
  }

  return [];
}

export function parseWikipediaConstituents(html) {
  const tableMatch = html.match(/<table[^>]*id="constituents"[\s\S]*?<\/table>/i);
  if (!tableMatch) {
    return [];
  }

  const rowMatches = [...tableMatch[0].matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)];
  if (!rowMatches.length) {
    return [];
  }

  let headers = [];
  const holdings = [];
  for (const match of rowMatches) {
    const rowHtml = match[1];
    const cells = [...rowHtml.matchAll(/<(t[hd])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((cell) => cleanupCell(cell[2]));
    if (!cells.length) {
      continue;
    }

    if (!headers.length && /ticker|symbol/i.test(cells.join(" "))) {
      headers = cells.map((value) => normalizeHeader(value));
      continue;
    }

    if (!headers.length || cells.length < 3) {
      continue;
    }

    const record = rowToConstituent(cells, headers);
    if (record) {
      holdings.push(record);
    }
  }

  return holdings;
}

function unzipEntries(buffer) {
  const entries = new Map();
  const directoryOffset = findCentralDirectoryOffset(buffer);
  let offset = directoryOffset;

  while (offset < buffer.length && buffer.readUInt32LE(offset) === 0x02014b50) {
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.toString("utf8", offset + 46, offset + 46 + fileNameLength);

    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const payload = buffer.subarray(dataStart, dataStart + compressedSize);

    if (!fileName.endsWith("/")) {
      const content = compressionMethod === 0 ? payload : inflateRawSync(payload);
      entries.set(fileName, content);
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findCentralDirectoryOffset(buffer) {
  const minOffset = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return buffer.readUInt32LE(offset + 16);
    }
  }
  throw new Error("ZIP central directory not found.");
}

function parseSharedStrings(payload) {
  if (!payload) {
    return [];
  }

  const xml = payload.toString("utf8");
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) => {
    const richText = [...match[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((entry) => decodeXml(entry[1])).join("");
    return richText.trim();
  });
}

function parseWorksheet(payload, sharedStrings) {
  if (!payload) {
    return [];
  }

  const xml = payload.toString("utf8");
  return [...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)].map((match) => {
    const row = [];
    for (const cell of match[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cell[1];
      const body = cell[2];
      const ref = attrs.match(/\br="([A-Z]+)\d+"/)?.[1];
      const column = ref ? columnToIndex(ref) : row.length;
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] ?? null;
      row[column] = parseCellValue(body, type, sharedStrings);
    }
    return row;
  });
}

function parseCellValue(body, type, sharedStrings) {
  if (type === "inlineStr") {
    return decodeXml((body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? "").trim());
  }

  const rawValue = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? "";
  if (!rawValue) {
    return "";
  }

  if (type === "s") {
    return sharedStrings[Number(rawValue)] ?? "";
  }

  const decoded = decodeXml(rawValue.trim());
  const numeric = Number(decoded);
  return Number.isFinite(numeric) && decoded !== "" ? numeric : decoded;
}

function extractHoldingsRows(rows) {
  let headers = null;
  const holdings = [];

  for (const row of rows) {
    const values = row.map((value) => cleanupCell(value)).filter((value) => value !== "");
    if (!values.length) {
      continue;
    }

    if (!headers) {
      const candidate = row.map((value) => normalizeHeader(cleanupCell(value)));
      if (candidate.includes("ticker") && candidate.some((value) => value.includes("weight"))) {
        headers = candidate;
      }
      continue;
    }

    const record = rowToConstituent(row.map((value) => cleanupCell(value)), headers);
    if (record) {
      holdings.push(record);
    }
  }

  return holdings;
}

function rowToConstituent(values, headers) {
  const symbol = readByHeader(values, headers, ["ticker", "symbol"]);
  const name = readByHeader(values, headers, ["name", "security name", "security"]);
  const sector = readByHeader(values, headers, ["sector", "gics sector"]);
  const weight = parseWeight(readByHeader(values, headers, ["weight", "% weight", "portfolio weight"]));

  const cleanSymbol = normalizeSymbol(symbol);
  if (!cleanSymbol || !name || cleanSymbol.length > 12) {
    return null;
  }

  return {
    symbol: cleanSymbol,
    name,
    sector: sector || null,
    weight,
  };
}

function readByHeader(values, headers, candidates) {
  const index = headers.findIndex((header) => candidates.includes(header));
  return index === -1 ? "" : values[index] ?? "";
}

function parseWeight(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const raw = String(value ?? "").replace(/[%,$]/g, "").trim();
  if (!raw) {
    return null;
  }
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeConstituents(items) {
  const unique = [];
  const seen = new Set();
  for (const item of items) {
    if (!item.symbol || seen.has(item.symbol)) {
      continue;
    }
    seen.add(item.symbol);
    unique.push({
      symbol: item.symbol,
      name: item.name,
      sector: canonicalSectorLabel(item.sector),
      sourceWeight: item.weight ?? null,
    });
  }

  const weights = unique.map((item) => item.sourceWeight).filter((value) => Number.isFinite(value) && value > 0);
  const sum = weights.reduce((total, value) => total + value, 0);
  const scale = sum > 0 && sum <= 2.5 ? 100 : 1;

  return unique.map((item) => ({
    ...item,
    sourceWeight: Number.isFinite(item.sourceWeight) ? item.sourceWeight * scale : null,
  }));
}

function needsSectorBackfill(items) {
  const sectors = [...new Set(items.map((item) => item.sector).filter(Boolean))];
  const missing = items.filter((item) => !item.sector).length;
  return sectors.length < 8 || missing > items.length * 0.2;
}

function applySectorBackfill(primary, fallback) {
  const fallbackMap = new Map(fallback.map((item) => [item.symbol, item.sector]).filter((entry) => entry[1]));
  return primary.map((item) => ({
    ...item,
    sector: item.sector ?? fallbackMap.get(item.symbol) ?? null,
  }));
}

function canonicalSectorLabel(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return {
    "information technology": "Technology",
    technology: "Technology",
    financials: "Financial Services",
    "financial services": "Financial Services",
    "health care": "Healthcare",
    healthcare: "Healthcare",
    "consumer discretionary": "Consumer Cyclical",
    "consumer cyclical": "Consumer Cyclical",
    "consumer staples": "Consumer Defensive",
    "consumer defensive": "Consumer Defensive",
    materials: "Basic Materials",
    "basic materials": "Basic Materials",
    energy: "Energy",
    utilities: "Utilities",
    industrials: "Industrials",
    "communication services": "Communication Services",
    "real estate": "Real Estate",
  }[normalized] ?? titleCaseSector(normalized);
}

function titleCaseSector(value) {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeSymbol(value) {
  return String(value ?? "")
    .replace(/\./g, "-")
    .replace(/\s+/g, "")
    .trim()
    .toUpperCase();
}

function normalizeHeader(value) {
  return cleanupCell(value)
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanupCell(value) {
  return decodeXml(
    String(value ?? "")
      .replace(/<sup[\s\S]*?<\/sup>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]+\]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function columnToIndex(column) {
  return [...column].reduce((value, character) => value * 26 + character.charCodeAt(0) - 64, 0) - 1;
}

function decodeXml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
