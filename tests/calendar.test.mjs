import test from "node:test";
import assert from "node:assert/strict";

import { getMacroCalendar } from "../src/providers/calendar.mjs";

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
