import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { rm } from "node:fs/promises";

import { JsonStorage } from "../src/storage.mjs";

test("storage persists users, workspaces, alerts, and notes", async () => {
  const dir = await os.tmpdir();
  const file = path.join(dir, `omt-${Date.now()}-${Math.random()}.json`);
  const storage = new JsonStorage(file);
  await storage.init();

  const user = await storage.createUser({
    name: "Test User",
    email: "test@example.com",
    passwordHash: "abc",
    passwordSalt: "def",
  });

  const session = await storage.createSession(user.id, 1000);
  assert.equal((await storage.findSession(session.id)).userId, user.id);

  await storage.updateUserPreferences(user.id, {
    watchlistSymbols: ["AAPL", "MSFT"],
  });
  const workspace = await storage.saveWorkspace(user.id, {
    name: "Main",
    snapshot: { watchlistSymbols: ["AAPL"] },
    isDefault: true,
  });
  const destination = await storage.saveDestination(user.id, {
    label: "Webhook",
    kind: "webhook",
    target: "https://example.com/hook",
    purposes: ["alert", "digest"],
    active: true,
  });
  const alert = await storage.createAlert(user.id, { symbol: "AAPL", direction: "above", price: 100 });
  const digest = await storage.saveDigest(user.id, {
    name: "Morning Intel",
    symbols: ["AAPL", "MSFT"],
    frequency: "daily",
    destinationIds: [destination.id],
    active: true,
  });
  const note = await storage.saveNote(user.id, {
    title: "Idea",
    content: "Watch earnings",
    workspaceId: workspace.id,
  });

  assert.equal((await storage.listWorkspaces(user.id)).length, 1);
  assert.equal((await storage.listAlerts(user.id)).length, 1);
  assert.equal((await storage.listDestinations(user.id)).length, 1);
  assert.equal((await storage.listDigests(user.id)).length, 1);
  assert.equal((await storage.listNotes(user.id)).length, 1);
  assert.equal((await storage.listDueDigests(Date.parse(digest.nextRunAt) + 1)).length, 1);

  const triggered = await storage.triggerAlert(alert.id, 120);
  assert.equal(triggered.alert.active, false);
  const digestResult = await storage.markDigestRun(digest.id, [{ destinationId: destination.id, ok: true }]);
  assert.equal(Boolean(digestResult.digest.lastSentAt), true);
  assert.equal((await storage.listActivity(user.id)).length >= 1, true);

  await storage.deleteNote(user.id, note.id);
  assert.equal((await storage.listNotes(user.id)).length, 0);

  await rm(file, { force: true });
});

test("storage returns the latest AI snapshot for a matching configuration", async () => {
  const dir = await os.tmpdir();
  const file = path.join(dir, `omt-ai-${Date.now()}-${Math.random()}.json`);
  const storage = new JsonStorage(file);
  await storage.init();

  await storage.saveAiSnapshot("2026-02-27:sp500:1-4w:20:20", {
    asOf: "2026-02-27T15:00:00.000Z",
    snapshot: { date: "2026-02-27" },
  });
  await storage.saveAiSnapshot("2026-02-28:sp500:1-4w:20:20", {
    asOf: "2026-02-28T15:00:00.000Z",
    snapshot: { date: "2026-02-28" },
  });
  await storage.saveAiSnapshot("2026-02-28:sp500:1-4w:10:10", {
    asOf: "2026-02-28T16:00:00.000Z",
    snapshot: { date: "2026-02-28" },
  });

  const latest = await storage.getLatestAiSnapshot({
    universe: "sp500",
    horizon: "1-4w",
    bullishCount: 20,
    bearishCount: 20,
  });

  assert.equal(latest?.snapshot?.date, "2026-02-28");

  await rm(file, { force: true });
});
