import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { telegramService } from './telegram.js';

export const apiRouter = Router();

// ==========================================
// 1. TELEGRAM BOT API ROUTES
// ==========================================

// Get Bot connection status (Calls real getMe)
apiRouter.get('/telegram/status', async (_req: Request, res: Response) => {
  const isConfigured = telegramService.isTokenConfigured();
  if (!isConfigured) {
    res.json({
      configured: false,
      connected: false,
      message: 'TELEGRAM_BOT_TOKEN is not configured in environment variables.',
      bot: null,
    });
    return;
  }

  const result = await telegramService.getMe();
  res.json({
    configured: true,
    connected: Boolean(result.ok && result.result),
    bot: result.result || null,
    error: result.ok ? null : (result.description || 'Failed to authenticate with Telegram'),
    errorCode: result.error_code || null,
  });
});

// Real Connection Test (Explicit diagnostic)
apiRouter.post('/telegram/test-connection', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  const isConfigured = telegramService.isTokenConfigured();

  if (!isConfigured) {
    res.status(400).json({
      success: false,
      configured: false,
      message: 'Cannot test connection: TELEGRAM_BOT_TOKEN environment variable is missing or empty.',
      hint: 'Add TELEGRAM_BOT_TOKEN="your_token_from_botfather" to your .env file or Cloud Run environment variables.',
      latencyMs: Date.now() - startTime,
    });
    return;
  }

  const telegramResult = await telegramService.getMe();
  const latencyMs = Date.now() - startTime;

  if (telegramResult.ok && telegramResult.result) {
    res.json({
      success: true,
      configured: true,
      latencyMs,
      bot: {
        id: telegramResult.result.id,
        is_bot: telegramResult.result.is_bot,
        first_name: telegramResult.result.first_name,
        username: telegramResult.result.username,
        can_join_groups: telegramResult.result.can_join_groups,
      },
      message: `Successfully connected to Telegram Bot @${telegramResult.result.username}!`,
      rawResponse: telegramResult,
    });
  } else {
    res.status(502).json({
      success: false,
      configured: true,
      latencyMs,
      error: telegramResult.description || 'Unknown error returned by Telegram Bot API',
      errorCode: telegramResult.error_code,
      message: 'Telegram API returned an error. Check if your bot token has been revoked or mistyped.',
      rawResponse: telegramResult,
    });
  }
});

// Telegram Webhook Endpoint (Accepts updates from Telegram)
apiRouter.post('/telegram/webhook', async (req: Request, res: Response) => {
  const secretHeader = req.headers['x-telegram-bot-api-secret-token'];
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expectedSecret || secretHeader !== expectedSecret) {
    console.warn('Telegram webhook received with invalid secret token');
    res.status(401).send('Unauthorized secret token');
    return;
  }

  const update = req.body;
  if (!update || typeof update !== 'object') {
    res.status(400).send('Invalid update payload');
    return;
  }

  try {
    const result = await telegramService.handleUpdate(update);
    res.json({ ok: true, handled: result.handled });
  } catch (err) {
    console.error('Error handling Telegram update:', err);
    res.status(500).json({ ok: false, error: 'Internal update processing error' });
  }
});

// Real Get Webhook Info
apiRouter.get('/telegram/webhook-info', async (_req: Request, res: Response) => {
  if (!telegramService.isTokenConfigured()) {
    res.status(400).json({
      success: false,
      message: 'TELEGRAM_BOT_TOKEN is not configured.',
    });
    return;
  }

  const info = await telegramService.getWebhookInfo();
  res.json(info);
});

