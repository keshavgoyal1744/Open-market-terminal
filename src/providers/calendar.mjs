import { fetchText } from "../http.mjs";

const BLS_ICS_URL = "https://www.bls.gov/schedule/news_release/bls.ics";
const FED_FOMC_URL = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm";
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
