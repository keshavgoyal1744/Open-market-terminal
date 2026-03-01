import { fetchJson, fetchText } from "../http.mjs";

const BASE_URL = "https://query1.finance.yahoo.com";
const ALTERNATE_BASE_URL = "https://query2.finance.yahoo.com";
const WEBSITE_URL = "https://finance.yahoo.com";
const OWNERSHIP_ROW_LIMIT = 25;
const OFFICER_ROW_LIMIT = 20;
const INSIDER_ROW_LIMIT = 20;
const YAHOO_HEADERS = {
  Origin: "https://finance.yahoo.com",
  Referer: "https://finance.yahoo.com/",
};

export async function getQuotes(symbols) {
  const cleanSymbols = uniqueSymbols(symbols);
  if (!cleanSymbols.length) {
    throw new Error("At least one symbol is required.");
  }

  const quoteMap = new Map();
  let batchError = null;

  try {
    const batchResults = await fetchQuoteBatch(cleanSymbols);
    for (const quote of batchResults) {
      quoteMap.set(quote.symbol, quote);
    }
  } catch (error) {
    batchError = error;
    if (!shouldUseChartFallback(error)) {
      throw error;
    }
  }

  const missing = cleanSymbols.filter((symbol) => !quoteMap.has(symbol));
  const fallbackErrors = [];
  if (missing.length) {
    const fallbackQuotes = await Promise.all(
      missing.map(async (symbol) => {
        try {
          return await fetchQuoteFromChart(symbol);
        } catch (error) {
          fallbackErrors.push(error);
          return null;
        }
      }),
    );

    for (const quote of fallbackQuotes.filter(Boolean)) {
      quoteMap.set(quote.symbol, quote);
    }
  }

  const quotes = cleanSymbols.map((symbol) => quoteMap.get(symbol)).filter(Boolean);
  if (!quotes.length) {
    throw fallbackErrors[0] ?? batchError ?? new Error(`No quote data found for ${cleanSymbols.join(", ")}.`);
  }

  return quotes;
}

