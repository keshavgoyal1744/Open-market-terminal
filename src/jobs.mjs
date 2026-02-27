import { config } from "./config.mjs";

export function startBackgroundJobs({ storage, market, events, notifier, logger = console }) {
  const timers = [];
  const failureState = new Map();

  const safely = (label, fn) => async () => {
    try {
      await fn();
      const prior = failureState.get(label);
      if (prior) {
        failureState.delete(label);
        logger.info?.(`[jobs] ${label}: recovered`);
      }
    } catch (error) {
      const now = Date.now();
      const prior = failureState.get(label);
      if (!prior || prior.message !== error.message || now - prior.loggedAt >= 5 * 60 * 1000) {
        logger.error(`[jobs] ${label}: ${error.message}`);
        failureState.set(label, { message: error.message, loggedAt: now });
      }
    }
  };

  timers.push(setInterval(safely("warm pulse", () => market.getMarketPulse()), 30_000));
  timers.push(setInterval(safely("warm macro", () => market.getMacro()), config.macroTtlMs));
  timers.push(setInterval(safely("warm yield curve", () => market.getYieldCurve()), config.yieldCurveTtlMs));
  timers.push(setInterval(safely("cleanup sessions", () => storage.cleanupExpiredSessions()), 60 * 60 * 1000));
  timers.push(setInterval(safely("refresh tracked symbols", () => refreshTrackedSymbols(storage, market)), 45_000));
  timers.push(setInterval(safely("evaluate alerts", () => evaluateAlerts(storage, market, events, notifier)), 60_000));
  timers.push(setInterval(safely("send digests", () => sendDigests(storage, market, events, notifier)), config.digestCheckMs));

  Promise.all([market.getMacro(), market.getYieldCurve(), market.getMarketPulse()]).catch(() => {});

  return {
    stop() {
      for (const timer of timers) {
        clearInterval(timer);
      }
    },
  };
}

async function refreshTrackedSymbols(storage, market) {
  const state = await storage.readState();
  const watchlistSymbols = state.users.flatMap((user) => user.preferences?.watchlistSymbols ?? []);
  const alertSymbols = state.alerts.filter((alert) => alert.active).map((alert) => alert.symbol);
  const tracked = [...new Set([...config.marketPulseSymbols, ...watchlistSymbols, ...alertSymbols])];
  const marketSymbols = tracked.filter((symbol) => !isCryptoProduct(symbol));
  if (marketSymbols.length) {
    await market.warmQuotes(marketSymbols);
  }
}

async function evaluateAlerts(storage, market, events, notifier) {
  const alerts = await storage.listActiveAlerts();
  if (!alerts.length) {
    return;
  }

  const byType = groupBy(alerts, (alert) => (isCryptoProduct(alert.symbol) ? "crypto" : "market"));
  const quoteMap = new Map();

  if (byType.market?.length) {
    const quotes = await market.getQuotes(byType.market.map((alert) => alert.symbol));
    for (const quote of quotes) {
      quoteMap.set(quote.symbol, quote.price);
    }
  }

  if (byType.crypto?.length) {
    const tickers = await Promise.all(
      byType.crypto.map((alert) => market.getCryptoTicker(alert.symbol).then((ticker) => [alert.symbol, ticker.price])),
    );
    for (const [symbol, price] of tickers) {
      quoteMap.set(symbol, price);
    }
  }

  for (const alert of alerts) {
    const currentPrice = quoteMap.get(alert.symbol);
    if (!Number.isFinite(currentPrice)) {
      continue;
    }

    const hit = alert.direction === "above" ? currentPrice >= alert.price : currentPrice <= alert.price;
    if (!hit) {
      continue;
    }

    const result = await storage.triggerAlert(alert.id, currentPrice);
    if (result.activity) {
      events.publish(alert.userId, {
        type: "alert.triggered",
        createdAt: result.activity.createdAt,
        payload: {
          alert: result.alert,
          activity: result.activity,
        },
      });

      const user = await storage.findUserById(alert.userId);
      const destinations = await storage.listDestinationsByPurpose(alert.userId, "alert");
      if (user && destinations.length) {
        const deliveryResults = await notifier.sendAlert({
          user,
          alert: result.alert,
          marketPrice: currentPrice,
          destinations,
        });
        const deliveryActivity = await storage.appendActivity(
          alert.userId,
          "alert.notified",
          `Alert notifications processed for ${alert.symbol}.`,
          { alertId: alert.id, deliveryResults },
        );
        events.publish(alert.userId, {
          type: "alert.notified",
          createdAt: deliveryActivity.createdAt,
          payload: {
            activity: deliveryActivity,
            deliveryResults,
          },
        });
      }
    }
  }
}

async function sendDigests(storage, market, events, notifier) {
  const dueDigests = await storage.listDueDigests();
  if (!dueDigests.length) {
    return;
  }

  for (const digest of dueDigests) {
    const user = await storage.findUserById(digest.userId);
    if (!user) {
      continue;
    }

    const allDestinations = await storage.listDestinationsByPurpose(digest.userId, "digest");
    const destinations = allDestinations.filter(
      (destination) =>
        !digest.destinationIds?.length || digest.destinationIds.includes(destination.id),
    );
    if (!destinations.length || !digest.symbols?.length) {
      continue;
    }

    const intelRecords = await Promise.all(digest.symbols.slice(0, 12).map((symbol) => market.getRelationshipIntel(symbol)));
    const deliveryResults = await notifier.sendDigest({
      user,
      digest,
      intelRecords,
      destinations,
    });
    const result = await storage.markDigestRun(digest.id, deliveryResults);
    events.publish(digest.userId, {
      type: "digest.sent",
      createdAt: result.activity.createdAt,
      payload: {
        digest: result.digest,
        activity: result.activity,
        deliveryResults,
      },
    });
  }
}

function isCryptoProduct(symbol) {
  return symbol.includes("-");
}

function groupBy(items, makeKey) {
  return items.reduce((accumulator, item) => {
    const key = makeKey(item);
    const collection = accumulator[key] ?? [];
    collection.push(item);
    accumulator[key] = collection;
    return accumulator;
  }, {});
}
