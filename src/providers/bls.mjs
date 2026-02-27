import { fetchJson } from "../http.mjs";

const BLS_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

const SERIES = {
  unemploymentRate: "LNS14000000",
  cpiAllUrban: "CUUR0000SA0",
  nonfarmPayrolls: "CES0000000001",
};

export async function getMacroSnapshot() {
  const now = new Date();
  const payload = await fetchJson(BLS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      seriesid: Object.values(SERIES),
      startyear: String(now.getUTCFullYear() - 1),
      endyear: String(now.getUTCFullYear()),
    }),
  });

  const series = payload?.Results?.series ?? [];
  const byId = new Map(series.map((entry) => [entry.seriesID ?? entry.seriesId, normalizeSeries(entry.data)]));

  const cpiSeries = byId.get(SERIES.cpiAllUrban) ?? [];
  const latestCpi = cpiSeries[0] ?? null;
  const priorYearCpi = cpiSeries.find((point) => point.period === latestCpi?.period && point.year === latestCpi.year - 1);
  const inflationYoY =
    latestCpi && priorYearCpi ? ((latestCpi.value - priorYearCpi.value) / priorYearCpi.value) * 100 : null;

  return {
    unemploymentRate: withDisplay(byId.get(SERIES.unemploymentRate)?.[0], "%"),
    inflationYoY: inflationYoY == null ? null : { value: inflationYoY, display: `${inflationYoY.toFixed(2)}%` },
    nonfarmPayrolls: withDisplay(byId.get(SERIES.nonfarmPayrolls)?.[0], ""),
    asOf: latestCpi?.date ?? null,
  };
}

function normalizeSeries(data = []) {
  return data
    .filter((point) => point.period?.startsWith("M"))
    .map((point) => ({
      year: Number(point.year),
      period: point.period,
      periodName: point.periodName,
      value: Number(point.value),
      latest: point.latest === "true",
      date: `${point.year}-${point.period.slice(1)}-01`,
    }))
    .sort((left, right) => new Date(right.date) - new Date(left.date));
}

function withDisplay(point, suffix) {
  if (!point) {
    return null;
  }
  return {
    value: point.value,
    date: point.date,
    display: suffix ? `${point.value.toFixed(2)}${suffix}` : point.value.toLocaleString(),
  };
}
