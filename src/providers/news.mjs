import { fetchText } from "../http.mjs";

const GOOGLE_NEWS_URL = "https://news.google.com/rss/search";

export async function getMarketNews({ symbols = [], focusSymbol = null, query = null } = {}) {
  const feeds = [
    {
      category: "macro",
      query: '"stock market" OR "S&P 500" OR Nasdaq OR "Dow Jones" OR "Wall Street"',
    },
    {
      category: "policy",
      query: '"Federal Reserve" OR inflation OR payrolls OR "treasury yields" OR recession OR tariffs OR oil',
    },
  ];

  if (query) {
    feeds.push({
      category: "focus",
      query: `${query} stock OR ${query} shares OR ${query} earnings OR ${query} guidance OR ${query} outlook OR ${query} analyst`,
    });
  }

  if (focusSymbol) {
    feeds.push({
      category: "focus",
      query: `${focusSymbol} stock OR ${focusSymbol} earnings OR ${focusSymbol} guidance OR ${focusSymbol} analyst`,
    });
  }

  if (symbols.length) {
    feeds.push({
      category: "watchlist",
      query: symbols.slice(0, 5).join(" OR "),
    });
  }

  const headlines = [];
  for (const feed of feeds) {
    try {
      const xml = await fetchText(buildGoogleNewsUrl(feed.query), {
        headers: {
          Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
        },
      });
      headlines.push(...parseRssFeed(xml, feed.category));
    } catch {
      continue;
    }
  }

  return dedupeHeadlines(headlines)
    .sort((left, right) => rankHeadline(right, focusSymbol, cleanQuery(query)) - rankHeadline(left, focusSymbol, cleanQuery(query)))
    .slice(0, 40);
}

function buildGoogleNewsUrl(query) {
  const url = new URL(GOOGLE_NEWS_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "en-US");
  url.searchParams.set("gl", "US");
  url.searchParams.set("ceid", "US:en");
  return url;
}

function parseRssFeed(xml, bucket) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match, index) => {
    const item = match[1];
    const title = cleanupHeadline(decodeXml(stripCdata(readTag(item, "title"))));
    const source = decodeXml(stripCdata(readTag(item, "source"))) || inferSourceFromTitle(title);
    const link = decodeXml(stripCdata(readTag(item, "link")));
    const publishedAt = parsePublishedAt(readTag(item, "pubDate"));
    const category = classifyNewsCategory(title, bucket);

    return {
      id: `${bucket}-${index}-${slug(title)}`,
      title,
      link,
      source,
      publishedAt,
      category,
      impact: classifyNewsImpact(title),
    };
  }).filter((item) => item.title && item.link && item.publishedAt);
}

function readTag(item, tag) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanupHeadline(title) {
  return title.replace(/\s+-\s+[^-]+$/, "").trim();
}

function inferSourceFromTitle(title) {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts.at(-1) : "News";
}

function parsePublishedAt(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function classifyNewsCategory(title, fallback) {
  const text = title.toLowerCase();
  if (text.includes("federal reserve") || text.includes("powell") || text.includes("yield")) {
    return "policy";
  }
  if (text.includes("cpi") || text.includes("inflation") || text.includes("payroll") || text.includes("jobs")) {
    return "macro";
  }
  if (text.includes("earnings") || text.includes("guidance") || text.includes("revenue")) {
    return "earnings";
  }
  if (text.includes("oil") || text.includes("opec") || text.includes("commodity")) {
    return "commodities";
  }
  if (text.includes("tariff") || text.includes("war") || text.includes("china") || text.includes("shipping")) {
    return "geopolitics";
  }
  return fallback;
}

function classifyNewsImpact(title) {
  const text = title.toLowerCase();
  if (
    text.includes("federal reserve") ||
    text.includes("rate cut") ||
    text.includes("rate hike") ||
    text.includes("inflation") ||
    text.includes("payroll") ||
    text.includes("earnings")
  ) {
    return "high";
  }
  return "medium";
}

function dedupeHeadlines(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.link || item.title;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function rankHeadline(item, focusSymbol, query) {
  const title = String(item.title ?? "").toLowerCase();
  const source = String(item.source ?? "").toLowerCase();
  const ageHours = Math.max((Date.now() - Date.parse(item.publishedAt)) / (1000 * 60 * 60), 0);
  const recencyScore = Math.max(48 - ageHours, 0);
  const credibilityScore = sourceWeight(source);
  const impactScore = item.impact === "high" ? 24 : item.impact === "medium" ? 12 : 4;
  const focusScore = query && title.includes(query) ? 26 : focusSymbol && title.includes(String(focusSymbol).toLowerCase()) ? 22 : 0;
  return recencyScore + credibilityScore + impactScore + focusScore;
}

function sourceWeight(source) {
  if (!source) {
    return 0;
  }

  const trusted = {
    reuters: 28,
    "associated press": 26,
    bloomberg: 24,
    "wall street journal": 24,
    financial: 22,
    cnbc: 20,
    marketwatch: 18,
    barron: 18,
    yahoo: 16,
    "investing.com": 14,
    "the motley fool": 10,
  };

  for (const [needle, score] of Object.entries(trusted)) {
    if (source.includes(needle)) {
      return score;
    }
  }

  return 8;
}

function cleanQuery(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
