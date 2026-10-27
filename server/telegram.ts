
import { db } from './db.js';
import { TelegramBotInfo, TelegramWebhookInfo } from './types.js';

interface Button {
  text: string;
  callback_data?: string;
  url?: string;
}

interface Keyboard {
  inline_keyboard: Button[][];
}

const CATEGORY_ROWS = [
  ['chatgpt', 'gemini', 'grok'],
  ['codex_api', 'claude', 'kimi'],
  ['video_ai', 'elevenlabs', 'ai_tools'],
  ['qwen_api', 'deepseek_api', 'cursor_api'],
  ['adobe', 'autodesk', 'design'],
  ['office', 'education', 'streaming'],
  ['music', 'vpn', 'security'],
  ['games', 'social', 'discord'],
];

const CATEGORY_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  grok: 'Grok',
  codex_api: 'Codex API',
  claude: 'Claude',
  kimi: 'Kimi',
  video_ai: 'Video AI',
  elevenlabs: 'ElevenLabs',
  ai_tools: 'AI Tools',
  qwen_api: 'Qwen API',
  deepseek_api: 'DeepSeek API',
  cursor_api: 'Cursor API',
  adobe: 'Adobe',
  autodesk: 'Autodesk',
  design: 'Design',
  office: 'Office',
  education: 'Education',
  streaming: 'Streaming',
  music: 'Music',
  vpn: 'VPN',
  security: 'Security',
  games: 'Games',
  social: 'Social',
  discord: 'Discord',
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function backKeyboard(): Keyboard {
  return {
    inline_keyboard: [
      [{ text: '⬅️ Back', callback_data: 'action_back' }],
    ],
  };
}

export class TelegramService {
  private get token(): string {
    return process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  }

  private get baseUrl(): string {
    return `https://api.telegram.org/bot${this.token}`;
  }

  public isTokenConfigured(): boolean {
    return Boolean(
      this.token &&
      this.token.length > 10 &&
      this.token.includes(':')
    );
  }

  private async apiRequest<T = any>(
    method: string,
    payload?: Record<string, unknown>
  ): Promise<T> {
    if (!this.isTokenConfigured()) {
      return {
        ok: false,
        description: 'Bot token not configured',
      } as T;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      12000
    );

    try {
      const response = await fetch(
        `${this.baseUrl}/${method}`,
        {
          method: payload ? 'POST' : 'GET',
          headers: payload
            ? { 'Content-Type': 'application/json' }
            : undefined,
          body: payload
            ? JSON.stringify(payload)
            : undefined,
          signal: controller.signal,
        }
      );

      const result = await response.json() as T;

      if (!response.ok) {
        console.error(
          `Telegram ${method} HTTP ${response.status}`
        );
      }

      return result;
    } catch (error) {
      const detail = error instanceof Error
        ? error.message
        : String(error);

      console.error(
        `Telegram ${method} request failed: ${detail}`
      );

      return {
        ok: false,
        description: detail,
      } as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async getMe(): Promise<{
    ok: boolean;
    result?: TelegramBotInfo;
    description?: string;
    error_code?: number;
  }> {
    return this.apiRequest('getMe');
  }

  public async setWebhook(
    webhookUrl: string,
    secretToken?: string
  ): Promise<{
    ok: boolean;
    description?: string;
    result?: boolean;
  }> {
    const payload: Record<string, unknown> = {
      url: webhookUrl,
      allowed_updates: ['message', 'callback_query'],
    };

    if (secretToken) {
      payload.secret_token = secretToken;
    }

    return this.apiRequest('setWebhook', payload);
  }

  public async getWebhookInfo(): Promise<{
    ok: boolean;
    result?: TelegramWebhookInfo;
    description?: string;
  }> {
    return this.apiRequest('getWebhookInfo');
  }

  public async deleteWebhook(): Promise<{
    ok: boolean;
    description?: string;
  }> {
    return this.apiRequest('deleteWebhook', {});
  }

  public async sendMessage(
    chatId: number | string,
    text: string,
    replyMarkup?: Keyboard
  ): Promise<any> {
    return this.apiRequest('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup
        ? { reply_markup: replyMarkup }
        : {}),
    });
  }

