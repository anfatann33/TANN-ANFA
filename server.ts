
import express from 'express';
import path from 'path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import { telegramService } from './server/telegram.js';
import { apiRouter } from './server/routes.js';
import { testDatabaseConnection } from './server/postgres.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the correct frontend build directory on Render.
function resolveDistDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), 'dist'),
    __dirname,
    path.resolve(__dirname, 'dist'),
    path.resolve(__dirname, '..', 'dist'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), 'dist');
}

// Register Telegram webhook without crashing the server.
async function setupTelegramWebhook(): Promise<void> {
  if (!telegramService.isTokenConfigured()) {
    console.warn('Telegram Bot Token is not configured.');
    return;
  }

  const appUrl = (process.env.APP_URL || '')
    .trim()
    .replace(/\/+$/, '');

  const secret = (
    process.env.TELEGRAM_WEBHOOK_SECRET || ''
  ).trim();

  if (!appUrl.startsWith('https://')) {
    console.warn('APP_URL must be a public HTTPS URL.');
    return;
  }

  if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
    console.warn(
      'TELEGRAM_WEBHOOK_SECRET is missing or invalid.'
    );
    return;
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  try {
    console.log(
      `Registering Telegram webhook: ${webhookUrl}`
    );

    const result = await telegramService.setWebhook(
      webhookUrl,
      secret
    );

    if (result.ok) {
      console.log(
        `Telegram webhook registered: ${webhookUrl}`
      );
    } else {
      console.warn(
        `Telegram webhook registration failed: ${
          result.description || 'Unknown error'
        }`
      );
    }
  } catch (error) {
    console.error(
      'Telegram webhook connection error:',
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
}

// Test Supabase PostgreSQL connection.
// This does not modify any database tables.
async function setupPostgresConnection(): Promise<void> {
  console.log(
    '[PostgreSQL] Starting Supabase connection test...'
  );

  try {
    const connected = await testDatabaseConnection();

    if (connected) {
      console.log(
        '[PostgreSQL] Supabase connection test passed.'
      );
    } else {
      console.warn(
        '[PostgreSQL] Supabase connection test failed.'
      );
    }
  } catch (error) {
    console.error(
      '[PostgreSQL] Unexpected connection error:',
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
}

async function startServer(): Promise<void> {
  const app = express();

  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Protect admin API endpoints.
  // Telegram webhook remains publicly accessible
  // but requires its own secret token.
  app.use('/api', (req, res, next) => {
    if (req.path === '/telegram/webhook') {
      return next();
    }

    const username =
      process.env.ADMIN_USERNAME || 'admin';

    const password =
      process.env.ADMIN_PASSWORD || '';

    if (!password) {
      return res.status(503).json({
        error:
          'ADMIN_PASSWORD is not configured on the server',
      });
    }

    const authorization =
      req.headers.authorization || '';

    let supplied = '';

    try {
      if (authorization.startsWith('Basic ')) {
        supplied = Buffer.from(
          authorization.slice(6),
          'base64'
        ).toString('utf8');
      }
    } catch {
      // Invalid authorization header.
    }

    const expected = `${username}:${password}`;

    const suppliedBuffer = Buffer.from(supplied);
    const expectedBuffer = Buffer.from(expected);

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(
        suppliedBuffer,
        expectedBuffer
      )
    ) {
      res.setHeader(
        'WWW-Authenticate',
        'Basic realm="Khmer Tech Admin"'
      );

      return res
        .status(401)
        .send('Admin login required');
    }

    next();
  });

  // Existing API routes including Telegram webhook.
  app.use('/api', apiRouter);

  // Public health check.
  app.get('/health', (_req, res) => {
    const distPath = resolveDistDirectory();

    res.json({
      status: 'ok',
      service: 'Khmer Tech Digital Store',
      timestamp: new Date().toISOString(),
      botConfigured:
        telegramService.isTokenConfigured(),
      frontendBuilt: fs.existsSync(
        path.join(distPath, 'index.html')
      ),
    });
  });

  const distPath = resolveDistDirectory();
  const indexPath = path.join(distPath, 'index.html');

  if (process.env.NODE_ENV === 'production') {
    console.log(
      `Frontend build directory: ${distPath}`
    );

    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));

      // SPA fallback for frontend routes.
      app.get(/.*/, (req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      console.warn(
        `Frontend build not found: ${indexPath}`
      );

      app.get(/.*/, (_req, res) => {
        res.status(503).send(
          'Frontend build missing. Check Render Build Command.'
        );
      });
    }
  } else {
    const { createServer: createViteServer } =
      await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Khmer Tech Digital Store running on port ${PORT}`
    );

    console.log(
      `Telegram Bot Token configured: ${
        telegramService.isTokenConfigured()
          ? 'YES'
          : 'NO'
      }`
    );

    console.log(
      `Public App URL: ${
        process.env.APP_URL || 'Not set'
      }`
    );

    console.log(`Frontend path: ${distPath}`);

    // Initialize Telegram webhook.
    void setupTelegramWebhook();

    // Test Supabase PostgreSQL connection.
    // Does not change existing local JSON database.
    void setupPostgresConnection();
  });
}

startServer().catch((error) => {
  console.error(
    'Fatal server startup error:',
    error
  );
  process.exit(1);
});