export async function getHistory(symbol, range = "1mo", interval = "1d") {
  const url = new URL(`/v8/finance/chart/${encodeURIComponent(symbol)}`, BASE_URL);
  url.searchParams.set("range", range);
  url.searchParams.set("interval", interval);
  url.searchParams.set("includePrePost", "false");

  const payload = await fetchYahooJson(url);
  const result = payload?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart data found for ${symbol}.`);
  }

  const quote = result.indicators?.quote?.[0] ?? {};
  const timestamps = result.timestamp ?? [];

  return timestamps.map((timestamp, index) => ({
    timestamp,
    date: new Date(timestamp * 1000).toISOString(),
    open: quote.open?.[index] ?? null,
    high: quote.high?.[index] ?? null,
    low: quote.low?.[index] ?? null,
    close: quote.close?.[index] ?? null,
    volume: quote.volume?.[index] ?? null,
  }));
}

export async function getOptions(symbol, expiration) {
  let lastError = null;
  let htmlError = null;

  try {
    return await fetchOptionsFromBase(symbol, expiration, BASE_URL);
  } catch (error) {
    lastError = error;
  }

  try {
    return await fetchOptionsFromHtml(symbol, expiration);
  } catch (error) {
    htmlError = error;
  }

  try {
    return await fetchOptionsFromBase(symbol, expiration, ALTERNATE_BASE_URL);
  } catch (error) {
    lastError = error;
  }

  try {
    return await fetchOptionsFromHtml(symbol, expiration);
  } catch (error) {
    throw htmlError ?? lastError ?? error;
  }
}

export async function getCompanyOverview(symbol) {
  try {
    return await fetchCompanyOverviewFromBase(symbol, BASE_URL);
  } catch (error) {
    if (!shouldUseChartFallback(error)) {
      try {
        return await fetchCompanyOverviewFromHtml(symbol);
      } catch (htmlError) {
        throw htmlError;
      }
    }
  }

  try {
    return await fetchCompanyOverviewFromBase(symbol, ALTERNATE_BASE_URL);
  } catch (error) {
    if (!shouldUseChartFallback(error)) {
      try {
        return await fetchCompanyOverviewFromHtml(symbol);
      } catch (htmlError) {
        throw htmlError;
      }
    }
  }

  try {
    return await fetchCompanyOverviewFromHtml(symbol);
  } catch {
    // fall through to chart-based minimal quote view
  }

  const [quote] = await getQuotes([symbol]);
  return {
    symbol: quote.symbol ?? symbol.toUpperCase(),
    shortName: quote.shortName ?? null,
    type: quote.type ?? null,
    exchange: quote.exchange ?? null,
    sector: null,
    industry: null,
    website: null,
    businessSummary: null,
    marketCap: quote.marketCap ?? null,
    trailingPe: quote.trailingPe ?? null,
    forwardPe: null,
    dividendYield: null,
    beta: null,
    fiftyTwoWeekHigh: quote.yearHigh ?? null,
    fiftyTwoWeekLow: quote.yearLow ?? null,
    totalRevenue: null,
    grossMargins: null,
    operatingMargins: null,
    profitMargins: null,
    freeCashflow: null,
    debtToEquity: null,
    returnOnEquity: null,
    currentRatio: null,
    analystRating: null,
    earningsStart: null,
    earningsEnd: null,
    institutionPercentHeld: null,
    insiderPercentHeld: null,
    floatShares: null,
    sharesShort: null,
    sharesShortPriorMonth: null,
    shortRatio: null,
    companyOfficers: [],
    topInstitutionalHolders: [],
    topFundHolders: [],
    insiderHolders: [],
    insiderTransactions: [],
  };
}

export async function getEarningsDetails(symbol) {
  try {
    return await fetchEarningsDetailsFromBase(symbol, BASE_URL);
  } catch (error) {
    if (!shouldUseChartFallback(error)) {
      throw error;
    }
  }

  try {
    return await fetchEarningsDetailsFromBase(symbol, ALTERNATE_BASE_URL);
  } catch (error) {
    if (!shouldUseChartFallback(error)) {
      throw error;
    }
  }

  const overview = await getCompanyOverview(symbol);
  return {
    symbol: overview.symbol ?? symbol.toUpperCase(),
    shortName: overview.shortName ?? null,
    earningsStart: overview.earningsStart ?? null,
    earningsEnd: overview.earningsEnd ?? null,
    history: [],
    trend: [],
    earningsAverage: null,
    earningsLow: null,
    earningsHigh: null,
    revenueEstimate: null,
    recommendation: overview.analystRating ?? null,
  };
}

export async function screenSymbols(symbols, filters = {}) {
  const quotes = await getQuotes(symbols);
  return quotes.filter((quote) => {
    if (filters.maxPe != null && numeric(quote.trailingPe) > filters.maxPe) {
      return false;
    }

    if (filters.minMarketCap != null && numeric(quote.marketCap) < filters.minMarketCap) {
      return false;
    }

    if (filters.minVolume != null && numeric(quote.volume) < filters.minVolume) {
      return false;
    }

    if (filters.minChangePct != null && numeric(quote.changePercent) < filters.minChangePct) {
      return false;
    }

    return true;
  });
}

function uniqueSymbols(symbols) {
  return [...new Set(symbols.map((symbol) => symbol?.trim().toUpperCase()).filter(Boolean))];
}

async function fetchQuoteBatch(symbols) {
  const url = new URL("/v7/finance/quote", BASE_URL);
  url.searchParams.set("symbols", symbols.join(","));

  const payload = await fetchYahooJson(url);
  const results = payload?.quoteResponse?.result ?? [];
  return results.map(normalizeQuote);
}

async function fetchOptionsFromBase(symbol, expiration, baseUrl) {
  const url = new URL(`/v7/finance/options/${encodeURIComponent(symbol)}`, baseUrl);
  if (expiration) {
    url.searchParams.set("date", expiration);
  }

  const payload = await fetchYahooJson(url, { timeoutMs: 20000 });
  const result = payload?.optionChain?.result?.[0];
  if (!result) {
    throw new Error(`No options data found for ${symbol}.`);
  }

  return normalizeOptionChainResult(result, symbol);
}

async function fetchOptionsFromHtml(symbol, expiration) {
  const url = new URL(`/quote/${encodeURIComponent(symbol)}/options`, WEBSITE_URL);
  url.searchParams.set("p", symbol);
  if (expiration) {
    url.searchParams.set("date", expiration);
  }

  const html = await fetchText(url, {
    timeoutMs: 25000,
    headers: {
      ...YAHOO_HEADERS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  const payload = extractOptionsPayloadFromHtml(html);
  const result = findOptionChainResult(payload, symbol);
  if (!result) {
    throw new Error(`No HTML options data found for ${symbol}.`);
  }
  return normalizeOptionChainResult(result, symbol);
}

async function fetchCompanyOverviewFromBase(symbol, baseUrl) {
  const url = new URL(`/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`, baseUrl);
  url.searchParams.set(
    "modules",
    [
      "price",
      "summaryDetail",
      "defaultKeyStatistics",
      "financialData",
      "assetProfile",
      "calendarEvents",
      "majorHoldersBreakdown",
      "fundOwnership",
      "institutionOwnership",
      "insiderTransactions",
      "insiderHolders",
    ].join(","),
  );

  const payload = await fetchYahooJson(url);
  const result = payload?.quoteSummary?.result?.[0];
  if (!result) {
    throw new Error(`No company overview found for ${symbol}.`);
  }

  return {
    symbol: result.price?.symbol ?? symbol.toUpperCase(),
    shortName: result.price?.shortName ?? null,
    type: result.price?.quoteType ?? null,
    exchange: result.price?.exchangeName ?? null,
    sector: result.assetProfile?.sector ?? null,
    industry: result.assetProfile?.industry ?? null,
    website: result.assetProfile?.website ?? null,
    businessSummary: result.assetProfile?.longBusinessSummary ?? null,
    marketCap: unwrapFormatted(result.summaryDetail?.marketCap),
    trailingPe: unwrapFormatted(result.summaryDetail?.trailingPE),
    forwardPe: unwrapFormatted(result.summaryDetail?.forwardPE),
    dividendYield: unwrapFormatted(result.summaryDetail?.dividendYield),
    beta: unwrapFormatted(result.summaryDetail?.beta),
    fiftyTwoWeekHigh: unwrapFormatted(result.summaryDetail?.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: unwrapFormatted(result.summaryDetail?.fiftyTwoWeekLow),
    totalRevenue: unwrapFormatted(result.financialData?.totalRevenue),
    grossMargins: unwrapFormatted(result.financialData?.grossMargins),
    operatingMargins: unwrapFormatted(result.financialData?.operatingMargins),
    profitMargins: unwrapFormatted(result.financialData?.profitMargins),
    freeCashflow: unwrapFormatted(result.financialData?.freeCashflow),
    debtToEquity: unwrapFormatted(result.financialData?.debtToEquity),
    returnOnEquity: unwrapFormatted(result.financialData?.returnOnEquity),
    currentRatio: unwrapFormatted(result.financialData?.currentRatio),
    analystRating: result.financialData?.recommendationKey ?? null,
    earningsStart: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.[0]),
    earningsEnd: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.at(-1)),
    institutionPercentHeld: unwrapFormatted(result.majorHoldersBreakdown?.institutionsPercentHeld),
    insiderPercentHeld: unwrapFormatted(result.majorHoldersBreakdown?.insidersPercentHeld),
    floatShares: unwrapFormatted(result.defaultKeyStatistics?.floatShares),
    sharesShort: unwrapFormatted(result.defaultKeyStatistics?.sharesShort),
    sharesShortPriorMonth: unwrapFormatted(result.defaultKeyStatistics?.sharesShortPriorMonth),
    shortRatio: unwrapFormatted(result.defaultKeyStatistics?.shortRatio),
    companyOfficers: normalizeOfficers(result.assetProfile?.companyOfficers),
    topInstitutionalHolders: normalizeOwnershipList(result.institutionOwnership),
    topFundHolders: normalizeOwnershipList(result.fundOwnership),
    insiderHolders: normalizeInsiderHolders(result.insiderHolders),
    insiderTransactions: normalizeInsiderTransactions(result.insiderTransactions),
  };
}

async function fetchCompanyOverviewFromHtml(symbol) {
  const url = new URL(`/quote/${encodeURIComponent(symbol)}`, WEBSITE_URL);
  url.searchParams.set("p", symbol);

  const html = await fetchText(url, {
    headers: {
      ...YAHOO_HEADERS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  const payload = extractOptionsPayloadFromHtml(html);
  const quoteSummary = findQuoteSummaryResult(payload, symbol);
  if (!quoteSummary) {
    throw new Error(`No HTML company overview found for ${symbol}.`);
  }
  return normalizeQuoteSummaryResult(quoteSummary, symbol);
}

async function fetchEarningsDetailsFromBase(symbol, baseUrl) {
  const url = new URL(`/v10/finance/quoteSummary/${encodeURIComponent(symbol)}`, baseUrl);
  url.searchParams.set(
    "modules",
    [
      "price",
      "calendarEvents",
      "earningsHistory",
      "earningsTrend",
      "financialData",
    ].join(","),
  );

  const payload = await fetchYahooJson(url);
  const result = payload?.quoteSummary?.result?.[0];
  if (!result) {
    throw new Error(`No earnings data found for ${symbol}.`);
  }

  return {
    symbol: result.price?.symbol ?? symbol.toUpperCase(),
    shortName: result.price?.shortName ?? null,
    earningsStart: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.[0]),
    earningsEnd: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.at(-1)),
    history: normalizeEarningsHistory(result.earningsHistory?.history),
    trend: normalizeEarningsTrend(result.earningsTrend?.trend),
    earningsAverage: unwrapFormatted(result.financialData?.earningsAverage),
    earningsLow: unwrapFormatted(result.financialData?.earningsLow),
    earningsHigh: unwrapFormatted(result.financialData?.earningsHigh),
    revenueEstimate: unwrapFormatted(result.financialData?.revenueEstimate),
    recommendation: result.financialData?.recommendationKey ?? null,
  };
}

async function fetchQuoteFromChart(symbol) {
  const url = new URL(`/v8/finance/chart/${encodeURIComponent(symbol)}`, BASE_URL);
  url.searchParams.set("range", "5d");
  url.searchParams.set("interval", "1d");
  url.searchParams.set("includePrePost", "false");

  const payload = await fetchYahooJson(url);
  const result = payload?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart data found for ${symbol}.`);
  }

  return normalizeChartQuote(result, symbol);
}