  public async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    replyMarkup?: Keyboard
  ): Promise<any> {
    return this.apiRequest('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...(replyMarkup
        ? { reply_markup: replyMarkup }
        : {}),
    });
  }

  public async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<any> {
    return this.apiRequest('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
      show_alert: showAlert,
    });
  }

  public getMainStoreKeyboard(): Keyboard {
    const keyboard: Button[][] = CATEGORY_ROWS.map(
      row => row.map(id => ({
        text: CATEGORY_NAMES[id],
        callback_data: `cat_${id}`,
      }))
    );

    keyboard.push(
      [
        {
          text: '🔍 Search Products',
          callback_data: 'action_search',
        },
        {
          text: '📦 All Products',
          callback_data: 'action_all',
        },
      ],
      [
        {
          text: '🛍️ My Orders',
          callback_data: 'action_orders',
        },
        {
          text: '💬 Support',
          callback_data: 'action_support',
        },
      ],
      [
        {
          text: '⬅️ Back',
          callback_data: 'action_back',
        },
      ]
    );

    return { inline_keyboard: keyboard };
  }

  public buildCategoryResponse(categoryId: string): {
    text: string;
    replyMarkup: Keyboard;
  } {
    const category = db.getCategory(categoryId);
    const settings = db.getSettings();

    const name = escapeHtml(
      category?.name || CATEGORY_NAMES[categoryId] || categoryId
    );

    const products = db.getProducts({
      categoryId,
      status: 'active',
    });

    if (products.length === 0) {
      return {
        text:
          `📁 <b>ប្រភេទ៖ ${name}</b>\n\n` +
          '⚠️ ប្រភេទនេះមិនទាន់មានទំនិញនៅឡើយទេ។',
        replyMarkup: backKeyboard(),
      };
    }

    let text =
      `📁 <b>ប្រភេទ៖ ${name}</b>\n\n`;

    const keyboard: Button[][] = [];

    for (const product of products.slice(0, 20)) {
      const khr = Math.round(
        product.priceUSD *
        (settings.khrExchangeRate || 4100)
      );

      text +=
        `📦 <b>${escapeHtml(product.title)}</b>\n` +
        `💰 $${product.priceUSD.toFixed(2)} ` +
        `(~${khr.toLocaleString()}៛)\n` +
        `Stock: ${product.stock}\n\n`;

      keyboard.push([{
        text: `🛒 ${product.title}`,
        callback_data: `buy_${product.id}`,
      }]);
    }

    keyboard.push([
      { text: '⬅️ Back', callback_data: 'action_back' },
    ]);

    return {
      text,
      replyMarkup: { inline_keyboard: keyboard },
    };
  }

  public buildProductDetailResponse(productId: string): {
    text: string;
    replyMarkup: Keyboard;
  } {
    const product = db.getProduct(productId);
    const settings = db.getSettings();

    if (!product || product.status !== 'active') {
      return {
        text: '⚠️ ផលិតផលនេះមិនមានសម្រាប់លក់ទេ។',
        replyMarkup: backKeyboard(),
      };
    }

    if (product.stock < 1) {
      return {
        text: '⚠️ ផលិតផលនេះអស់ពីស្តុកហើយ។',
        replyMarkup: backKeyboard(),
      };
    }

    const khr = Math.round(
      product.priceUSD *
      (settings.khrExchangeRate || 4100)
    );

    const text =
      '🛍️ <b>Order Details</b>\n\n' +
      `📌 ${escapeHtml(product.title)}\n` +
      `💰 $${product.priceUSD.toFixed(2)} ` +
      `(~${khr.toLocaleString()}៛)\n` +
      `📦 Stock: ${product.stock}\n\n` +
      `${escapeHtml(product.description)}\n\n` +
      '🧪 <b>Sandbox Testing Only</b>\n' +
      'ចុច Confirm Order ដើម្បីបង្កើត ' +
      'Order ស្ថានភាព Pending។\n' +
      'មិនទាន់មានការទូទាត់ប្រាក់ពិតទេ។';

    return {
      text,
      replyMarkup: {
        inline_keyboard: [
          [{
            text: '✅ Confirm Order (Sandbox)',
            callback_data: `confirm_${product.id}`,
          }],
          [{
            text: '⬅️ Back',
            callback_data: `cat_${product.categoryId}`,
          }],
        ],
      },
    };
  }

  private createPendingOrder(
    productId: string,
    user: any
  ): {
    text: string;
    replyMarkup: Keyboard;
  } {
    const product = db.getProduct(productId);
    const settings = db.getSettings();

    if (
      !product ||
      product.status !== 'active' ||
      product.stock < 1 ||
      !Number.isFinite(product.priceUSD) ||
      product.priceUSD <= 0
    ) {
      return {
        text: '⚠️ ផលិតផលមិនមាន ឬអស់ពីស្តុក។',
        replyMarkup: backKeyboard(),
      };
    }

    if (!user?.id) {
      return {
        text: '⚠️ មិនអាចកំណត់អតិថិជនបាន។',
        replyMarkup: backKeyboard(),
      };
    }

    const totalUSD = Math.round(
      product.priceUSD * 100
    ) / 100;

    const totalKHR = Math.round(
      totalUSD *
      (settings.khrExchangeRate || 4100)
    );

    const order = db.createOrder({
      telegramUserId: user.id,
      telegramUsername: user.username || '',
      telegramFirstName: user.first_name || '',
      items: [{
        productId: product.id,
        title: product.title,
        priceUSD: totalUSD,
        quantity: 1,
      }],
      totalAmountUSD: totalUSD,
      totalAmountKHR: totalKHR,
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      paymentMethod: 'aba_khqr',
    });

    const text =
      '✅ <b>Sandbox Order Created</b>\n\n' +
      `🧾 Order: <code>${escapeHtml(order.orderNumber)}</code>\n` +
      `📦 ${escapeHtml(product.title)}\n` +
      `💰 $${totalUSD.toFixed(2)}\n` +
      `🇰🇭 ${totalKHR.toLocaleString()}៛\n\n` +
      '💳 Payment: <b>PENDING</b>\n' +
      '📦 Delivery: <b>PENDING</b>\n\n' +
      '🧪 ABA Sandbox Checkout ' +
      'មិនទាន់បើកនៅជំហាននេះទេ។\n' +
      'មិនទាន់កាត់ប្រាក់ ឬផ្ញើផលិតផលទេ។';

    return {
      text,
      replyMarkup: {
        inline_keyboard: [
          [{
            text: '🛍️ My Orders',
            callback_data: 'action_orders',
          }],
          [{
            text: '⬅️ Main Menu',
            callback_data: 'action_back',
          }],
        ],
      },
    };
  }

  public async handleUpdate(update: any): Promise<{
    handled: boolean;
    replyText?: string;
  }> {
    const settings = db.getSettings();

    if (update.callback_query) {
      const cq = update.callback_query;
      const data = String(cq.data || '');
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      void this.answerCallbackQuery(cq.id);

      if (!chatId || !messageId) {
        return { handled: true };
      }

      let result: {
        text: string;
        replyMarkup: Keyboard;
      };

      if (data.startsWith('cat_')) {
        result = this.buildCategoryResponse(
          data.slice(4)
        );
      } else if (data.startsWith('buy_')) {
        result = this.buildProductDetailResponse(
          data.slice(4)
        );
      } else if (data.startsWith('confirm_')) {
        result = this.createPendingOrder(
          data.slice(8),
          cq.from
        );
      } else if (data === 'action_all') {
        const products = db.getProducts({
          status: 'active',
        });

        const keyboard: Button[][] = [];
        let text = '📦 <b>All Products</b>\n\n';

        if (products.length === 0) {
          text += 'មិនទាន់មានទំនិញទេ។';
        }

        for (const p of products.slice(0, 10)) {
          text +=
            `• ${escapeHtml(p.title)} ` +
            `- $${p.priceUSD.toFixed(2)}\n`;

          keyboard.push([{
            text: `🛒 ${p.title}`,
            callback_data: `buy_${p.id}`,
          }]);
        }

        keyboard.push([{
          text: '⬅️ Back',
          callback_data: 'action_back',
        }]);

        result = {
          text,
          replyMarkup: {
            inline_keyboard: keyboard,
          },
        };
      } else if (data === 'action_orders') {
        const orders = cq.from?.id
          ? db.getOrders(cq.from.id)
          : [];

        let text = '🛍️ <b>My Orders</b>\n\n';

        if (orders.length === 0) {
          text += 'មិនទាន់មាន Order ទេ។';
        }

        for (const order of orders.slice(-5).reverse()) {
          text +=
            `🧾 ${escapeHtml(order.orderNumber)}\n` +
            `💰 $${order.totalAmountUSD.toFixed(2)}\n` +
            `💳 ${escapeHtml(order.paymentStatus)}\n` +
            `📦 ${escapeHtml(order.fulfillmentStatus)}\n\n`;
        }

        result = {
          text,
          replyMarkup: backKeyboard(),
        };
      } else if (data === 'action_search') {
        result = {
          text:
            '🔍 <b>Search Products</b>\n\n' +
            'សូមវាយឈ្មោះផលិតផលដែលបងចង់រក។',
          replyMarkup: backKeyboard(),
        };
      } else if (data === 'action_support') {
        const support = settings.supportTelegramContact;
        const username = support.replace(/^@/, '');

        result = {
          text:
            '💬 <b>Support</b>\n\n' +
            escapeHtml(support),
          replyMarkup: {
            inline_keyboard: [
              [{
                text: '💬 Contact Support',
                url: `https://t.me/${username}`,
              }],
              [{
                text: '⬅️ Back',
                callback_data: 'action_back',
              }],
            ],
          },
        };
      } else if (data === 'action_back') {
        result = {
          text: escapeHtml(settings.welcomeMessageKhmer),
          replyMarkup: this.getMainStoreKeyboard(),
        };
      } else {
        return { handled: true };
      }

      await this.editMessageText(
        chatId,
        messageId,
        result.text,
        result.replyMarkup
      );

      return {
        handled: true,
        replyText: result.text,
      };
    }

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = String(msg.text || '').trim();

      if (!chatId) {
        return { handled: false };
      }

      if (text.startsWith('/start')) {
        const welcome = escapeHtml(
          settings.welcomeMessageKhmer
        );

        await this.sendMessage(
          chatId,
          welcome,
          this.getMainStoreKeyboard()
        );

        return {
          handled: true,
          replyText: welcome,
        };
      }

      if (text.startsWith('/help')) {
        const help =
          '🆘 <b>Help</b>\n\n' +
          '/start - Main Menu\n' +
          '/help - Help\n\n' +
          'ជ្រើសប្រភេទ ឬវាយឈ្មោះផលិតផល។';

        await this.sendMessage(
          chatId,
          help,
          this.getMainStoreKeyboard()
        );

        return {
          handled: true,
          replyText: help,
        };
      }

      if (text && !text.startsWith('/')) {
        const products = db.getProducts({
          search: text,
          status: 'active',
        });

        let reply =
          `🔍 <b>Search: ${escapeHtml(text)}</b>\n\n`;

        const keyboard: Button[][] = [];

        if (products.length === 0) {
          reply += 'រកមិនឃើញផលិតផលទេ។';
        }

        for (const p of products.slice(0, 8)) {
          reply +=
            `• ${escapeHtml(p.title)} ` +
            `$${p.priceUSD.toFixed(2)}\n`;

          keyboard.push([{
            text: `🛒 ${p.title}`,
            callback_data: `buy_${p.id}`,
          }]);
        }

        keyboard.push([{
          text: '⬅️ Back',
          callback_data: 'action_back',
        }]);

        await this.sendMessage(chatId, reply, {
          inline_keyboard: keyboard,
        });

        return {
          handled: true,
          replyText: reply,
        };
      }
    }

    return { handled: false };
  }
}

export const telegramService = new TelegramService();
