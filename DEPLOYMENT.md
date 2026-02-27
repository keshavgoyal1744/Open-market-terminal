# Deployment

## Docker

1. Copy `.env.example` to `.env` and set a real `SESSION_SECRET`.
2. Set `APP_URL` to the externally reachable URL.
3. For email delivery, either configure `SMTP_*` or `SENDMAIL_PATH`.
4. Start the service:

```bash
docker compose up --build -d
```

3. Verify:

```bash
curl http://127.0.0.1:3000/api/health
```

## Bare metal

```bash
cd /home/grads/keshavgoyal/open-market-terminal
export SESSION_SECRET="replace-with-a-long-random-secret"
export APP_URL="https://your-domain.example"
export SEC_USER_AGENT="OpenMarketTerminal/0.2 your-email@example.com"
node server.mjs
```

## Vercel

This repository now exposes the backend through `api/[...route].js`, which forwards Vercel `/api/*` requests into the existing market server logic.

Set these environment variables in the Vercel project:

- `SESSION_SECRET`: required.
- `SECURE_COOKIES=true`: recommended because Vercel is HTTPS.
- `APP_URL=https://your-project.vercel.app`
- `SEC_USER_AGENT`: recommended for SEC requests.
- `SMTP_*` or `SENDMAIL_PATH`: optional, only if you want email delivery.

Serverless limits still matter:

- Persistent app state is ephemeral. On Vercel this build writes state into `/tmp`, which can reset on cold starts and deployments.
- Background jobs do not run continuously, so scheduled digests and polling-based automations are best-effort only.
- SSE-style endpoints such as live crypto streams can be less reliable than on a long-running host.

For stable persistence and continuous workers, use Railway, Render, Fly.io, or a VM instead.

## Reverse proxy notes

- Terminate TLS at the proxy.
- Set `SECURE_COOKIES=true` when serving over HTTPS.
- Keep the app on a private interface and proxy to `HOST=127.0.0.1` or container networking.
- If email is enabled, prefer `SMTP_SECURE=true` on port `465` or a trusted local relay.

## Persistence

- User accounts, sessions, workspaces, alerts, notes, and activity are stored in `DATA_DIR/state.json`.
- Back up the data directory if this is used beyond local testing.
