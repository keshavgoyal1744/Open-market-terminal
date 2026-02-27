import { fetchText } from "../http.mjs";

const TREASURY_URL =
  "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve";

export async function getYieldCurve() {
  const html = await fetchText(TREASURY_URL);
  const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((match) => match[0]);
  const curveTable = tables.find((table) => table.includes("1 Mo") && table.includes("10 Yr"));

  if (!curveTable) {
    throw new Error("Treasury yield curve table was not found.");
  }

  const rows = [...curveTable.matchAll(/<tr[\s\S]*?<\/tr>/gi)]
    .map((match) => extractCells(match[0]))
    .filter((cells) => cells.length > 2);

  const headerIndex = rows.findIndex((cells) => cells[0] === "Date" && cells.includes("10 Yr"));
  if (headerIndex === -1) {
    throw new Error("Treasury yield curve headers were not found.");
  }

  const headers = rows[headerIndex];
  const dataRows = rows.slice(headerIndex + 1).filter((cells) => cells.length === headers.length);
  const latest = dataRows.at(-1);

  if (!latest) {
    throw new Error("Treasury yield curve rows were not found.");
  }

  return {
    asOf: latest[0],
    points: headers.slice(1).map((tenor, index) => ({
      tenor,
      value: Number(latest[index + 1]),
    })),
  };
}

function extractCells(rowHtml) {
  return [...rowHtml.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)]
    .map((match) => cleanCell(match[1]))
    .filter(Boolean);
}

function cleanCell(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
