import { fetchText } from "../http.mjs";

const BLS_ICS_URL = "https://www.bls.gov/schedule/news_release/bls.ics";

const FOMC_EVENTS = [
  { date: "2026-01-28T19:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled January 27-28 meeting." },
  { date: "2026-03-18T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled March 17-18 meeting." },
  { date: "2026-04-29T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled April 28-29 meeting." },
  { date: "2026-06-17T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled June 16-17 meeting." },
  { date: "2026-07-29T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled July 28-29 meeting." },
  { date: "2026-09-16T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled September 15-16 meeting." },
  { date: "2026-10-28T18:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled October 27-28 meeting." },
  { date: "2026-12-09T19:00:00.000Z", title: "FOMC Rate Decision", source: "Federal Reserve", note: "Scheduled December 8-9 meeting." },
];

export async function getMacroCalendar() {
  const bls = await getBlsCalendar().catch(() => []);
  const combined = [...FOMC_EVENTS.map(normalizeFomcEvent), ...bls]
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

function normalizeFomcEvent(event, index) {
  return {
    id: `fomc-${index}-${event.date}`,
    date: event.date,
    title: event.title,
    category: "policy",
    importance: "critical",
    source: event.source,
    note: event.note,
  };
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
