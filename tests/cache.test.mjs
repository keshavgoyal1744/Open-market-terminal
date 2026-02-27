import test from "node:test";
import assert from "node:assert/strict";

import { TTLCache } from "../src/cache.mjs";

test("cache serves fresh values and reuses loaders", async () => {
  const cache = new TTLCache();
  let calls = 0;

  const first = await cache.getOrSet(
    "key",
    async () => {
      calls += 1;
      return "value";
    },
    { ttlMs: 1000 },
  );

  const second = await cache.getOrSet(
    "key",
    async () => {
      calls += 1;
      return "other";
    },
    { ttlMs: 1000 },
  );

  assert.equal(first, "value");
  assert.equal(second, "value");
  assert.equal(calls, 1);
});
