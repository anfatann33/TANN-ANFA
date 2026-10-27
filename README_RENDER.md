# Khmer Tech Digital Store — Render deployment

## IMPORTANT SECURITY
The previously shared Telegram bot token was exposed in `.env.example` and screenshots. **Revoke it in BotFather before deployment** and use a NEW token. This ZIP contains no real tokens. If old credentials are in Git history, they remain compromised even after removing the file content.

## Render Web Service
- Runtime: Node
- Node version: 22 or later
- Branch: main
- Build: `npm install && npm run build`
- Start: `npm run start`
- Instance: Free (testing only; may sleep)

Set environment variables in Render Dashboard → your Web Service → Environment:
- `NODE_ENV` = `production`
- `TELEGRAM_BOT_TOKEN` = NEW token from BotFather (keep secret)
- `TELEGRAM_WEBHOOK_SECRET` = random 32–64 characters, letters/numbers/underscore/hyphen only
- `APP_URL` = exact Render public HTTPS URL, e.g. `https://your-service.onrender.com` (no trailing slash)
- `ADMIN_USERNAME` = `admin` or your own username
- `ADMIN_PASSWORD` = unique strong password (required to protect admin API)

`PORT` is supplied by Render automatically. Do not set it manually.

## Verification
1. Wait for Render deployment status **Live**.
2. Open `https://your-service.onrender.com/health` and check `status: ok` and `botConfigured: true`.
3. Check Render logs for `Telegram webhook registered:`.
4. Open your admin dashboard and log in with HTTP Basic credentials if prompted by API requests.
5. In Telegram, send `/start` to the bot.
6. If it does not respond, check Render logs and the Telegram webhook status in the dashboard.

## Limitations
- Free Render services sleep after inactivity, which can delay Telegram webhook replies.
- The local `data/store.json` database is ephemeral on Render; products and orders can be lost after redeploy/restart. Do not use for real customer orders or payments until persistent storage is implemented.
- DigiSeller purchasing and ABA payment verification are not production-ready integrations.
- The dashboard static HTML is public; admin API endpoints are password protected. Use stronger session-based authentication before commercial launch.
