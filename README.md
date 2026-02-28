# Open Market Terminal

Open Market Terminal is a self-hosted market workstation built around free and public data sources. It is designed for traders, researchers, and technically inclined users who want a Bloomberg-terminal-style workspace without paying for licensed market-data infrastructure.
It combines public quotes, filings, macro calendars, public news, relationship mapping, and saved desk workflows into a single terminal-style interface.

## What The App Currently Does

The current build includes:

- A multi-page market desk with dedicated views for `Markets`, `Boards`, `Sectors`, `Calendar`, `Map`, `Quote`, `News`, `AI`, `Research`, and `Ops`
- A terminal command bar with symbol-first commands and page routing
- S&P 500 heatmap / sector-board workflows
- A security workbench with price history, filings, company facts, options snapshots, and earnings/issuer intel
- A relationship console with supply-chain, ownership, competition, corporate, geography, and impact-chain views
- A company-map page with supplier/customer views, board context, holders, geography, interlocks, and index membership
- A quote-monitor page with chart, filings, options, holders, peers, news, and event timeline windows
- News, calendar, and market-event pages built from public feeds
- An `AI` page that ranks `20 bullish` and `20 bearish` S&P 500 names for a `1-4 week` horizon and can use Gemini with Groq fallback for hosted reasoning
- Watchlists, portfolio state, alerts, workspaces, notes, and activity history
- Live crypto ticker / order-book surfaces from Coinbase public endpoints
- A dark terminal-style UI with draggable/resizable desk panels and saved layout state

## Current Page Model

### `Markets`

- Market pulse
- S&P 500 heatmap
- Ranked market-moving events
- Watchlist monitor
- Flow monitor
- Rates and macro snapshot

### `Boards`

- Leaders / laggards
- Most active
- Unusual volume
- Gap-up / gap-down proxies
- Sector performance board
- ETF tape-flow proxy board
- Macro regime board

### `Sectors`

- Sector dropdown / sector drilldown
- Sector board tiles
- Leaders and laggards for the selected sector
- Sector-linked headlines
- Paginated constituent board

### `Calendar`

- Earnings and macro calendar
- Paginated event table
- Windowed event browsing

### `Map`

- Detailed company map
- Supplier and customer views
- Competition and corporate context
- Holders, board/officer rows, insider context
- Geography and index membership
- Side-by-side company comparison

### `Quote`

- Single-name quote monitor
- Candlestick / price chart
- News and filings windows
- Options snapshot
- Holders and peers
- Event timeline

### `News`

- Broad market headlines
- Query / ticker-specific search
- Source-linked newswire layout

### `AI`

- Hosted AI-assisted long / short idea board
- S&P 500-only universe
- `20 bullish` and `20 bearish` names
- `1-4 week` horizon
- Gemini primary with Groq fallback when keys are configured
- Deterministic rules-based fallback when hosted AI is unavailable

### `Research`

- Research rail
- Security workbench
- Relationship console
- Screening and compare
- Watchlist SEC events

### `Ops`

- Portfolio state
- Alerts
- Digests / notification targets
- Saved workspaces
- Notes
- Activity stream
- Crypto tape

## Data Sources In The Current Build

This build uses public or free-to-access data paths already integrated into the codebase.

### Market / Reference Sources

- Yahoo Finance public endpoints (`query1.finance.yahoo.com` / `query2.finance.yahoo.com`)
  - quotes
  - history
  - company overview
  - options snapshots
  - earnings details
- SEC EDGAR and `data.sec.gov`
  - ticker / CIK resolution via `company_tickers.json`
  - company submissions
  - company facts
  - filing history
  - filing archive links
- U.S. Treasury
  - daily Treasury yield curve page
- BLS
  - macro snapshot inputs via the BLS public API
  - release calendar data via the BLS ICS calendar
- Federal Reserve
  - FOMC calendar parsing from the Federal Reserve calendar page
- Nasdaq public endpoints / pages
  - earnings calendar API
  - earnings detail links
  - Nasdaq-100 constituent page
- Coinbase Exchange
  - public crypto ticker
  - order book
  - websocket market data
- State Street SPY holdings
  - primary S&P 500 universe input
- Google News RSS
  - public market/news search feeds used by the news and sector headline surfaces
- Gemini API
  - optional hosted reasoning for the AI page
- Groq
  - optional hosted fallback reasoning for the AI page
- Wikipedia constituent fallbacks
  - S&P 500 companies
  - Nasdaq-100
  - Dow Jones Industrial Average

### Source Mapping By Feature

- `Quotes / history / options / company / earnings`
  - Yahoo Finance public endpoints
- `Filings / company facts / insider-related filing tape`
  - SEC EDGAR and `data.sec.gov`
- `Yield curve`
  - U.S. Treasury daily yield curve page
- `Macro snapshot`
  - BLS public API
- `Fed / policy calendar`
  - Federal Reserve FOMC calendars
- `Earnings calendar`
  - Nasdaq earnings calendar API
- `S&P 500 heatmap / sector boards`
  - State Street SPY holdings workbook, with Wikipedia S&P 500 fallback and Yahoo quote enrichment
- `Index membership`
  - Nasdaq-100 public constituents page, with Wikipedia Nasdaq-100 and Dow 30 fallbacks
- `Crypto tape / order book`
  - Coinbase Exchange REST and websocket market data
