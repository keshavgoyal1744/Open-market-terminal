import { fetchJson, fetchText } from "../http.mjs";

const BLS_ICS_URL = "https://www.bls.gov/schedule/news_release/bls.ics";
const FED_FOMC_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
const NASDAQ_EARNINGS_URL = "https://api.nasdaq.com/api/calendar/earnings";
const NASDAQ_EARNINGS_REFERER = "https://www.nasdaq.com/market-activity/earnings";
const MONTH_INDEX = new Map([
  ["january", 0],
  ["february", 1],
  ["march", 2],
  ["april", 3],
  ["may", 4],
  ["june", 5],
  ["july", 6],
  ["august", 7],
  ["september", 8],
  ["october", 9],
  ["november", 10],
  ["december", 11],
]);

export async function getMacroCalendar() {
  const [bls, fed] = await Promise.all([getBlsCalendar().catch(() => []), getFedCalendar().catch(() => [])]);
  const combined = [...fed, ...bls]
    .filter((event) => Number.isFinite(Date.parse(event.date)))
    .sort((left, right) => new Date(left.date) - new Date(right.date));

  return combined.filter(inUpcomingWindow).slice(0, 80);
}

export async function getNasdaqEarningsCalendar(windowDays = 30) {
  const horizon = clampWindow(windowDays);
  const dates = upcomingBusinessDates(horizon);
  const events = [];

  for (const chunk of chunkList(dates, 5)) {
    const settled = await Promise.allSettled(chunk.map((date) => getNasdaqEarningsForDate(date)));
    for (const result of settled) {
      if (result.status === "fulfilled") {
        events.push(...result.value);
      }
    }
  }

  return dedupeEvents(events)
    .sort((left, right) => new Date(left.date) - new Date(right.date))
    .slice(0, 1200);
}

async function getBlsCalendar() {
  const raw = await fetchText(BLS_ICS_URL, {
    headers: {
      Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
    },
  });

  return unfoldIcs(raw)
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((chunk) => chunk.split("END:VEVENT")[0] ?? "")
    .map(parseIcsEvent)
    .filter(Boolean)
    .map((event, index) => ({
      id: `bls-${index}-${event.date}`,
      date: event.date,
      title: event.summary,
      category: classifyMacroCategory(event.summary),
      importance: classifyMacroImportance(event.summary),
      source: "BLS",
      note: event.description ?? "Scheduled BLS release.",
    }));
}

function unfoldIcs(value) {
  return value.replace(/\r?\n[ \t]/g, "");
}

function parseIcsEvent(block) {
  const fields = {};
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || !line.includes(":")) {
      continue;
    }
    const [rawKey, ...valueParts] = line.split(":");
    const key = rawKey.split(";")[0];
    fields[key] = valueParts.join(":").trim();
  }

  const date = parseIcsDate(fields.DTSTART);
  if (!date || !fields.SUMMARY) {
    return null;
  }

  return {
    date,
    summary: fields.SUMMARY,
    description: fields.DESCRIPTION ?? null,
  };
}