// Real Set Webhook (Only allowed with working public HTTPS URL)
apiRouter.post('/telegram/set-webhook', async (req: Request, res: Response) => {
  const customUrl = req.body?.url;
  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  const webhookUrl = customUrl || (appUrl ? `${appUrl}/api/telegram/webhook` : '');

  if (!telegramService.isTokenConfigured()) {
    res.status(400).json({
      success: false,
      message: 'TELEGRAM_BOT_TOKEN is not configured on the server. Please configure your bot token in environment variables first.',
    });
    return;
  }

  if (!webhookUrl) {
    res.status(400).json({
      success: false,
      message: 'No public HTTPS webhook URL provided. Set APP_URL in your environment or enter your public HTTPS Cloud Run URL.',
    });
    return;
  }

  if (!webhookUrl.startsWith('https://')) {
    res.status(400).json({
      success: false,
      message: 'Telegram requires an HTTPS URL for webhooks. Insecure HTTP or local URLs are rejected by Telegram.',
    });
    return;
  }

  if (webhookUrl.includes('localhost') || webhookUrl.includes('127.0.0.1')) {
    res.status(400).json({
      success: false,
      message: 'Telegram cannot send webhooks to localhost. Deploy your backend to Google Cloud Run or a public HTTPS server first, then register the webhook.',
    });
    return;
  }

  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || undefined;
  const result = await telegramService.setWebhook(webhookUrl, secretToken);

  res.json({
    success: result.ok,
    webhookUrl,
    telegramResponse: result,
  });
});

// Real Delete Webhook
apiRouter.post('/telegram/delete-webhook', async (_req: Request, res: Response) => {
  const result = await telegramService.deleteWebhook();
  res.json(result);
});

// Simulator Endpoint for Admin Dashboard Testing
apiRouter.post('/telegram/simulate', async (req: Request, res: Response) => {
  const { command, callbackData, text, chatId = 12345678, username = 'test_user' } = req.body;

  let simulatedUpdate: any = null;

  if (callbackData) {
    simulatedUpdate = {
      update_id: Date.now(),
      callback_query: {
        id: `cq_${Date.now()}`,
        from: { id: chatId, is_bot: false, first_name: 'Test Customer', username },
        message: {
          message_id: 101,
          chat: { id: chatId, type: 'private', first_name: 'Test Customer' },
          date: Math.floor(Date.now() / 1000),
          text: 'Current Menu',
        },
        data: callbackData,
      },
    };
  } else {
    simulatedUpdate = {
      update_id: Date.now(),
      message: {
        message_id: 101,
        from: { id: chatId, is_bot: false, first_name: 'Test Customer', username },
        chat: { id: chatId, type: 'private', first_name: 'Test Customer' },
        date: Math.floor(Date.now() / 1000),
        text: command || text || '/start',
      },
    };
  }

  try {
    // Generate response preview without requiring live Telegram network call to deliver
    if (callbackData?.startsWith('cat_')) {
      const catId = callbackData.replace('cat_', '');
      const resp = telegramService.buildCategoryResponse(catId);
      res.json({
        success: true,
        type: 'callback_query',
        response: resp,
      });
      return;
    }

    if (callbackData?.startsWith('buy_')) {
      const prodId = callbackData.replace('buy_', '');
      const resp = telegramService.buildProductDetailResponse(prodId);
      res.json({
        success: true,
        type: 'callback_query',
        response: resp,
      });
      return;
    }

    if (command === '/start' || simulatedUpdate.message?.text === '/start') {
      const settings = db.getSettings();
      res.json({
        success: true,
        type: 'message',
        response: {
          text: settings.welcomeMessageKhmer,
          replyMarkup: telegramService.getMainStoreKeyboard(),
        },
      });
      return;
    }

    // Default handle via TelegramService
    const result = await telegramService.handleUpdate(simulatedUpdate);
    res.json({
      success: true,
      result,
      simulatedUpdate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Simulation error',
    });
  }
});

// ==========================================
// 2. PRODUCT MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/products', (req: Request, res: Response) => {
  const { categoryId, status, search } = req.query;
  const products = db.getProducts({
    categoryId: categoryId as string | undefined,
    status: status as string | undefined,
    search: search as string | undefined,
  });
  res.json({ products, count: products.length });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProduct(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

apiRouter.post('/products', (req: Request, res: Response) => {
  const { title, titleKhmer, description, descriptionKhmer, categoryId, priceUSD, stock, sku, deliveryType, deliveryContent, status, digisellerProductId } = req.body;

  if (!title || !categoryId || priceUSD === undefined) {
    res.status(400).json({ error: 'title, categoryId, and priceUSD are required' });
    return;
  }

  const product = db.createProduct({
    title,
    titleKhmer: titleKhmer || title,
    description: description || '',
    descriptionKhmer: descriptionKhmer || '',
    categoryId,
    priceUSD: Number(priceUSD),
    stock: stock !== undefined ? Number(stock) : 10,
    sku: sku || `SKU-${Date.now().toString().slice(-5)}`,
    deliveryType: deliveryType || 'instant_license_key',
    deliveryContent: deliveryContent || '',
    status: status || 'active',
    digisellerProductId: digisellerProductId || undefined,
  });

  res.status(201).json({ product });
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  const product = db.updateProduct(req.params.id, req.body);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ product });
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted' });
});

