import test from "node:test";
import assert from "node:assert/strict";

import { getCuratedIntelligence, listSupportedIntelligenceSymbols } from "../src/intelligence-graph.mjs";

test("curated intelligence returns a graph for supported symbols", () => {
  const intel = getCuratedIntelligence("NVDA");
  assert.equal(intel.curated, true);
  assert.equal(intel.graph.nodes.length > 1, true);
  assert.equal(intel.eventChains.length > 0, true);
});

test("unsupported symbols fall back cleanly", () => {
  const intel = getCuratedIntelligence("ZZZZ");
  assert.equal(intel.curated, false);
  assert.equal(intel.graph.nodes.length, 1);
  assert.equal(listSupportedIntelligenceSymbols().some((entry) => entry.symbol === "AAPL"), true);
});
