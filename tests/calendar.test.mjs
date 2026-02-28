import test from "node:test";
import assert from "node:assert/strict";

import { getMacroCalendar, getNasdaqEarningsCalendar } from "../src/providers/calendar.mjs";

test("macro calendar merges live Fed and BLS sources without hardcoded dates", async (context) => {
  const originalFetch = global.fetch;
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (href.includes("fomccalendars")) {
      return textResponse(200, `
        <html>
          <body>
            <h4>2026 FOMC Meetings</h4>
            <ul>
              <li><a href="/newsevents/pressreleases/monetary20260318a.htm">March 17-18*</a></li>
              <li><a href="/newsevents/pressreleases/monetary20260429a.htm">April 28-29*</a></li>
            </ul>
          </body>
        </html>
      `);
    }

    if (href.includes("bls.ics")) {
      return textResponse(200, `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260313T123000Z
SUMMARY:Employment Situation
DESCRIPTION:Official BLS release
END:VEVENT
END:VCALENDAR`);
    }

    throw new Error(`Unexpected URL: ${href}`);
  };

  const events = await getMacroCalendar();

  assert.equal(events.length, 3);
  assert.equal(events[0].source, "BLS");
  assert.equal(events[1].source, "Federal Reserve");
  assert.equal(events[1].title, "FOMC Rate Decision");
});

test("nasdaq earnings calendar normalizes public earnings rows by date", async (context) => {
  const originalFetch = global.fetch;
  const firstBusinessDay = nextBusinessDayIso();
  context.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async (url) => {
    const href = url.toString();
    if (!href.includes("api.nasdaq.com/api/calendar/earnings")) {
      throw new Error(`Unexpected URL: ${href}`);
    }
    const hasTargetDay = href.includes(`date=${firstBusinessDay}`);
    return textResponse(200, JSON.stringify({
      data: {
        rows: hasTargetDay ? [
          {
            symbol: "MSFT",
            name: "Microsoft Corporation",
            time: "After Market Close",
            epsForecast: "3.02",
            noOfEsts: "28",
            fiscalQuarterEnding: "Jun/2026",
            marketCap: "$3.1T",
          },
        ] : [],
      },
    }));
  };

  const events = await getNasdaqEarningsCalendar(1);

  assert.equal(events.length, 1);
  assert.equal(events[0].symbol, "MSFT");
  assert.equal(events[0].category, "earnings");
  assert.equal(events[0].source, "Nasdaq / Zacks");
  assert.match(events[0].note, /EPS est 3.02/);
});

function nextBusinessDayIso() {
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  while ([0, 6].includes(cursor.getUTCDay())) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return cursor.toISOString().slice(0, 10);
}

function textResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    async text() {
      return payload;
    },
  };
}
