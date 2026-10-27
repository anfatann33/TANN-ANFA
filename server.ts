import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import { telegramService } from './server/telegram.js';
import { apiRouter } from './server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Protect admin API endpoints. Telegram webhook is the only unauthenticated API endpoint.
  app.use('/api', (req, res, next) => {
    if (req.path === '/telegram/webhook') return next();
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || '';
    if (!password) return res.status(503).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
    const header = req.headers.authorization || '';
    let supplied = '';
    try { if (header.startsWith('Basic ')) supplied = Buffer.from(header.slice(6), 'base64').toString('utf8'); } catch { /* invalid auth */ }
    const expected = `${username}:${password}`;
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Khmer Tech Admin"');
      return res.status(401).send('Admin login required');
    }
    next();
  });

  // API Router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      botConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Khmer Tech Digital Store server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Telegram Bot Token configured: ${process.env.TELEGRAM_BOT_TOKEN ? 'YES' : 'NO'}`);
    console.log(`🌐 Public App URL: ${process.env.APP_URL || 'Not set'}`);
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
    if (telegramService.isTokenConfigured() && appUrl.startsWith('https://') && /^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
      const webhookUrl = `${appUrl}/api/telegram/webhook`;
      const result = await telegramService.setWebhook(webhookUrl, secret);
      console.log(result.ok ? `Telegram webhook registered: ${webhookUrl}` : `Telegram webhook registration failed: ${result.description || 'Unknown error'}`);
    } else {
      console.warn('Webhook not registered: configure TELEGRAM_BOT_TOKEN, APP_URL (https://), and TELEGRAM_WEBHOOK_SECRET (letters, digits, _ or -).');
    }
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
