import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSessionCookie,
  createSignedSessionValue,
  hashPassword,
  parseCookies,
  verifyPassword,
  verifySignedSessionValue,
} from "../src/auth.mjs";

test("password hashing and verification work", async () => {
  const password = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", password.hash, password.salt), true);
  assert.equal(await verifyPassword("wrong", password.hash, password.salt), false);
});

test("session cookies are signed and verified", () => {
  const signed = createSignedSessionValue("session-123", "secret");
  const cookie = buildSessionCookie("omt_session", signed, { maxAge: 1000, secure: true });
  const parsed = parseCookies(cookie.replace(/;.*$/, ""));
  assert.equal(verifySignedSessionValue(parsed.omt_session, "secret"), "session-123");
  assert.equal(verifySignedSessionValue(parsed.omt_session, "wrong"), null);
});