function parseIcsDate(value) {
  if (!value) {
    return null;
  }
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00.000Z`;
  }
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute, second, zulu] = match;
  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return zulu ? new Date(timestamp).toISOString() : new Date(timestamp).toISOString();
}

function classifyMacroCategory(summary) {
  const text = summary.toLowerCase();
  if (text.includes("consumer price") || text.includes("inflation") || text.includes("ppi")) {
    return "inflation";
  }
  if (text.includes("employment") || text.includes("payroll") || text.includes("labor")) {
    return "labor";
  }
  if (text.includes("gross domestic product") || text.includes("productivity")) {
    return "growth";
  }
  return "macro";
}

function classifyMacroImportance(summary) {
  const text = summary.toLowerCase();
  if (
    text.includes("consumer price index") ||
    text.includes("employment situation") ||
    text.includes("producer price") ||
    text.includes("gross domestic product")
  ) {
    return "high";
  }
  return "medium";
}

function inUpcomingWindow(event) {
  const timestamp = Date.parse(event.date);
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  const now = Date.now();
  const earliest = now - 1000 * 60 * 60 * 24 * 3;
  const latest = now + 1000 * 60 * 60 * 24 * 120;
  return timestamp >= earliest && timestamp <= latest;
}

async function getFedCalendar() {
  const html = await fetchText(FED_FOMC_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const direct = parseFedHtmlByYear(html);
  if (direct.length) {
    return direct;
  }

  return parseFedTextFallback(html);
}

function parseFedHtmlByYear(html) {
  const events = [];
  const sectionPattern = /<h[1-6][^>]*>\s*(20\d{2})\s*FOMC Meetings?\s*<\/h[1-6]>([\s\S]*?)(?=<h[1-6][^>]*>\s*20\d{2}\s*FOMC Meetings?|$)/gi;
  let sectionMatch;
  while ((sectionMatch = sectionPattern.exec(html))) {
    const year = Number(sectionMatch[1]);
    const block = sectionMatch[2];
    const datePattern = />(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-(\d{1,2}))?\*?</gi;
    let dateMatch;
    while ((dateMatch = datePattern.exec(block))) {
      const month = MONTH_INDEX.get(dateMatch[1].toLowerCase());
      const day = Number(dateMatch[3] ?? dateMatch[2]);
      const date = new Date(Date.UTC(year, month, day, 18, 0, 0)).toISOString();
      events.push({
        id: `fomc-${year}-${month + 1}-${day}`,
        date,
        title: "FOMC Rate Decision",
        category: "policy",
        importance: "critical",
        source: "Federal Reserve",
        note: `${dateMatch[1]} ${dateMatch[2]}${dateMatch[3] ? `-${dateMatch[3]}` : ""} meeting window.`,
      });
    }
  }

  return dedupeEvents(events);
}

function parseFedTextFallback(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const events = [];
  const sectionPattern = /(20\d{2})\s+FOMC Meetings?([\s\S]*?)(?=20\d{2}\s+FOMC Meetings?|$)/gi;
  let sectionMatch;
  while ((sectionMatch = sectionPattern.exec(text))) {
    const year = Number(sectionMatch[1]);
    const block = sectionMatch[2];
    const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:-(\d{1,2}))?/gi;
    let dateMatch;
    while ((dateMatch = datePattern.exec(block))) {
      const month = MONTH_INDEX.get(dateMatch[1].toLowerCase());
      const day = Number(dateMatch[3] ?? dateMatch[2]);
      const date = new Date(Date.UTC(year, month, day, 18, 0, 0)).toISOString();
      events.push({
        id: `fomc-fallback-${year}-${month + 1}-${day}`,
        date,
        title: "FOMC Rate Decision",
        category: "policy",
        importance: "critical",
        source: "Federal Reserve",
        note: `${dateMatch[1]} ${dateMatch[2]}${dateMatch[3] ? `-${dateMatch[3]}` : ""} meeting window.`,
      });
    }
  }

  return dedupeEvents(events);
}

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.title}:${event.date}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function getNasdaqEarningsForDate(date) {
  const url = new URL(NASDAQ_EARNINGS_URL);
  url.searchParams.set("date", date);

  const payload = await fetchJson(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: "https://www.nasdaq.com",
      Referer: `${NASDAQ_EARNINGS_REFERER}?date=${date}`,
    },
  });

  const rows = extractNasdaqRows(payload);
  return rows
    .map((row, index) => normalizeNasdaqEarningsRow(row, date, index))
    .filter(Boolean);
}

function extractNasdaqRows(payload) {
  const candidates = [
    payload?.data?.rows,
    payload?.data?.calendar?.rows,
    payload?.data?.earnings?.rows,
    payload?.data?.calendarData?.rows,
  ];

  for (const rows of candidates) {
    if (Array.isArray(rows)) {
      return rows;
    }
  }
  return [];
}

function normalizeNasdaqEarningsRow(row, fallbackDate, index) {
  const symbol = String(
    row?.symbol ?? row?.ticker ?? row?.Symbol ?? row?.asset ?? row?.stock ?? "",
  ).trim().toUpperCase();
  const companyName = String(
    row?.name ?? row?.company ?? row?.companyName ?? row?.company_name ?? symbol,
  ).trim();
  const date = normalizeNasdaqDate(row?.date ?? row?.releaseDate ?? row?.reportDate ?? fallbackDate);

  if (!symbol || !date) {
    return null;
  }

  const timeLabel = String(row?.time ?? row?.timeOfDay ?? row?.releaseTiming ?? "").trim();
  const noteParts = [
    companyName && companyName !== symbol ? companyName : null,
    timeLabel || null,
    firstText(row?.epsForecast, row?.epsEstimate, row?.consensusEPS, row?.consensus) ? `EPS est ${firstText(row?.epsForecast, row?.epsEstimate, row?.consensusEPS, row?.consensus)}` : null,
    firstText(row?.noOfEsts, row?.numberOfEstimates, row?.numEsts) ? `${firstText(row?.noOfEsts, row?.numberOfEstimates, row?.numEsts)} estimates` : null,
    firstText(row?.fiscalQuarterEnding, row?.quarterEnding) ? `Qtr end ${firstText(row?.fiscalQuarterEnding, row?.quarterEnding)}` : null,
  ].filter(Boolean);

  return {
    id: `nasdaq-earnings-${date}-${symbol}-${index}`,
    date: resolveNasdaqTimestamp(date, timeLabel),
    title: `${symbol} earnings`,
    category: "earnings",
    importance: rankNasdaqImportance(symbol, row),
    source: "Nasdaq / Zacks",
    note: noteParts.join(" | "),
    symbol,
    link: `https://www.nasdaq.com/market-activity/stocks/${symbol.toLowerCase()}/earnings`,
  };
}