async function fetchYahooJson(url, options = {}) {
  return fetchJson(url, {
    ...options,
    headers: {
      ...YAHOO_HEADERS,
      ...(options.headers ?? {}),
    },
  });
}

function shouldUseChartFallback(error) {
  return /^401\b/.test(error.message) || /^403\b/.test(error.message);
}

function normalizeChartQuote(result, symbol) {
  const meta = result?.meta ?? {};
  const quote = result?.indicators?.quote?.[0] ?? {};
  const price = numericOrNull(meta.regularMarketPrice) ?? lastNumber(quote.close) ?? lastNumber(quote.open) ?? null;
  const previousClose = numericOrNull(meta.previousClose) ?? numericOrNull(meta.chartPreviousClose);
  const change = price != null && previousClose != null ? price - previousClose : null;
  const changePercent = change != null && previousClose ? (change / previousClose) * 100 : null;

  return {
    symbol: meta.symbol ?? symbol.toUpperCase(),
    shortName: meta.shortName ?? meta.longName ?? null,
    type: meta.instrumentType ?? null,
    exchange: meta.exchangeName ?? null,
    currency: meta.currency ?? null,
    marketState: meta.marketState ?? null,
    price,
    change,
    changePercent,
    bid: null,
    ask: null,
    bidSize: null,
    askSize: null,
    volume: lastNumber(quote.volume),
    averageVolume: numericOrNull(meta.averageDailyVolume10Day) ?? null,
    marketCap: numericOrNull(meta.marketCap),
    trailingPe: numericOrNull(meta.trailingPE),
    eps: numericOrNull(meta.epsTrailingTwelveMonths),
    dayHigh: numericOrNull(meta.regularMarketDayHigh) ?? lastNumber(quote.high),
    dayLow: numericOrNull(meta.regularMarketDayLow) ?? lastNumber(quote.low),
    yearHigh: numericOrNull(meta.fiftyTwoWeekHigh),
    yearLow: numericOrNull(meta.fiftyTwoWeekLow),
    timestamp: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
  };
}

