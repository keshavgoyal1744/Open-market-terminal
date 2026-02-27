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

## Reverse proxy notes

- Terminate TLS at the proxy.
- Set `SECURE_COOKIES=true` when serving over HTTPS.
- Keep the app on a private interface and proxy to `HOST=127.0.0.1` or container networking.
- If email is enabled, prefer `SMTP_SECURE=true` on port `465` or a trusted local relay.

## Persistence

- User accounts, sessions, workspaces, alerts, notes, and activity are stored in `DATA_DIR/state.json`.
- Back up the data directory if this is used beyond local testing.
