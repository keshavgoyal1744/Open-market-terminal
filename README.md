# Open Market Terminal

Open Market Terminal is a self-hosted market dashboard built around public no-key data sources. It is designed as a pragmatic alternative for traders and researchers who need a serious workspace without Bloomberg-level licensing costs.

## Included

- Delayed quotes for equities, ETFs, indices, FX, and options snapshots.
- Real-time crypto streaming and public order books.
- SEC company facts and filing history.
- Treasury yield curves and BLS macro data.
- Authenticated accounts with signed session cookies.
- Saved workspaces, portfolio state, notes, alerts, and activity history.
- Background cache warming and server-side alert evaluation.
- A dark-theme relationship console for supply-chain maps, ownership, executive networks, corporate trees, geography, and event chains.
- Webhook and email destinations plus scheduled relationship digests.
- Docker and deployment documentation.

## Not included

- Licensed exchange-grade real-time equities, futures, or options feeds.
- Premium wire news, analyst research, dealer inventories, dark pools, or broker workflows.
- Bloomberg proprietary relationship intelligence across the full global universe.
- Trade execution.

Those gaps are data licensing constraints, not just missing engineering.

## Local run

```bash
cd /home/grads/keshavgoyal/open-market-terminal
cp .env.example .env
node server.mjs
```

Open `http://127.0.0.1:3000`.

## Environment

- `SESSION_SECRET`: required in any non-trivial deployment.
- `SECURE_COOKIES=true`: enable when the app is behind HTTPS.
- `SEC_USER_AGENT`: strongly recommended for SEC requests.
- `DATA_DIR`: directory that stores `state.json`.
- `SMTP_*` or `SENDMAIL_PATH`: optional, only needed for email delivery.
- `APP_URL`: used in alert and digest messages.

## Tests

```bash
npm test
```

## Deployment

See [DEPLOYMENT.md](/home/grads/keshavgoyal/open-market-terminal/DEPLOYMENT.md).

## Vercel browser analytics

This app uses the script-based Vercel Analytics and Speed Insights integration in [public/index.html](/home/grads/keshavgoyal/open-market-terminal/public/index.html), because it is a plain HTML/JS app rather than Next.js. Do not install the Next.js components unless the app is migrated to Next.

## Data quality notes

- Crypto is the only truly live market section in this build.
- Yahoo Finance endpoints are public but unofficial and may change or rate limit.
- Treasury and BLS data update on official release schedules, not every second.
- The new relationship console mixes public data with a curated local graph for symbols that have been mapped manually.