function normalizeQuote(raw) {
  return {
    symbol: raw.symbol,
    shortName: raw.shortName ?? raw.longName ?? null,
    type: raw.quoteType ?? null,
    exchange: raw.fullExchangeName ?? raw.exchange ?? null,
    currency: raw.currency ?? null,
    marketState: raw.marketState ?? null,
    price: raw.regularMarketPrice ?? null,
    change: raw.regularMarketChange ?? null,
    changePercent: raw.regularMarketChangePercent ?? null,
    bid: raw.bid ?? null,
    ask: raw.ask ?? null,
    bidSize: raw.bidSize ?? null,
    askSize: raw.askSize ?? null,
    volume: raw.regularMarketVolume ?? null,
    averageVolume: raw.averageDailyVolume3Month ?? null,
    marketCap: raw.marketCap ?? null,
    trailingPe: raw.trailingPE ?? null,
    eps: raw.epsTrailingTwelveMonths ?? null,
    dayHigh: raw.regularMarketDayHigh ?? null,
    dayLow: raw.regularMarketDayLow ?? null,
    yearHigh: raw.fiftyTwoWeekHigh ?? null,
    yearLow: raw.fiftyTwoWeekLow ?? null,
    timestamp: raw.regularMarketTime ? new Date(raw.regularMarketTime * 1000).toISOString() : null,
  };
}