// ==========================================
// 3. CATEGORY MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  // Attach count of active products to each category
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    productCount: db.getProducts({ categoryId: cat.id }).length,
    activeProductCount: db.getProducts({ categoryId: cat.id, status: 'active' }).length,
  }));
  res.json({ categories: categoriesWithCounts });
});

apiRouter.put('/categories/:id', (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ category: updated });
});

// ==========================================
// 4. ORDER MANAGEMENT ROUTES
// ==========================================

apiRouter.get('/orders', (req: Request, res: Response) => {
  const { telegramUserId } = req.query;
  const orders = db.getOrders(telegramUserId as string | undefined);
  res.json({ orders, count: orders.length });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrder(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order });
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  const { telegramUserId, telegramUsername, items, totalAmountUSD, paymentMethod } = req.body;

  if (!telegramUserId || !items || !totalAmountUSD) {
    res.status(400).json({ error: 'Missing required order fields' });
    return;
  }

  const settings = db.getSettings();
  const khrTotal = Math.round(Number(totalAmountUSD) * (settings.khrExchangeRate || 4100));

  const order = db.createOrder({
    telegramUserId,
    telegramUsername: telegramUsername || '',
    items,
    totalAmountUSD: Number(totalAmountUSD),
    totalAmountKHR: khrTotal,
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending',
    paymentMethod: paymentMethod || 'aba_khqr',
  });

  res.status(201).json({ order });
});

apiRouter.put('/orders/:id', (req: Request, res: Response) => {
  const updated = db.updateOrder(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json({ order: updated });
});

// ==========================================
// 5. SETTINGS & INTEGRATIONS ROUTES
// ==========================================

apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  const envStatus = {
    telegramBotTokenConfigured: telegramService.isTokenConfigured(),
    telegramWebhookSecretConfigured: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
    appUrl: process.env.APP_URL || '',
    digisellerApiKeyConfigured: Boolean(process.env.DIGISELLER_API_KEY),
    abaApiKeyConfigured: Boolean(process.env.ABA_PAYWAY_API_KEY),
  };
  res.json({ settings, envStatus });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json({ settings: updated });
});

