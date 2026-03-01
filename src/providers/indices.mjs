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

export async function getPublicCompanyAliasDirectory() {
  const universes = await Promise.all([
    getSp500Universe().catch(() => null),
    getNasdaq100Universe().catch(() => null),
    getDow30Universe().catch(() => null),
  ]);

  return buildPublicCompanyAliasDirectory(universes.filter(Boolean));
}

export function buildPublicCompanyAliasDirectory(universes = []) {
  const aliases = new Map();

  for (const universe of universes) {
    const source = universe?.source?.label ?? "Public constituent universe";
    for (const constituent of universe?.constituents ?? []) {
      const symbol = normalizeSymbol(constituent?.symbol);
      const name = String(constituent?.name ?? "").trim();
      if (!symbol || !name) {
        continue;
      }

      for (const key of buildAliasVariants(name)) {
        if (!key || aliases.has(key)) {
          continue;
        }
        aliases.set(key, {
          symbol,
          name,
          sector: constituent?.sector ?? null,
          source,
        });
      }
    }
  }

  return [...aliases.entries()].map(([key, value]) => ({ key, ...value }));
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

function buildAliasVariants(name) {
  const keys = new Set();
  const raw = String(name ?? "").trim();
  if (!raw) {
    return [];
  }

  const strippedParens = raw.replace(/\([^)]*\)/g, " ");
  const strippedClass = stripShareClassTerms(strippedParens);
  const strippedCorporate = stripCorporateSuffixTerms(strippedClass);

  for (const variant of [
    raw,
    strippedParens,
    strippedClass,
    strippedCorporate,
    strippedCorporate.replace(/\bTHE\b/gi, " "),
  ]) {
    const key = normalizeAliasKey(variant);
    if (key) {
      keys.add(key);
    }
  }

  return [...keys];
}

function stripShareClassTerms(value) {
  return String(value ?? "")
    .replace(/\b(CLASS|CL)\s+[A-Z]\b/gi, " ")
    .replace(/\bSERIES\s+[A-Z]\b/gi, " ")
    .replace(/\b(ADR|ADS)\b/gi, " ")
    .replace(/\bCOMMON STOCK\b/gi, " ")
    .replace(/\bORDINARY SHARES?\b/gi, " ")
    .replace(/\bDEPOSITARY SHARES?\b/gi, " ");
}

function stripCorporateSuffixTerms(value) {
  return String(value ?? "")
    .replace(/\b(THE|INCORPORATED|INC|CORPORATION|CORP|COMPANY|CO|HOLDINGS|HOLDING|GROUP|LIMITED|LTD|PLC|SA|N V|NV)\b/gi, " ")
    .replace(/\bINTL\b/gi, " INTERNATIONAL ")
    .replace(/\bTECH\b/gi, " TECHNOLOGY ");
}

export function normalizeAliasKey(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/&/g, " AND ")
    .replace(/\+/g, " AND ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
