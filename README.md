# Open Market Terminal

Open Market Terminal is a self-hosted market workstation built around public and free-to-access data sources. It combines market monitoring, single-name research, sector drilldowns, company relationship mapping, alerts, workspaces, notes, and a shared daily AI idea board in a terminal-style interface.

## Overview

The app is organized as a multi-page desk:

- `Markets`
- `Boards`
- `Sectors`
- `Calendar`
- `Map`
- `Quote`
- `News`
- `AI`
- `Research`
- `Ops`

Core product themes:

- live market monitoring with public quote sources
- single-name research and relationship mapping
- calendar, news, filings, and event tracking
- saved desk state, alerts, notes, and activity history
- optional hosted AI reasoning with Gemini primary and Groq fallback

## Feature Inventory

### Market Monitoring

- Cross-asset market pulse board
- S&P 500 heatmap with sector grouping
- Heatmap hover intelligence and references
- Sector drilldowns with leaders, laggards, headlines, and constituent board
- Market-moving events board
- Flow monitor for share volume, relative volume, options availability, and short-interest context
- Rates and macro panel with Treasury curve and macro snapshot
- Market monitor boards for:
  - leaders
  - laggards
  - most active
  - unusual volume
  - gap proxies
  - sector performance
  - ETF tape proxies
  - macro board

### Research Workflows

- Research rail with watchlist symbols, grouping, pins, and sparklines
- Security workbench with:
  - quote summary
  - price history
  - candlestick-style chart
  - SEC filings
  - company facts
  - degraded options snapshot
  - earnings intel drawer
- Relationship console with view switching for:
  - `SPLC`
  - `REL`
  - `OWN`
  - `BMAP`
  - `RV`
  - `FA`
  - `DES`
- Relationship graph with:
  - supplier / partner nodes
  - customer nodes
  - corporate links
  - competition / ecosystem nodes
  - impact chains
  - geography exposure

### Company Mapping

- Dedicated `Map` page
- Supplier and customer breakdowns
- Corporate structure and acquisitions
- Competition and ecosystem context
- Top holders view
- Board and officer view
- Insider ownership / insider rows
- Geographic exposure
- Index membership
- Board interlock context
- Side-by-side company comparison
- Click-through drilldowns when a related ticker is known

### Quote Monitoring

- Dedicated `Quote` page for one symbol
- Quote / tape summary
- Linked chart
- Symbol-specific news
- Symbol-specific event timeline
- SEC filings tape
- Options summary and front chain snapshot
- Peer table
- Holders table

### News and Event Coverage

- General market news page
- Ticker / company / theme news search
- Sector-linked news on the sector page
- Desk calendar with:
  - earnings events
  - macro events
  - policy events
  - pagination and filter controls
- Market-moving events timeline across:
  - policy
  - earnings
  - filings
  - live headlines

### AI Idea Board

- Dedicated `AI` page
- S&P 500-only universe
- `1-4 week` horizon
- `20 bullish` and `20 bearish` names
- Shared daily snapshot instead of per-user reruns
- Scheduled for `10:00 AM` `America/New_York`
- Gemini primary hosted provider
- Groq hosted fallback
- Deterministic rules-based fallback when hosted AI is unavailable
- Snapshot reused for all viewers during the same day to limit token usage

### User, Persistence, and Operations

- Account registration and sign-in
- Signed session cookies
- Guest mode
- Saved profile preferences
- Saved workspaces
- Desk notes
- Activity stream
- Server-side alerts
- Digest destinations
- Webhook and email notification support
- Background jobs for refresh and alert evaluation
- JSON-backed persistence
- Docker and docker-compose support
- Vercel deployment support

### Crypto

- Coinbase public ticker data
- Coinbase public order book
- Crypto panel on the `Ops` page

## Page Guide

### `Markets`

Primary market overview page.

- Market Pulse
- S&P 500 Heatmap
- Market-Moving Events
- Watchlist
- Flow Monitor
- Rates & Macro

### `Boards`

Classic monitor boards page.

- Leaders
- Laggards
- Most Active
- Unusual Volume
- Gap Up / Gap Down proxies
- Sector Performance
- ETF Tape
- Macro Board

### `Sectors`

Sector-specific drilldown page.

- sector selector
- sector board tiles
- leaders
- laggards
- sector headlines
- paginated constituent board
- sector overflow modal for additional names

### `Calendar`

Event browsing page.

- earnings calendar
- macro and policy dates
- page size controls
- date window filters
- paginated event table

### `Map`

Company relationship page.

- suppliers
- customers
- competition
- holders
- board and officers
- insiders
- geography
- index membership
- corporate events
- side-by-side comparison

### `Quote`

Single-name monitor page.

- headline quote block
- chart
- symbol-specific news
- event timeline
- filings
- options
- peers
- holders