// Optional Seed Starter Digital Products (Admin tool)
apiRouter.post('/settings/seed-products', (_req: Request, res: Response) => {
  const sampleProducts = [
    {
      title: 'ChatGPT Plus 1-Month Shared Account',
      titleKhmer: 'គណនី ChatGPT Plus រយៈពេល 1 ខែ',
      description: 'Access GPT-4o, DALL-E 3, advanced data analysis, and voice mode with high speed.',
      categoryId: 'chatgpt',
      priceUSD: 6.50,
      stock: 15,
      sku: 'CGPT-PLUS-1M',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'Email: user.khmer1@techstore.com | Password: TempPassword#2026',
      status: 'active' as const,
    },
    {
      title: 'Gemini Advanced 2.0 Subscription',
      titleKhmer: 'គណនី Gemini Advanced 2.0',
      description: 'Google AI Ultra model with 2M context window and Google One 2TB Cloud storage included.',
      categoryId: 'gemini',
      priceUSD: 7.00,
      stock: 10,
      sku: 'GEMINI-ADV-1M',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'Google Workspace Account: g-ai@khmertech.com | Pass: SecureGemini2026',
      status: 'active' as const,
    },
    {
      title: 'Claude 3.5 Sonnet / Opus Access',
      titleKhmer: 'Claude 3.5 Sonnet / Opus Pro',
      description: 'Top-tier coding and reasoning assistant. Direct web access and artifacts.',
      categoryId: 'claude',
      priceUSD: 8.00,
      stock: 8,
      sku: 'CLAUDE-PRO-1M',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'Claude Pro Login: claude_user_kh@gmail.com | Pass: ClaudeAi#2026',
      status: 'active' as const,
    },
    {
      title: 'DeepSeek API Balance Credit ($10 Credit)',
      titleKhmer: 'កាត DeepSeek API $10 Credit',
      description: 'High performance coding and deep reasoning API key ready for Cursor, Continue, or custom apps.',
      categoryId: 'deepseek_api',
      priceUSD: 11.50,
      stock: 25,
      sku: 'DSEEK-API-10',
      deliveryType: 'instant_license_key' as const,
      deliveryContent: 'sk-ds-998822001144aabbeecc9988776655',
      status: 'active' as const,
    },
    {
      title: 'Cursor Pro AI Code Editor (1 Month)',
      titleKhmer: 'Cursor Pro AI Code Editor (1 ខែ)',
      description: 'Unlimited fast premium requests, composer agent, and codebase indexing.',
      categoryId: 'cursor_api',
      priceUSD: 9.50,
      stock: 12,
      sku: 'CURSOR-PRO-1M',
      deliveryType: 'instant_license_key' as const,
      deliveryContent: 'License Token: CURSOR-PRO-KH-99283-ACTIVE',
      status: 'active' as const,
    },
    {
      title: 'Adobe Creative Cloud All Apps (1 Year)',
      titleKhmer: 'Adobe Creative Cloud All Apps 1 ឆ្នាំ',
      description: 'Photoshop, Illustrator, Premiere Pro, After Effects, and 100GB Cloud Storage.',
      categoryId: 'adobe',
      priceUSD: 45.00,
      stock: 5,
      sku: 'ADOBE-CC-1Y',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'Adobe Enterprise License ID: adobe-ent-kh-2026',
      status: 'active' as const,
    },
    {
      title: 'NordVPN 2-Year Ultimate Privacy',
      titleKhmer: 'NordVPN រយៈពេល 2 ឆ្នាំ',
      description: 'High-speed servers worldwide with Threat Protection Pro and Dark Web Monitor.',
      categoryId: 'vpn',
      priceUSD: 24.00,
      stock: 20,
      sku: 'NORDVPN-2Y',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'NordVPN Email: vpn-khmer@privacy.com | Password: SecureVpn#2026',
      status: 'active' as const,
    },
    {
      title: 'Spotify Premium Individual (6 Months)',
      titleKhmer: 'Spotify Premium 6 ខែ',
      description: 'Ad-free music listening, offline downloads, and high-fidelity sound quality.',
      categoryId: 'music',
      priceUSD: 12.00,
      stock: 30,
      sku: 'SPOTIFY-6M',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'Spotify Account: spotify_kh2026@gmail.com | Password: SpotifySound#1',
      status: 'active' as const,
    },
    {
      title: 'Canva Pro Edu / Lifetime Team Invite',
      titleKhmer: 'Canva Pro Lifetime Invite',
      description: 'Full access to premium templates, brand kits, background remover, and magic studio.',
      categoryId: 'design',
      priceUSD: 5.00,
      stock: 50,
      sku: 'CANVA-PRO-TEAM',
      deliveryType: 'instant_license_key' as const,
      deliveryContent: 'https://www.canva.com/brand/join?token=canva_khmer_tech_team_invite',
      status: 'active' as const,
    },
    {
      title: 'ElevenLabs Creator Voice AI (100k Characters)',
      titleKhmer: 'ElevenLabs Voice AI 100,000 Characters',
      description: 'Ultra-realistic human voice cloning and multilingual speech synthesis.',
      categoryId: 'elevenlabs',
      priceUSD: 15.00,
      stock: 6,
      sku: 'ELEVEN-100K',
      deliveryType: 'account_credentials' as const,
      deliveryContent: 'ElevenLabs Account: voice_kh@ai.com | Password: ElevenVoice#2026',
      status: 'active' as const,
    },
  ];

  const addedProducts = [];
  for (const item of sampleProducts) {
    const existing = db.getProducts({ categoryId: item.categoryId }).find(p => p.sku === item.sku);
    if (!existing) {
      addedProducts.push(db.createProduct(item));
    }
  }

  res.json({
    success: true,
    message: `Added ${addedProducts.length} starter products across categories.`,
    addedCount: addedProducts.length,
    products: addedProducts,
  });
});