- `Newswire / sector headlines`
  - Google News RSS search feeds
- `AI bullish / bearish idea page`
  - S&P 500 live universe from the heatmap / quote stack
  - macro / yield-curve context from BLS and Treasury inputs
  - optional hosted reasoning via Gemini and Groq

### Important Note On Attribution

This repository does **not** currently integrate Financial Modeling Prep, Unusual Whales, Quartr, Fiscal.ai, S&P Global, or Polymarket. If you wire any of those providers into the app later, update the website footer and your product disclosures so the provider attribution matches the actual implementation.

## Architecture

### Backend

- [`server.mjs`](/home/grads/keshavgoyal/open-market-terminal/server.mjs)
  - HTTP server
  - API routing
  - auth/session handling
  - profile/workspace CRUD
  - market-data endpoints
- [`src/market.mjs`](/home/grads/keshavgoyal/open-market-terminal/src/market.mjs)
  - main service layer
  - quote aggregation
  - heatmap / sector board generation
  - research / map / quote monitor assembly
- [`src/storage.mjs`](/home/grads/keshavgoyal/open-market-terminal/src/storage.mjs)
  - JSON persistence
- [`src/jobs.mjs`](/home/grads/keshavgoyal/open-market-terminal/src/jobs.mjs)
  - background refresh and alert jobs
- [`src/notify.mjs`](/home/grads/keshavgoyal/open-market-terminal/src/notify.mjs)
  - webhook/email delivery

### Frontend

- [`public/index.html`](/home/grads/keshavgoyal/open-market-terminal/public/index.html)
  - shell / page structure
- [`public/app.js`](/home/grads/keshavgoyal/open-market-terminal/public/app.js)
  - all app state, rendering, command routing, and UI behavior
- [`public/styles.css`](/home/grads/keshavgoyal/open-market-terminal/public/styles.css)
  - terminal-style presentation and per-page layout rules

### Serverless / Vercel

- [`api/[...route].js`](/home/grads/keshavgoyal/open-market-terminal/api/[...route].js)
  - catch-all serverless API entry
- [`api/auth/session.js`](/home/grads/keshavgoyal/open-market-terminal/api/auth/session.js)
  - explicit auth-session route for Vercel
- [`api/session.js`](/home/grads/keshavgoyal/open-market-terminal/api/session.js)
  - compatibility alias
- [`vercel.json`](/home/grads/keshavgoyal/open-market-terminal/vercel.json)
  - Vercel function config

## Local Development

### Run

```bash
cd /home/grads/keshavgoyal/open-market-terminal
cp .env.example .env
node server.mjs
```

Then open:

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

The most important environment values are:

- `SESSION_SECRET`
  - required for real deployments
  - use a long random string
- `SECURE_COOKIES`
  - set `true` behind HTTPS
- `APP_URL`
  - public application URL
- `SEC_USER_AGENT`
  - recommended for SEC calls
- `DATA_DIR`
  - JSON storage location
- `SMTP_*` or `SENDMAIL_PATH`
  - optional, only needed for email notifications
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`
  - optional, enables Gemini on the AI page
- `GROQ_API_KEY`
  - optional, enables Groq fallback on the AI page
- `AI_PRIMARY_PROVIDER` / `AI_FALLBACK_PROVIDER`
  - optional, default to `gemini` then `groq`
- `AI_GEMINI_MODEL` / `AI_GROQ_MODEL`
  - optional hosted-model overrides

See:

- [`.env.example`](/home/grads/keshavgoyal/open-market-terminal/.env.example)
- [`DEPLOYMENT.md`](/home/grads/keshavgoyal/open-market-terminal/DEPLOYMENT.md)

## Testing

Run the test suite with:

```bash
npm test
```

The repository currently includes tests for:

- auth
- caching
- calendar parsing
- index membership logic
- intelligence graph fallbacks
- SEC provider logic
- S&P 500 universe parsing / fallback
- storage
- Yahoo provider fallbacks

## Deployment Notes

### Vercel

The app can run on Vercel, but Vercel is best treated as a request/response deployment target for this project.

Tradeoffs on Vercel:

- works for most API endpoints
- works for the frontend shell
- works for guest mode and profile/session APIs
- less ideal for long-lived streams, heavier background jobs, and persistent state

If you want a more reliable always-on deployment for background tasks and stateful behavior, a VM / Render / Railway / Fly / similar host is a better fit.

### Vercel Setup Checklist

- project root must be `open-market-terminal`
- set `SESSION_SECRET`
- set `SECURE_COOKIES=true`
- set `APP_URL`
- set `SEC_USER_AGENT`
- redeploy after env changes

## Product / Legal Notes

Open Market Terminal is an informational research interface. It is not a broker, not a registered advisor, and not a source of trading instructions. Data may be delayed, incomplete, unofficial, or unavailable depending on the upstream provider.

The global website footer now reflects the current integrated provider model and includes an informational-use disclaimer. If you add or remove data vendors, update that disclosure text accordingly.

## Suggested Next Steps

If you want to keep evolving this repository, the highest-value directions are:

1. Replace JSON persistence with SQLite or Postgres.
2. Add more provider failover for quotes/options/news.
3. Add stronger sector / market internals pages.
4. Improve the company-map graph depth with more public-source inference.
5. Add stronger caching and job orchestration for production deployments.