### `News`

Market and ticker news page.

- general market headlines
- search by symbol or company
- linked sources
- source and category metadata
- pagination

### `AI`

Daily long / short snapshot page.

- daily shared AI snapshot
- market frame
- monitor list
- bullish 20
- bearish 20
- provider and snapshot metadata

### `Research`

Deep research workspace.

- research rail
- security workbench
- relationship console
- screening and compare
- watchlist SEC events

### `Ops`

Operational workspace.

- portfolio state
- alerts
- Intel Ops destinations and digests
- workspace vault
- notes
- activity
- crypto tape

## Command Workflow

The app includes a terminal-style command bar and keyboard navigation.

Examples:

- `AAPL US <Equity> DES`
- `QUOTE NVDA`
- `MAP AAPL MSFT`
- `PAGE NEWS`
- `SECTOR Technology`

Keyboard behavior:

- `Ctrl/Cmd + K` opens the command palette
- `[` and `]` cycle through watchlist symbols

## Data Sources

The current build uses the following sources that are already integrated into the codebase.

### Market and Company Data

- Yahoo Finance public endpoints
  - quotes
  - price history
  - company overview
  - options snapshots
  - earnings details
- SEC EDGAR and `data.sec.gov`
  - company submissions
  - company facts
  - filing history
  - filing document links

### Macro and Calendar Data

- U.S. Treasury daily yield curve page
- BLS public API
- BLS release calendar
- Federal Reserve FOMC calendars
- Nasdaq earnings calendar and related public pages

### Universe and Index Inputs

- State Street SPY holdings workbook
- Nasdaq-100 public constituents page
- Wikipedia fallbacks for:
  - S&P 500
  - Nasdaq-100
  - Dow Jones Industrial Average

### News and Crypto

- Google News RSS
- Coinbase Exchange public market data

### Optional Hosted AI

- Gemini API
- Groq

## Source Mapping By Feature

- `Quotes / history / options / company / earnings`
  - Yahoo Finance public endpoints
- `Filings / company facts / insider-related filing tape`
  - SEC EDGAR and `data.sec.gov`
- `Yield curve`
  - U.S. Treasury
- `Macro snapshot`
  - BLS public API
- `Fed / policy calendar`
  - Federal Reserve
- `Earnings calendar`
  - Nasdaq public earnings calendar
- `Heatmap / sector boards`
  - State Street SPY holdings with sector normalization and quote enrichment
- `Index membership`
  - Nasdaq public constituents pages plus Wikipedia fallbacks
- `News / sector headlines`
  - Google News RSS
- `Crypto tape / order book`
  - Coinbase Exchange
- `AI page`
  - live S&P 500 universe from the heatmap stack
  - macro and curve context from BLS and Treasury inputs
  - optional hosted reasoning from Gemini and Groq

## Architecture

### Backend

- [server.mjs](/home/grads/keshavgoyal/open-market-terminal/server.mjs)
  - HTTP server
  - API routes
  - auth/session handling
  - profile and workspace routes
- [src/market.mjs](/home/grads/keshavgoyal/open-market-terminal/src/market.mjs)
  - market-data service layer
  - page payload assembly
  - heatmap, sector, quote, map, research, AI, and board logic
- [src/storage.mjs](/home/grads/keshavgoyal/open-market-terminal/src/storage.mjs)
  - JSON persistence
  - sessions
  - workspaces
  - alerts
  - notes
  - activity
  - AI snapshot persistence
- [src/jobs.mjs](/home/grads/keshavgoyal/open-market-terminal/src/jobs.mjs)
  - background jobs
  - alert evaluation
  - digest delivery
  - AI daily snapshot refresh
- [src/notify.mjs](/home/grads/keshavgoyal/open-market-terminal/src/notify.mjs)
  - webhook and email delivery

### Frontend

- [public/index.html](/home/grads/keshavgoyal/open-market-terminal/public/index.html)
  - shell
  - page sections
  - modals and overlays
- [public/app.js](/home/grads/keshavgoyal/open-market-terminal/public/app.js)
  - state
  - rendering
  - command routing
  - keyboard behavior
  - page transitions
- [public/styles.css](/home/grads/keshavgoyal/open-market-terminal/public/styles.css)
  - terminal-style presentation
  - page-specific layouts
  - heatmap, map, quote, and AI page styling

### Serverless / Vercel

- [api/[...route].js](/home/grads/keshavgoyal/open-market-terminal/api/[...route].js)
  - catch-all serverless entry
- [api/auth/session.js](/home/grads/keshavgoyal/open-market-terminal/api/auth/session.js)
  - auth-session route
- [api/session.js](/home/grads/keshavgoyal/open-market-terminal/api/session.js)
  - compatibility alias