function normalizeOption(raw) {
  return {
    contractSymbol: raw.contractSymbol,
    strike: raw.strike,
    lastPrice: raw.lastPrice,
    bid: raw.bid,
    ask: raw.ask,
    changePercent: raw.percentChange,
    impliedVolatility: raw.impliedVolatility,
    volume: raw.volume,
    openInterest: raw.openInterest,
    inTheMoney: raw.inTheMoney,
  };
}

function normalizeOptionChainResult(result, symbol) {
  const optionSet = result.options?.[0] ?? result.currentOptions?.[0] ?? result ?? { calls: [], puts: [] };
  return {
    symbol: result.underlyingSymbol ?? result.quote?.symbol ?? result.meta?.symbol ?? symbol.toUpperCase(),
    expirations: result.expirationDates ?? result.expirations ?? [],
    quote: result.quote ? normalizeQuote(result.quote) : null,
    calls: optionSet.calls?.slice(0, 30).map(normalizeOption) ?? [],
    puts: optionSet.puts?.slice(0, 30).map(normalizeOption) ?? [],
  };
}

function normalizeQuoteSummaryResult(result, symbol) {
  return {
    symbol: result.price?.symbol ?? symbol.toUpperCase(),
    shortName: result.price?.shortName ?? null,
    type: result.price?.quoteType ?? null,
    exchange: result.price?.exchangeName ?? null,
    sector: result.assetProfile?.sector ?? null,
    industry: result.assetProfile?.industry ?? null,
    website: result.assetProfile?.website ?? null,
    businessSummary: result.assetProfile?.longBusinessSummary ?? null,
    marketCap: unwrapFormatted(result.summaryDetail?.marketCap),
    trailingPe: unwrapFormatted(result.summaryDetail?.trailingPE),
    forwardPe: unwrapFormatted(result.summaryDetail?.forwardPE),
    dividendYield: unwrapFormatted(result.summaryDetail?.dividendYield),
    beta: unwrapFormatted(result.summaryDetail?.beta),
    fiftyTwoWeekHigh: unwrapFormatted(result.summaryDetail?.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: unwrapFormatted(result.summaryDetail?.fiftyTwoWeekLow),
    totalRevenue: unwrapFormatted(result.financialData?.totalRevenue),
    grossMargins: unwrapFormatted(result.financialData?.grossMargins),
    operatingMargins: unwrapFormatted(result.financialData?.operatingMargins),
    profitMargins: unwrapFormatted(result.financialData?.profitMargins),
    freeCashflow: unwrapFormatted(result.financialData?.freeCashflow),
    debtToEquity: unwrapFormatted(result.financialData?.debtToEquity),
    returnOnEquity: unwrapFormatted(result.financialData?.returnOnEquity),
    currentRatio: unwrapFormatted(result.financialData?.currentRatio),
    analystRating: result.financialData?.recommendationKey ?? null,
    earningsStart: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.[0]),
    earningsEnd: normalizeCalendarDate(result.calendarEvents?.earnings?.earningsDate?.at(-1)),
    institutionPercentHeld: unwrapFormatted(result.majorHoldersBreakdown?.institutionsPercentHeld),
    insiderPercentHeld: unwrapFormatted(result.majorHoldersBreakdown?.insidersPercentHeld),
    floatShares: unwrapFormatted(result.defaultKeyStatistics?.floatShares),
    sharesShort: unwrapFormatted(result.defaultKeyStatistics?.sharesShort),
    sharesShortPriorMonth: unwrapFormatted(result.defaultKeyStatistics?.sharesShortPriorMonth),
    shortRatio: unwrapFormatted(result.defaultKeyStatistics?.shortRatio),
    companyOfficers: normalizeOfficers(result.assetProfile?.companyOfficers),
    topInstitutionalHolders: normalizeOwnershipList(result.institutionOwnership),
    topFundHolders: normalizeOwnershipList(result.fundOwnership),
    insiderHolders: normalizeInsiderHolders(result.insiderHolders),
    insiderTransactions: normalizeInsiderTransactions(result.insiderTransactions),
  };
}

