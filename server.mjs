import http from "node:http";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "./src/load-env.mjs";
import {
  buildExpiredSessionCookie,
  buildSessionCookie,
  createSignedSessionValue,
  hashPassword,
  parseCookies,
  sanitizeUser,
  validateRegistrationInput,
  verifyPassword,
  verifySignedSessionValue,
} from "./src/auth.mjs";
import { TTLCache } from "./src/cache.mjs";
import { config } from "./src/config.mjs";
import { UserEventHub } from "./src/events.mjs";
import { baseHeaders, readJsonBody, sendError, sendJson, sendStaticFile } from "./src/http.mjs";
import { startBackgroundJobs } from "./src/jobs.mjs";
import { MarketDataService } from "./src/market.mjs";
import { NotificationService } from "./src/notify.mjs";
import { CoinbaseTickerHub } from "./src/providers/coinbase.mjs";
import { FixedWindowRateLimiter } from "./src/rate-limit.mjs";
import { JsonStorage } from "./src/storage.mjs";

const publicDir = path.join(config.appRoot, "public");
const cache = new TTLCache();
const events = new UserEventHub();
const storage = new JsonStorage(config.dataFile);
const market = new MarketDataService(cache);
const notifier = new NotificationService(config);
const authLimiter = new FixedWindowRateLimiter();
const cryptoHub = new CoinbaseTickerHub();
const isDirectExecution = process.argv[1] ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false;

await storage.init();
const jobs = config.isServerless
  ? { stop() {} }
  : startBackgroundJobs({ storage, market, events, notifier });

export async function handleRequest(request, response, options = {}) {
  const serveStatic = options.serveStatic !== false;
  const url = new URL(request.url, `http://${request.headers.host ?? `${config.host}:${config.port}`}`);
  const context = await buildRequestContext(request);

  try {
    if (url.pathname.startsWith("/api/")) {
      return await handleApi(request, response, url, context);
    }

    if (!serveStatic) {
      throw httpError(404, "Not found.");
    }

    return await sendStaticFile(response, publicDir, url.pathname);
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    return sendError(response, statusCode, error.message, error.details ?? null);
  }
}

const server = isDirectExecution
  ? http.createServer((request, response) => handleRequest(request, response))
  : null;

if (server) {
  server.on("error", (error) => {
    console.error(`[server] ${error.message}`);
  });

  server.listen(config.port, config.host, () => {
    console.log(`Open Market Terminal running on http://${config.host}:${config.port}`);
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    jobs.stop();
    if (server) {
      server.close(() => process.exit(0));
      return;
    }
    process.exit(0);
  });
}

