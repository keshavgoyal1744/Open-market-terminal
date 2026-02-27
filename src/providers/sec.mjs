import { fetchJson } from "../http.mjs";

const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json";
const SEC_BASE_URL = "https://data.sec.gov";
const DEFAULT_USER_AGENT =
  process.env.SEC_USER_AGENT ?? "OpenMarketTerminal/0.1 (self-hosted dashboard)";

let tickerMapPromise;

export async function resolveTicker(ticker) {
  const map = await loadTickerMap();
  return map.get(ticker.trim().toUpperCase()) ?? null;
}

export async function getCompanySnapshot(ticker) {
  const entry = await resolveTicker(ticker);
  if (!entry) {
    throw new Error(`Ticker ${ticker} was not found in the SEC mapping.`);
  }

  const cik = entry.cik.padStart(10, "0");
  const [submissions, companyFacts] = await Promise.all([
    fetchJson(`${SEC_BASE_URL}/submissions/CIK${cik}.json`, { userAgent: DEFAULT_USER_AGENT }),
    fetchJson(`${SEC_BASE_URL}/api/xbrl/companyfacts/CIK${cik}.json`, {
      userAgent: DEFAULT_USER_AGENT,
    }),
  ]);

  return {
    ticker: entry.ticker,
    cik,
    title: entry.title,
    filings: recentFilings(submissions?.filings?.recent),
    relationshipSignals: summarizeRelationshipSignals(submissions?.filings?.recent),
    facts: {
      revenue: pickFact(companyFacts, "us-gaap", ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"]),
      netIncome: pickFact(companyFacts, "us-gaap", ["NetIncomeLoss"]),
      assets: pickFact(companyFacts, "us-gaap", ["Assets"]),
      liabilities: pickFact(companyFacts, "us-gaap", ["Liabilities"]),
      cash: pickFact(companyFacts, "us-gaap", ["CashAndCashEquivalentsAtCarryingValue"]),
      sharesOutstanding: pickFact(companyFacts, "dei", ["EntityCommonStockSharesOutstanding"]),
    },
  };
}

async function loadTickerMap() {
  if (!tickerMapPromise) {
    tickerMapPromise = fetchJson(SEC_TICKERS_URL, { userAgent: DEFAULT_USER_AGENT }).then((data) => {
      const map = new Map();
      for (const entry of Object.values(data ?? {})) {
        map.set(entry.ticker.toUpperCase(), {
          ticker: entry.ticker.toUpperCase(),
          title: entry.title,
          cik: String(entry.cik_str),
        });
      }
      return map;
    });
  }
  return tickerMapPromise;
}

function recentFilings(recent) {
  if (!recent?.accessionNumber?.length) {
    return [];
  }

  return recent.accessionNumber.slice(0, 8).map((accessionNumber, index) => ({
    accessionNumber,
    form: recent.form?.[index] ?? null,
    filingDate: recent.filingDate?.[index] ?? null,
    reportDate: recent.reportDate?.[index] ?? null,
    primaryDocument: recent.primaryDocument?.[index] ?? null,
    primaryDocDescription: recent.primaryDocDescription?.[index] ?? null,
  }));
}

function pickFact(companyFacts, taxonomy, concepts) {
  const taxonomyNode = companyFacts?.facts?.[taxonomy];
  if (!taxonomyNode) {
    return null;
  }

  for (const concept of concepts) {
    const conceptNode = taxonomyNode[concept];
    const values = conceptNode?.units ? Object.values(conceptNode.units).flat() : [];
    const filtered = values
      .filter((item) => item?.val != null)
      .sort((left, right) => new Date(right.filed ?? right.end) - new Date(left.filed ?? left.end));

    if (filtered.length) {
      const latest = filtered[0];
      return {
        concept,
        label: conceptNode?.label ?? concept,
        value: latest.val,
        unit: latest.frame ?? latest.uom ?? null,
        periodEnd: latest.end ?? null,
        filed: latest.filed ?? null,
        form: latest.form ?? null,
      };
    }
  }

  return null;
}

function summarizeRelationshipSignals(recent) {
  const filings = recentFilings(recent);
  const insiderForms = filings.filter((filing) => ["3", "4", "5"].includes(filing.form));
  const ownershipForms = filings.filter((filing) =>
    ["SC 13D", "SC 13D/A", "SC 13G", "SC 13G/A", "13D", "13G"].includes(filing.form),
  );
  const dealForms = filings.filter((filing) => ["S-4", "425", "SC TO-T", "8-K"].includes(filing.form));

  return {
    insiderFormCount: insiderForms.length,
    ownershipFormCount: ownershipForms.length,
    dealFormCount: dealForms.length,
    insiderForms: insiderForms.slice(0, 5),
    ownershipForms: ownershipForms.slice(0, 5),
    dealForms: dealForms.slice(0, 5),
  };
}