function extractOptionsPayloadFromHtml(html) {
  const nextData = String(html ?? "").match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (nextData) {
    return JSON.parse(decodeHtmlEntities(nextData));
  }

  const appMain = String(html ?? "").match(/root\.App\.main\s*=\s*({[\s\S]*?})\s*;\s*(?:<\/script>|$)/i)?.[1];
  if (appMain) {
    return JSON.parse(decodeHtmlEntities(appMain));
  }

  throw new Error("Yahoo options page did not expose a parseable payload.");
}

function findOptionChainResult(payload, symbol) {
  const upper = String(symbol ?? "").trim().toUpperCase();
  const queue = [payload];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") {
      continue;
    }
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (looksLikeOptionChainResult(current, upper)) {
      return current;
    }
    if (Array.isArray(current.result) && looksLikeOptionChainResult(current.result[0], upper)) {
      return current.result[0];
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return null;
}

function findQuoteSummaryResult(payload, symbol) {
  const upper = String(symbol ?? "").trim().toUpperCase();
  const queue = [payload];
  const seen = new Set();

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") {
      continue;
    }
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (looksLikeQuoteSummaryResult(current, upper)) {
      return current;
    }
    if (Array.isArray(current.result) && looksLikeQuoteSummaryResult(current.result[0], upper)) {
      return current.result[0];
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return null;
}

function looksLikeOptionChainResult(node, upper) {
  if (!node || typeof node !== "object") {
    return false;
  }
  const symbol = String(node.underlyingSymbol ?? node.quote?.symbol ?? node.meta?.symbol ?? "").trim().toUpperCase();
  const optionSet = node.options?.[0] ?? node.currentOptions?.[0] ?? node;
  const hasChains = Array.isArray(optionSet.calls) || Array.isArray(optionSet.puts);
  return hasChains && (!upper || !symbol || symbol === upper);
}

function looksLikeQuoteSummaryResult(node, upper) {
  if (!node || typeof node !== "object") {
    return false;
  }
  const symbol = String(node.price?.symbol ?? "").trim().toUpperCase();
  return Boolean(node.price && node.summaryDetail) && (!upper || !symbol || symbol === upper);
}

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeOwnershipList(node) {
  const list = node?.ownershipList ?? node?.holders ?? [];
  return list.slice(0, OWNERSHIP_ROW_LIMIT).map((entry) => ({
    holder: entry.organization ?? entry.holder ?? entry.name ?? null,
    shares: unwrapFormatted(entry.position ?? entry.shares),
    value: unwrapFormatted(entry.value),
    pctHeld: unwrapFormatted(entry.pctHeld),
    reportDate: entry.reportDate ?? null,
  }));
}

