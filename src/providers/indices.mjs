import { fetchText } from "../http.mjs";
import { getSp500Universe } from "./sp500.mjs";

const NASDAQ100_URL = "https://www.nasdaq.com/solutions/global-indexes/nasdaq-100/companies";
const NASDAQ100_WIKI_URL = "https://en.wikipedia.org/wiki/Nasdaq-100";
const DOW_WIKI_URL = "https://en.wikipedia.org/wiki/Dow_Jones_Industrial_Average";

export async function getMajorIndexMemberships(symbol) {
  const upper = String(symbol ?? "").trim().toUpperCase();
  if (!upper) {
    return [];
  }

  const [sp500, nasdaq100, dow30] = await Promise.all([
    getSp500Universe().catch(() => null),
    getNasdaq100Universe().catch(() => null),
    getDow30Universe().catch(() => null),
  ]);

  const memberships = [];

  if (sp500?.constituents?.some((item) => item.symbol === upper)) {
    memberships.push({
      id: "sp500",
      label: "S&P 500",
      vehicle: "SPY",
      source: sp500.source?.label ?? "State Street SPY Holdings",
      sourceUrl: sp500.source?.url ?? null,
      note: "Large-cap US equity benchmark",
    });
  }

  if (nasdaq100?.constituents?.some((item) => item.symbol === upper)) {
    memberships.push({
      id: "nasdaq100",
      label: "Nasdaq-100",
      vehicle: "QQQ",
      source: nasdaq100.source?.label ?? "Nasdaq-100 Constituents",
      sourceUrl: nasdaq100.source?.url ?? null,
      note: "Largest non-financial Nasdaq issuers",
    });
  }

  if (dow30?.constituents?.some((item) => item.symbol === upper)) {
    memberships.push({
      id: "dow30",
      label: "Dow Jones Industrial Average",
      vehicle: "DIA",
      source: dow30.source?.label ?? "Dow constituents",
      sourceUrl: dow30.source?.url ?? null,
      note: "Price-weighted blue-chip US index",
    });
  }

  return memberships;
}

async function getNasdaq100Universe() {
  const warnings = [];

  try {
    const html = await fetchText(NASDAQ100_URL, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const parsed = parseConstituentTable(html);
    if (parsed.length >= 80) {
      return {
        asOf: new Date().toISOString(),
        source: {
          id: "nasdaq-100-official",
          label: "Nasdaq-100 Companies",
          url: NASDAQ100_URL,
        },
        warnings,
        constituents: parsed,
      };
    }
    warnings.push(`Official Nasdaq-100 page parser returned only ${parsed.length} rows.`);
  } catch (error) {
    warnings.push(`Official Nasdaq-100 page unavailable: ${error.message}`);
  }

  const html = await fetchText(NASDAQ100_WIKI_URL);
  const fallback = parseConstituentTable(html);
  if (!fallback.length) {
    throw new Error("Unable to build a Nasdaq-100 universe from the configured public sources.");
  }

  return {
    asOf: new Date().toISOString(),
    source: {
      id: "wikipedia-nasdaq100",
      label: "Wikipedia Nasdaq-100 Constituents",
      url: NASDAQ100_WIKI_URL,
    },
    warnings,
    constituents: fallback,
  };
}

async function getDow30Universe() {
  const html = await fetchText(DOW_WIKI_URL);
  const parsed = parseConstituentTable(html);
  if (!parsed.length) {
    throw new Error("Unable to build a Dow 30 universe from the configured public sources.");
  }

  return {
    asOf: new Date().toISOString(),
    source: {
      id: "wikipedia-dow30",
      label: "Wikipedia Dow Constituents",
      url: DOW_WIKI_URL,
    },
    warnings: [],
    constituents: parsed,
  };
}

export function parseConstituentTable(html) {
  const tables = [...String(html ?? "").matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);

  for (const table of tables) {
    const rows = [...table.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi)];
    if (!rows.length) {
      continue;
    }

    let headers = [];
    const constituents = [];

    for (const row of rows) {
      const cells = [...row[1].matchAll(/<(t[hd])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((cell) => cleanCell(cell[2]));
      if (!cells.length) {
        continue;
      }

      if (!headers.length) {
        const candidate = cells.map(normalizeHeader);
        if (candidate.some((value) => value.includes("symbol") || value.includes("ticker")) &&
            candidate.some((value) => value.includes("company") || value.includes("security") || value.includes("name"))) {
          headers = candidate;
        }
        continue;
      }

      const record = rowToConstituent(cells, headers);
      if (record) {
        constituents.push(record);
      }
    }

    if (constituents.length >= 20) {
      return constituents;
    }
  }

  return [];
}

function rowToConstituent(values, headers) {
  const symbol = readByHeader(values, headers, ["symbol", "ticker"]);
  const name = readByHeader(values, headers, ["company", "company name", "security", "security name", "name"]);
  const sector = readByHeader(values, headers, ["sector", "gics sector", "industry"]);
  const cleanSymbol = normalizeSymbol(symbol);
  if (!cleanSymbol || !name) {
    return null;
  }
  return {
    symbol: cleanSymbol,
    name,
    sector: sector || null,
  };
}

function readByHeader(values, headers, candidates) {
  const index = headers.findIndex((header) => candidates.includes(header));
  return index === -1 ? "" : values[index] ?? "";
}

function cleanCell(value) {
  return decodeHtml(
    String(value ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeSymbol(value) {
  const raw = String(value ?? "").trim().toUpperCase().replace(/\./g, "-");
  return /^[A-Z0-9^=\-]{1,12}$/.test(raw) ? raw : "";
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#160;|&nbsp;/g, " ");
}