function normalizeNasdaqDate(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${String(slash[1]).padStart(2, "0")}-${String(slash[2]).padStart(2, "0")}`;
  }
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : null;
}

function resolveNasdaqTimestamp(date, timeLabel) {
  const label = String(timeLabel ?? "").toLowerCase();
  const hour =
    label.includes("after market") || label.includes("amc")
      ? 21
      : label.includes("before market") || label.includes("pre-market") || label.includes("bmo")
        ? 12
        : 16;
  return new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000Z`).toISOString();
}

function rankNasdaqImportance(symbol, row) {
  const cap = parseCapValue(row?.marketCap ?? row?.marketCapDisplay ?? row?.market_cap);
  if (cap >= 200_000_000_000) {
    return "critical";
  }
  if (cap >= 25_000_000_000 || ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA"].includes(symbol)) {
    return "high";
  }
  return "medium";
}

function parseCapValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const text = String(value ?? "").trim().replace(/[$,]/g, "");
  const match = text.match(/^(-?\d+(?:\.\d+)?)([KMBT])?$/i);
  if (!match) {
    return null;
  }
  const base = Number(match[1]);
  if (!Number.isFinite(base)) {
    return null;
  }
  const multiplier = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
    T: 1_000_000_000_000,
  }[String(match[2] ?? "").toUpperCase()] ?? 1;
  return base * multiplier;
}

function firstText(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) {
      return text;
    }
  }
  return null;
}

function clampWindow(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 30;
  }
  return Math.min(Math.max(Math.round(numeric), 7), 90);
}

function upcomingBusinessDates(windowDays) {
  const dates = [];
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  for (let index = 0; index <= windowDays; index += 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() + index);
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) {
      continue;
    }
    dates.push(day.toISOString().slice(0, 10));
  }

  return dates;
}

function chunkList(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