async function handleApi(request, response, url, context) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    const state = await storage.readState();
    return sendJson(response, 200, {
      ok: true,
      uptimeSeconds: process.uptime(),
      dataFile: config.dataFile,
      users: state.users.length,
      warnings:
        config.sessionSecret === "change-me-in-production"
          ? ["SESSION_SECRET is using the insecure default."]
          : [],
    });
  }

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    guardRateLimit(request);
    const body = await readJsonBody(request);
    validateRegistrationInput(body);
    const password = await hashPassword(body.password);
    const user = await storage.createUser({
      name: body.name,
      email: body.email,
      passwordHash: password.hash,
      passwordSalt: password.salt,
    });
    const session = await storage.createSession(user.id, config.sessionTtlMs);
    const cookie = buildSessionCookie(
      config.sessionCookieName,
      createSignedSessionValue(session.id, config.sessionSecret),
      { maxAge: config.sessionTtlMs, secure: config.secureCookies },
    );
    return sendJson(
      response,
      201,
      { authenticated: true, user: sanitizeUser(user) },
      { "Set-Cookie": cookie },
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    guardRateLimit(request);
    const body = await readJsonBody(request);
    const user = await storage.findUserByEmail(body.email ?? "");
    if (!user) {
      throw httpError(401, "Invalid email or password.");
    }
    const valid = await verifyPassword(body.password ?? "", user.passwordHash, user.passwordSalt);
    if (!valid) {
      throw httpError(401, "Invalid email or password.");
    }
    await storage.updateUserLogin(user.id);
    const session = await storage.createSession(user.id, config.sessionTtlMs);
    const cookie = buildSessionCookie(
      config.sessionCookieName,
      createSignedSessionValue(session.id, config.sessionSecret),
      { maxAge: config.sessionTtlMs, secure: config.secureCookies },
    );
    return sendJson(
      response,
      200,
      { authenticated: true, user: sanitizeUser(await storage.findUserById(user.id)) },
      { "Set-Cookie": cookie },
    );
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    if (context.session) {
      await storage.deleteSession(context.session.id);
    }
    return sendJson(
      response,
      200,
      { ok: true },
      { "Set-Cookie": buildExpiredSessionCookie(config.sessionCookieName) },
    );
  }

  if (request.method === "GET" && url.pathname === "/api/auth/session") {
    if (!context.user) {
      return sendJson(response, 200, { authenticated: false, user: null });
    }

    const [workspaces, alerts, notes, activity] = await Promise.all([
      storage.listWorkspaces(context.user.id),
      storage.listAlerts(context.user.id),
      storage.listNotes(context.user.id),
      storage.listActivity(context.user.id, 8),
    ]);

    return sendJson(response, 200, {
      authenticated: true,
      user: sanitizeUser(context.user),
      counts: {
        workspaces: workspaces.length,
        alerts: alerts.length,
        notes: notes.length,
      },
      recentActivity: activity,
    });
  }

  if (request.method === "GET" && url.pathname === "/api/profile") {
    requireAuth(context);
    return sendJson(response, 200, { preferences: context.user.preferences });
  }

  if (request.method === "PUT" && url.pathname === "/api/profile") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const preferences = await storage.updateUserPreferences(context.user.id, sanitizePreferencePatch(body));
    const activity = {
      type: "profile.updated",
      createdAt: new Date().toISOString(),
      payload: { preferences },
    };
    events.publish(context.user.id, activity);
    return sendJson(response, 200, { preferences });
  }

  if (request.method === "GET" && url.pathname === "/api/workspaces") {
    requireAuth(context);
    return sendJson(response, 200, { workspaces: await storage.listWorkspaces(context.user.id) });
  }

  if (request.method === "POST" && url.pathname === "/api/workspaces") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const workspace = await storage.saveWorkspace(context.user.id, {
      id: body.id ?? null,
      name: body.name,
      snapshot: sanitizeWorkspaceSnapshot(body.snapshot),
      isDefault: Boolean(body.isDefault),
    });
    events.publish(context.user.id, {
      type: "workspace.saved",
      createdAt: workspace.updatedAt,
      payload: { workspace },
    });
    return sendJson(response, workspace.createdAt === workspace.updatedAt ? 201 : 200, { workspace });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/workspaces/")) {
    requireAuth(context);
    const workspaceId = url.pathname.split("/").at(-1);
    await storage.deleteWorkspace(context.user.id, workspaceId);
    events.publish(context.user.id, {
      type: "workspace.deleted",
      createdAt: new Date().toISOString(),
      payload: { workspaceId },
    });
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/api/alerts") {
    requireAuth(context);
    return sendJson(response, 200, { alerts: await storage.listAlerts(context.user.id) });
  }

  if (request.method === "POST" && url.pathname === "/api/alerts") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const alert = await storage.createAlert(context.user.id, {
      symbol: String(body.symbol ?? ""),
      direction: body.direction,
      price: body.price,
    });
    events.publish(context.user.id, {
      type: "alert.created",
      createdAt: alert.createdAt,
      payload: { alert },
    });
    return sendJson(response, 201, { alert });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/alerts/")) {
    requireAuth(context);
    const alertId = url.pathname.split("/").at(-1);
    await storage.deleteAlert(context.user.id, alertId);
    events.publish(context.user.id, {
      type: "alert.deleted",
      createdAt: new Date().toISOString(),
      payload: { alertId },
    });
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/api/notes") {
    requireAuth(context);
    return sendJson(response, 200, { notes: await storage.listNotes(context.user.id) });
  }

  if (request.method === "POST" && url.pathname === "/api/notes") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const note = await storage.saveNote(context.user.id, {
      id: body.id ?? null,
      title: body.title,
      content: body.content,
      workspaceId: body.workspaceId ?? null,
    });
    events.publish(context.user.id, {
      type: "note.saved",
      createdAt: note.updatedAt,
      payload: { note },
    });
    return sendJson(response, 201, { note });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/notes/")) {
    requireAuth(context);
    const noteId = url.pathname.split("/").at(-1);
    await storage.deleteNote(context.user.id, noteId);
    events.publish(context.user.id, {
      type: "note.deleted",
      createdAt: new Date().toISOString(),
      payload: { noteId },
    });
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/api/activity") {
    requireAuth(context);
    return sendJson(response, 200, { activity: await storage.listActivity(context.user.id) });
  }

  if (request.method === "GET" && url.pathname === "/api/destinations") {
    requireAuth(context);
    return sendJson(response, 200, { destinations: await storage.listDestinations(context.user.id) });
  }

  if (request.method === "POST" && url.pathname === "/api/destinations") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const destination = await storage.saveDestination(context.user.id, sanitizeDestinationInput(body));
    events.publish(context.user.id, {
      type: "destination.saved",
      createdAt: destination.updatedAt,
      payload: { destination },
    });
    return sendJson(response, 201, { destination });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/destinations/")) {
    requireAuth(context);
    const destinationId = url.pathname.split("/").at(-1);
    await storage.deleteDestination(context.user.id, destinationId);
    events.publish(context.user.id, {
      type: "destination.deleted",
      createdAt: new Date().toISOString(),
      payload: { destinationId },
    });
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/api/digests") {
    requireAuth(context);
    return sendJson(response, 200, { digests: await storage.listDigests(context.user.id) });
  }

  if (request.method === "POST" && url.pathname === "/api/digests") {
    requireAuth(context);
    const body = await readJsonBody(request);
    const digest = await storage.saveDigest(context.user.id, sanitizeDigestInput(body));
    events.publish(context.user.id, {
      type: "digest.saved",
      createdAt: digest.updatedAt,
      payload: { digest },
    });
    return sendJson(response, 201, { digest });
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/digests/")) {
    requireAuth(context);
    const digestId = url.pathname.split("/").at(-1);
    await storage.deleteDigest(context.user.id, digestId);
    events.publish(context.user.id, {
      type: "digest.deleted",
      createdAt: new Date().toISOString(),
      payload: { digestId },
    });
    return sendJson(response, 200, { ok: true });
  }

  if (request.method === "GET" && url.pathname === "/api/stream/activity") {
    requireAuth(context);
    return streamActivity(request, response, context);
  }

  if (request.method === "GET" && url.pathname === "/api/market-pulse") {
    return sendJson(response, 200, await market.getMarketPulse());
  }

  if (request.method === "GET" && url.pathname === "/api/compare") {
    const symbols = splitList(url.searchParams.get("symbols"));
    return sendJson(response, 200, { rows: await market.compareSymbols(symbols) });
  }

  if (request.method === "GET" && url.pathname === "/api/watchlist-events") {
    const symbols = splitList(url.searchParams.get("symbols"));
    return sendJson(response, 200, { events: await market.getWatchlistEvents(symbols) });
  }

  if (request.method === "GET" && url.pathname === "/api/quote") {
    const symbols = splitList(url.searchParams.get("symbols"));
    return sendJson(response, 200, { quotes: await market.getQuotes(symbols) });
  }

  if (request.method === "GET" && url.pathname === "/api/history") {
    const symbol = required(url, "symbol");
    const range = url.searchParams.get("range") ?? "1mo";
    const interval = url.searchParams.get("interval") ?? "1d";
    return sendJson(response, 200, {
      symbol: symbol.toUpperCase(),
      range,
      interval,
      points: await market.getHistory(symbol, range, interval),
    });
  }

  if (request.method === "GET" && url.pathname === "/api/options") {
    const symbol = required(url, "symbol");
    return sendJson(response, 200, await market.getOptions(symbol, url.searchParams.get("expiration")));
  }

  if (request.method === "GET" && url.pathname === "/api/company") {
    return sendJson(response, 200, await market.getCompany(required(url, "symbol")));
  }

  if (request.method === "GET" && url.pathname === "/api/intelligence") {
    return sendJson(response, 200, await market.getRelationshipIntel(required(url, "symbol")));
  }

  if (request.method === "GET" && url.pathname === "/api/filings") {
    const company = await market.getCompany(required(url, "symbol"));
    return sendJson(response, 200, { symbol: company.symbol, filings: company.sec.filings });
  }

  if (request.method === "GET" && url.pathname === "/api/yield-curve") {
    return sendJson(response, 200, await market.getYieldCurve());
  }

  if (request.method === "GET" && url.pathname === "/api/macro") {
    return sendJson(response, 200, await market.getMacro());
  }

  if (request.method === "GET" && url.pathname === "/api/screener") {
    const symbols = splitList(url.searchParams.get("symbols"));
    const filters = {
      maxPe: parseNullableNumber(url.searchParams.get("maxPe")),
      minMarketCap: parseNullableNumber(url.searchParams.get("minMarketCap")),
      minVolume: parseNullableNumber(url.searchParams.get("minVolume")),
      minChangePct: parseNullableNumber(url.searchParams.get("minChangePct")),
    };
    const results = filterQuotes(await market.getQuotes(symbols), filters);
    return sendJson(response, 200, { count: results.length, results });
  }

  if (request.method === "GET" && url.pathname === "/api/crypto/orderbook") {
    const product = url.searchParams.get("product") ?? "BTC-USD";
    return sendJson(response, 200, await market.getOrderBook(product));
  }

  if (request.method === "GET" && url.pathname === "/api/stream/crypto") {
    return streamCrypto(url, request, response);
  }

  throw httpError(404, "Not found.");
}