function normalizeOfficers(officers = []) {
  return officers.slice(0, OFFICER_ROW_LIMIT).map((officer) => ({
    name: officer.name ?? null,
    title: officer.title ?? officer.maxAge ?? null,
    age: officer.age ?? null,
    yearBorn: officer.yearBorn ?? null,
    totalPay: unwrapFormatted(officer.totalPay),
    exercisedValue: unwrapFormatted(officer.exercisedValue),
    unexercisedValue: unwrapFormatted(officer.unexercisedValue),
  }));
}

function normalizeInsiderHolders(node) {
  const holders = node?.holders ?? node?.insiderHolders ?? [];
  return holders.slice(0, INSIDER_ROW_LIMIT).map((entry) => ({
    name: entry.name ?? entry.reportOwnerName ?? null,
    relation: entry.relation ?? null,
    url: entry.url ?? null,
    transactionDescription: entry.transactionDescription ?? null,
    latestTransDate: entry.latestTransDate ?? null,
    positionDirectDate: entry.positionDirectDate ?? null,
    positionDirect: unwrapFormatted(entry.positionDirect),
    positionIndirect: unwrapFormatted(entry.positionIndirect),
  }));
}

function normalizeInsiderTransactions(node) {
  const transactions = node?.transactions ?? node?.insiderTransactions ?? [];
  return transactions.slice(0, INSIDER_ROW_LIMIT).map((entry) => ({
    insider: entry.insider ?? entry.name ?? null,
    position: entry.position ?? null,
    transactionText: entry.transactionText ?? entry.transactionDescription ?? null,
    startDate: entry.startDate ?? null,
    shares: unwrapFormatted(entry.shares),
    value: unwrapFormatted(entry.value),
    ownership: entry.ownership ?? null,
  }));
}

function normalizeEarningsHistory(history = []) {
  return history.slice(0, 8).map((entry) => ({
    quarter: normalizeCalendarDate(entry.quarter),
    epsEstimate: unwrapFormatted(entry.epsEstimate),
    epsActual: unwrapFormatted(entry.epsActual),
    difference: unwrapFormatted(entry.epsDifference ?? entry.difference),
    surprisePercent: unwrapFormatted(entry.surprisePercent),
  }));
}

function normalizeEarningsTrend(trend = []) {
  return trend.slice(0, 6).map((entry) => ({
    period: entry.period ?? null,
    endDate: normalizeCalendarDate(entry.endDate),
    growth: unwrapFormatted(entry.growth),
    earningsEstimate: normalizeEstimateBlock(entry.earningsEstimate),
    revenueEstimate: normalizeEstimateBlock(entry.revenueEstimate),
  }));
}

function normalizeEstimateBlock(block) {
  if (!block) {
    return null;
  }
  return {
    avg: unwrapFormatted(block.avg),
    low: unwrapFormatted(block.low),
    high: unwrapFormatted(block.high),
    yearAgoEps: unwrapFormatted(block.yearAgoEps),
    numberOfAnalysts: unwrapFormatted(block.numberOfAnalysts),
    growth: unwrapFormatted(block.growth),
  };
}

function normalizeCalendarDate(value) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  if (typeof value.raw === "number") {
    return new Date(value.raw * 1000).toISOString();
  }
  if (typeof value.fmt === "string") {
    const parsed = new Date(value.fmt);
    return Number.isNaN(parsed.getTime()) ? value.fmt : parsed.toISOString();
  }
  return null;
}

function unwrapFormatted(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number.parseFloat(value) || value;
  }
  return value.raw ?? value.fmt ?? null;
}

function numericOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function lastNumber(values = []) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (Number.isFinite(values[index])) {
      return values[index];
    }
  }
  return null;
}

function numeric(value) {
  return typeof value === "number" ? value : Number.parseFloat(value) || 0;
}