- [vercel.json](/home/grads/keshavgoyal/open-market-terminal/vercel.json)
  - function config
  - daily AI cron schedule

## API Surface

The backend currently exposes routes for:

- auth and session
  - `/api/auth/register`
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/session`
  - `/api/session`
- user persistence
  - `/api/profile`
  - `/api/workspaces`
  - `/api/alerts`
  - `/api/notes`
  - `/api/activity`
  - `/api/destinations`
  - `/api/digests`
- market and research data
  - `/api/market-pulse`
  - `/api/compare`
  - `/api/watchlist-events`
  - `/api/research-rail`
  - `/api/calendar`
  - `/api/news`
  - `/api/earnings`
  - `/api/market-events`
  - `/api/heatmap`
  - `/api/heatmap-context`
  - `/api/sector-board`
  - `/api/flow`
  - `/api/market-boards`
  - `/api/ai-lab`
  - `/api/quote-monitor`
  - `/api/quote`
  - `/api/history`
  - `/api/options`
  - `/api/company`
  - `/api/intelligence`
  - `/api/company-map`
  - `/api/filings`
  - `/api/yield-curve`
  - `/api/macro`
  - `/api/screener`
- crypto
  - `/api/crypto/orderbook`
  - `/api/crypto/ticker`
  - `/api/stream/crypto`
- scheduled AI generation
  - `/api/cron/ai-daily`

## Local Development

### Run Locally

```bash
cd /home/grads/keshavgoyal/open-market-terminal
cp .env.example .env
node server.mjs
```

Open:

```text
http://127.0.0.1:3000
```

### Docker

```bash
cd /home/grads/keshavgoyal/open-market-terminal
cp .env.example .env
docker compose up --build
```

## Environment Variables

Core app settings:

- `SESSION_SECRET`
- `SECURE_COOKIES`
- `APP_URL`
- `SEC_USER_AGENT`
- `DATA_DIR`

Notification settings:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_STARTTLS`
- `SMTP_USER`
- `SMTP_PASS`
- `SENDMAIL_PATH`
- `EMAIL_FROM`

AI settings:

- `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- `GROQ_API_KEY`
- `AI_PRIMARY_PROVIDER`
- `AI_FALLBACK_PROVIDER`
- `AI_GEMINI_MODEL`
- `AI_GROQ_MODEL`
- `AI_TIMEOUT_MS`
- `AI_TTL_MS`
- `AI_DAILY_TIMEZONE`
- `AI_DAILY_HOUR`
- `AI_DAILY_MINUTE`

See:

- [.env.example](/home/grads/keshavgoyal/open-market-terminal/.env.example)
- [DEPLOYMENT.md](/home/grads/keshavgoyal/open-market-terminal/DEPLOYMENT.md)

## Daily AI Snapshot Behavior

The `AI` page no longer behaves like a per-user “run query now” tool.

Current behavior:

- one shared snapshot per day
- scheduled for `10:00 AM` `America/New_York`
- same snapshot served to all viewers for the rest of the day
- background refresh in always-on environments
- cron-triggered refresh on Vercel

This is intended to reduce repeated token usage across Gemini and Groq.

## Testing

Run:

```bash
npm test
```

Current test coverage includes:

- auth
- caching
- calendar parsing
- index membership logic
- intelligence graph fallbacks
- SEC provider logic
- S&P 500 universe parsing and fallback
- storage
- Yahoo provider fallbacks

## Deployment Notes

### Vercel

The app can run on Vercel and includes:

- serverless route entry
- explicit session route support
- AI daily cron route
- shared snapshot behavior for the AI page

Recommended Vercel checklist:

- set project root to `open-market-terminal`
- set `SESSION_SECRET`
- set `SECURE_COOKIES=true`
- set `APP_URL`
- set `SEC_USER_AGENT`
- set AI keys if you want hosted AI
- redeploy after env changes

### Stateful Hosting

If you want more reliable persistent behavior for:

- background jobs
- long-lived streams
- notification delivery
- shared state

then a more always-on host such as Render, Railway, Fly, or a VM is a better fit than pure serverless hosting.

## Product / Legal Notes

Open Market Terminal is an informational research interface. It is not a broker, not a registered advisor, and not a source of trading instructions. Data may be delayed, incomplete, unofficial, or unavailable depending on the upstream provider.

If you add or remove providers, update the footer and attribution copy so the public disclosure matches the actual implementation.

## Suggested Next Steps

Useful next directions for the project:

1. Replace JSON persistence with SQLite or Postgres.
2. Add stronger quote/options/news provider failover.
3. Add more market internals and breadth studies.
4. Deepen the public company-map inference layer.
5. Move AI snapshots to a persistent shared store for fully reliable once-per-day generation on serverless hosts.