async function buildRequestContext(request) {
  const cookies = parseCookies(request.headers.cookie ?? "");
  const signedValue = cookies[config.sessionCookieName];
  const sessionId = verifySignedSessionValue(signedValue, config.sessionSecret);
  if (!sessionId) {
    return { user: null, session: null };
  }

  const session = await storage.findSession(sessionId);
  if (!session) {
    return { user: null, session: null };
  }

  const user = await storage.findUserById(session.userId);
  if (!user) {
    return { user: null, session: null };
  }

  return { user, session };
}

function streamCrypto(url, request, response) {
  const products = splitList(url.searchParams.get("products"));
  const watchlist = products.length ? products : config.defaultCryptoProducts;

  response.writeHead(
    200,
    baseHeaders({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    }),
  );
  response.write(": connected\n\n");

  const send = (snapshot) => {
    response.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  };

  for (const product of watchlist) {
    const snapshot = cryptoHub.getSnapshot(product);
    if (snapshot) {
      send(snapshot);
    }
  }

  const unsubscribe = cryptoHub.subscribe(watchlist, { products: new Set(watchlist), send });
  const heartbeat = setInterval(() => {
    response.write(": heartbeat\n\n");
  }, 15000);

  request.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

function streamActivity(request, response, context) {
  response.writeHead(
    200,
    baseHeaders({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    }),
  );

  const send = (event) => {
    response.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  send({ type: "session.ready", createdAt: new Date().toISOString(), payload: {} });
  const unsubscribe = events.subscribe(context.user.id, send);
  const heartbeat = setInterval(() => {
    response.write(": heartbeat\n\n");
  }, 15000);

  request.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

function require(url, key) {
  const value = url.searchParams.get(key);
  if (!value) {
    throw httpError(400, `Missing required parameter: ${key}`);
  }
  return value;
}

function requireAuth(context) {
  if (!context.user) {
    throw httpError(401, "Authentication required.");
  }
}

function splitList(value) {
  return (value ?? "")
    .split(/[,\n\r\t ]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseNullableNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function filterQuotes(quotes, filters) {
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

function sanitizePreferencePatch(body) {
  const patch = {
    watchlistSymbols: Array.isArray(body.watchlistSymbols)
      ? body.watchlistSymbols.map(cleanSymbol).filter(Boolean).slice(0, 32)
      : undefined,
    detailSymbol: typeof body.detailSymbol === "string" ? cleanSymbol(body.detailSymbol) : undefined,
    cryptoProducts: Array.isArray(body.cryptoProducts)
      ? body.cryptoProducts.map(cleanSymbol).filter(Boolean).slice(0, 12)
      : undefined,
    screenConfig:
      body.screenConfig && typeof body.screenConfig === "object"
        ? {
            symbols: String(body.screenConfig.symbols ?? ""),
            maxPe: String(body.screenConfig.maxPe ?? ""),
            minMarketCap: String(body.screenConfig.minMarketCap ?? ""),
            minVolume: String(body.screenConfig.minVolume ?? ""),
            minChangePct: String(body.screenConfig.minChangePct ?? ""),
          }
        : undefined,
    portfolio: Array.isArray(body.portfolio)
      ? body.portfolio
          .map((position) => ({
            id: typeof position.id === "string" ? position.id : crypto.randomUUID(),
            symbol: cleanSymbol(position.symbol),
            quantity: Number(position.quantity),
            cost: Number(position.cost),
          }))
          .filter((position) => position.symbol && Number.isFinite(position.quantity) && Number.isFinite(position.cost))
          .slice(0, 250)
      : undefined,
  };

  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}

function sanitizeWorkspaceSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    return {};
  }

  return {
    watchlistSymbols: Array.isArray(snapshot.watchlistSymbols)
      ? snapshot.watchlistSymbols.map(cleanSymbol).filter(Boolean).slice(0, 32)
      : [],
    detailSymbol: typeof snapshot.detailSymbol === "string" ? cleanSymbol(snapshot.detailSymbol) : "AAPL",
    cryptoProducts: Array.isArray(snapshot.cryptoProducts)
      ? snapshot.cryptoProducts.map(cleanSymbol).filter(Boolean).slice(0, 12)
      : config.defaultCryptoProducts,
    screenConfig: snapshot.screenConfig && typeof snapshot.screenConfig === "object" ? snapshot.screenConfig : {},
    portfolio: Array.isArray(snapshot.portfolio) ? snapshot.portfolio.slice(0, 250) : [],
    selectedWorkspaceId: typeof snapshot.selectedWorkspaceId === "string" ? snapshot.selectedWorkspaceId : null,
  };
}

function cleanSymbol(value) {
  return String(value ?? "").trim().toUpperCase();
}

function sanitizeDestinationInput(body) {
  const kind = String(body.kind ?? "").trim().toLowerCase();
  if (!["webhook", "email"].includes(kind)) {
    throw httpError(400, "Destination kind must be webhook or email.");
  }

  const target = String(body.target ?? "").trim();
  if (!target) {
    throw httpError(400, "Destination target is required.");
  }

  if (kind === "webhook") {
    try {
      const url = new URL(target);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      throw httpError(400, "Webhook target must be a valid http or https URL.");
    }
  }

  if (kind === "email" && !target.includes("@")) {
    throw httpError(400, "Email target must look like an email address.");
  }

  const purposes = Array.isArray(body.purposes)
    ? body.purposes.map((value) => String(value).trim().toLowerCase()).filter((value) => ["alert", "digest"].includes(value))
    : ["alert"];

  if (!purposes.length) {
    throw httpError(400, "At least one destination purpose is required.");
  }

  return {
    id: body.id ?? null,
    kind,
    label: String(body.label ?? ""),
    target,
    purposes,
    active: body.active !== false,
  };
}

function sanitizeDigestInput(body) {
  const frequency = String(body.frequency ?? "daily").trim().toLowerCase();
  if (!["hourly", "daily", "weekly"].includes(frequency)) {
    throw httpError(400, "Digest frequency must be hourly, daily, or weekly.");
  }

  const symbols = Array.isArray(body.symbols)
    ? body.symbols.map(cleanSymbol).filter(Boolean).slice(0, 12)
    : splitList(body.symbols).slice(0, 12);

  if (!symbols.length) {
    throw httpError(400, "Digest must include at least one symbol.");
  }

  return {
    id: body.id ?? null,
    name: String(body.name ?? ""),
    symbols,
    frequency,
    destinationIds: Array.isArray(body.destinationIds)
      ? body.destinationIds.map((value) => String(value).trim()).filter(Boolean)
      : [],
    active: body.active !== false,
  };
}

function numeric(value) {
  return typeof value === "number" ? value : Number.parseFloat(value) || 0;
}

function guardRateLimit(request) {
  const key = request.socket.remoteAddress ?? "unknown";
  const result = authLimiter.check(`auth:${key}`, {
    windowMs: config.authWindowMs,
    max: config.authMaxRequests,
  });
  if (!result.allowed) {
    throw httpError(429, "Too many authentication attempts. Try again later.", {
      retryAt: new Date(result.resetAt).toISOString(),
    });
  }
}

function httpError(statusCode, message, details = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
