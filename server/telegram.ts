import { db } from './db.js';
import { TelegramBotInfo, TelegramWebhookInfo } from './types.js';

interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export class TelegramService {
  private get token(): string {
    return process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  }

  private get baseUrl(): string {
    return `https://api.telegram.org/bot${this.token}`;
  }

  public isTokenConfigured(): boolean {
    return Boolean(this.token && this.token.length > 10 && this.token.includes(':'));
  }

  // Real getMe API call
  public async getMe(): Promise<{ ok: boolean; result?: TelegramBotInfo; description?: string; error_code?: number }> {
    if (!this.isTokenConfigured()) {
      return {
        ok: false,
        description: 'TELEGRAM_BOT_TOKEN is not configured in the server environment variables.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data = await response.json() as { ok: boolean; result?: TelegramBotInfo; description?: string; error_code?: number };
      return data;
    } catch (err) {
      return {
        ok: false,
        description: err instanceof Error ? err.message : 'Network error connecting to Telegram Bot API',
      };
    }
  }

  // Real setWebhook API call
  public async setWebhook(webhookUrl: string, secretToken?: string): Promise<{ ok: boolean; description?: string; result?: boolean }> {
    if (!this.isTokenConfigured()) {
      return {
        ok: false,
        description: 'TELEGRAM_BOT_TOKEN is not configured.',
      };
    }

    try {
      const payload: Record<string, any> = {
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      };

      if (secretToken) {
        payload.secret_token = secretToken;
      }

      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return await response.json() as { ok: boolean; description?: string; result?: boolean };
    } catch (err) {
      return {
        ok: false,
        description: err instanceof Error ? err.message : 'Failed to call setWebhook',
      };
    }
  }

  // Real getWebhookInfo API call
  public async getWebhookInfo(): Promise<{ ok: boolean; result?: TelegramWebhookInfo; description?: string }> {
    if (!this.isTokenConfigured()) {
      return {
        ok: false,
        description: 'TELEGRAM_BOT_TOKEN is not configured.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/getWebhookInfo`);
      return await response.json() as { ok: boolean; result?: TelegramWebhookInfo; description?: string };
    } catch (err) {
      return {
        ok: false,
        description: err instanceof Error ? err.message : 'Failed to call getWebhookInfo',
      };
    }
  }

  // Real deleteWebhook API call
  public async deleteWebhook(): Promise<{ ok: boolean; description?: string }> {
    if (!this.isTokenConfigured()) {
      return {
        ok: false,
        description: 'TELEGRAM_BOT_TOKEN is not configured.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
        method: 'POST',
      });
      return await response.json() as { ok: boolean; description?: string };
    } catch (err) {
      return {
        ok: false,
        description: err instanceof Error ? err.message : 'Failed to call deleteWebhook',
      };
    }
  }

  // Send Message
  public async sendMessage(chatId: number | string, text: string, replyMarkup?: TelegramInlineKeyboardMarkup): Promise<any> {
    if (!this.isTokenConfigured()) {
      console.warn('Cannot send Telegram message: bot token not configured.');
      return { ok: false, description: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('Error sending Telegram message:', err);
      return { ok: false, error: err };
    }
  }

  // Edit Message Text
  public async editMessageText(chatId: number | string, messageId: number, text: string, replyMarkup?: TelegramInlineKeyboardMarkup): Promise<any> {
    if (!this.isTokenConfigured()) {
      return { ok: false, description: 'Bot token not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });
      return await response.json();
    } catch (err) {
      console.error('Error editing Telegram message text:', err);
      return { ok: false, error: err };
    }
  }

  // Answer Callback Query
  public async answerCallbackQuery(callbackQueryId: string, text?: string, showAlert: boolean = false): Promise<any> {
    if (!this.isTokenConfigured()) return;

    try {
      await fetch(`${this.baseUrl}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        }),
      });
    } catch (err) {
      console.error('Error answering callback query:', err);
    }
  }

  /**
   * Generates the Telegram inline keyboard with the exact 3-column rows
   * Row 1: ChatGPT | Gemini | Grok
   * Row 2: Codex API | Claude | Kimi
   * Row 3: Video AI | ElevenLabs | AI Tools
   * Row 4: Qwen API | DeepSeek API | Cursor API
   * Row 5: Adobe | Autodesk | Design
   * Row 6: Office | Education | Streaming
   * Row 7: Music | VPN | Security
   * Row 8: Games | Social | Discord
   * Additional buttons:
   * - Search Products
   * - All Products
   * - My Orders
   * - Support
   * - Back
   */
  public getMainStoreKeyboard(): TelegramInlineKeyboardMarkup {
    const keyboard: TelegramInlineKeyboardButton[][] = [
      // Row 1
      [
        { text: 'ChatGPT', callback_data: 'cat_chatgpt' },
        { text: 'Gemini', callback_data: 'cat_gemini' },
        { text: 'Grok', callback_data: 'cat_grok' },
      ],
      // Row 2
      [
        { text: 'Codex API', callback_data: 'cat_codex_api' },
        { text: 'Claude', callback_data: 'cat_claude' },
        { text: 'Kimi', callback_data: 'cat_kimi' },
      ],
      // Row 3
      [
        { text: 'Video AI', callback_data: 'cat_video_ai' },
        { text: 'ElevenLabs', callback_data: 'cat_elevenlabs' },
        { text: 'AI Tools', callback_data: 'cat_ai_tools' },
      ],
      // Row 4
      [
        { text: 'Qwen API', callback_data: 'cat_qwen_api' },
        { text: 'DeepSeek API', callback_data: 'cat_deepseek_api' },
        { text: 'Cursor API', callback_data: 'cat_cursor_api' },
      ],
      // Row 5
      [
        { text: 'Adobe', callback_data: 'cat_adobe' },
        { text: 'Autodesk', callback_data: 'cat_autodesk' },
        { text: 'Design', callback_data: 'cat_design' },
      ],
      // Row 6
      [
        { text: 'Office', callback_data: 'cat_office' },
        { text: 'Education', callback_data: 'cat_education' },
        { text: 'Streaming', callback_data: 'cat_streaming' },
      ],
      // Row 7
      [
        { text: 'Music', callback_data: 'cat_music' },
        { text: 'VPN', callback_data: 'cat_vpn' },
        { text: 'Security', callback_data: 'cat_security' },
      ],
      // Row 8
      [
        { text: 'Games', callback_data: 'cat_games' },
        { text: 'Social', callback_data: 'cat_social' },
        { text: 'Discord', callback_data: 'cat_discord' },
      ],
      // Additional buttons
      [
        { text: '🔍 Search Products', callback_data: 'action_search' },
        { text: '📦 All Products', callback_data: 'action_all' },
      ],
      [
        { text: '🛍️ My Orders', callback_data: 'action_orders' },
        { text: '💬 Support', callback_data: 'action_support' },
      ],
      [
        { text: '⬅️ Back', callback_data: 'action_back' },
      ],
    ];

    return { inline_keyboard: keyboard };
  }

  /**
   * Builds category view response with products from DB.
   * If there are no products, shows Khmer message saying category is currently empty.
   */
  public buildCategoryResponse(categoryId: string): { text: string; replyMarkup: TelegramInlineKeyboardMarkup } {
    const category = db.getCategory(categoryId);
    const settings = db.getSettings();
    const catName = category ? category.name : categoryId;

    const products = db.getProducts({ categoryId, status: 'active' });

    if (!products || products.length === 0) {
      const text = `📁 <b>ប្រភេទ៖ ${catName}</b>\n\n` +
        `⚠️ <i>សូមអភ័យទោស ប្រភេទនេះមិនទាន់មានទំនិញនៅឡើយទេ។ សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ!</i>\n\n` +
        `👉 សូមចុច <b>"Back"</b> ដើម្បីត្រឡប់ទៅបញ្ជីប្រភេទដើមវិញ។`;

      const replyMarkup: TelegramInlineKeyboardMarkup = {
        inline_keyboard: [
          [{ text: '⬅️ Back', callback_data: 'action_back' }],
        ],
      };

      return { text, replyMarkup };
    }

    // Has products
    let text = `📁 <b>ប្រភេទ៖ ${catName}</b>\n` +
      `ខាងក្រោមនេះជាមុខទំនិញដែលមានក្នុងស្តុក៖\n\n`;

    const keyboard: TelegramInlineKeyboardButton[][] = [];

    products.forEach((prod, index) => {
      const khrPrice = (prod.priceUSD * (settings.khrExchangeRate || 4100)).toLocaleString();
      text += `<b>${index + 1}. ${prod.title}</b>\n`;
      text += `💰 តម្លៃ: <b>$${prod.priceUSD.toFixed(2)}</b> (~${khrPrice} ៛)\n`;
      if (prod.description) {
        text += `📝 ${prod.description}\n`;
      }
      text += `📦 ស្តុក: ${prod.stock > 0 ? `${prod.stock} items` : 'អស់ពីស្តុក'}\n\n`;

      keyboard.push([
        { text: `🛒 បញ្ជាទិញ ${prod.title} ($${prod.priceUSD.toFixed(2)})`, callback_data: `buy_${prod.id}` },
      ]);
    });

    keyboard.push([{ text: '⬅️ Back', callback_data: 'action_back' }]);

    return { text, replyMarkup: { inline_keyboard: keyboard } };
  }

  /**
   * Builds product detail & purchase view
   */
  public buildProductDetailResponse(productId: string): { text: string; replyMarkup: TelegramInlineKeyboardMarkup } {
    const product = db.getProduct(productId);
    const settings = db.getSettings();

    if (!product) {
      return {
        text: `⚠️ <i>រកមិនឃើញទំនិញនេះទេ ឬត្រូវបានលុបចេញហើយ។</i>`,
        replyMarkup: {
          inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'action_back' }]],
        },
      };
    }

    const khrPrice = (product.priceUSD * (settings.khrExchangeRate || 4100)).toLocaleString();
    const supportUser = settings.supportTelegramContact.replace('@', '');

    const text = `🛍️ <b>បញ្ជាក់ការបញ្ជាទិញ / Order Details</b>\n\n` +
      `📌 <b>ផលិតផល:</b> ${product.title}\n` +
      `💰 <b>តម្លៃ:</b> $${product.priceUSD.toFixed(2)} (${khrPrice} ៛)\n` +
      `⚡ <b>ការដឹកជញ្ជូន:</b> ${product.deliveryType}\n` +
      `📝 <b>ព័ត៌មានលម្អិត:</b> ${product.description || 'គណនីឌីជីថលសុវត្ថិភាព 100%'}\n\n` +
      `💳 <b>ជម្រើសទូទាត់ប្រាក់ (Payment Options):</b>\n` +
      `1. <b>ABA PayWay KHQR:</b> (ស្កេនទូទាត់ប្រាក់ភ្លាមៗ - ដំណាក់កាលបន្ទាប់)\n` +
      `2. <b>ទាក់ទង Admin ដោយផ្ទាល់:</b> ដើម្បីទទួលបានការផ្ទៀងផ្ទាត់ និងទទួលយកគណនីភ្លាមៗ\n\n` +
      `សូមចុចប៊ូតុងខាងក្រោមដើម្បីទាក់ទងមកកាន់ Support / Admin ៖`;

    const keyboard: TelegramInlineKeyboardButton[][] = [
      [
        { text: `💬 ទាក់ទង Admin ទិញ (${settings.supportTelegramContact})`, url: `https://t.me/${supportUser}` },
      ],
      [
        { text: '📁 មើលទំនិញផ្សេងទៀត', callback_data: `cat_${product.categoryId}` },
        { text: '⬅️ Back', callback_data: 'action_back' },
      ],
    ];

    return { text, replyMarkup: { inline_keyboard: keyboard } };
  }

  /**
   * Handles incoming update from Telegram Webhook or Simulator
   */
  public async handleUpdate(update: any): Promise<{ handled: boolean; replyText?: string }> {
    const settings = db.getSettings();

    // 1. Handle callback_query (Inline keyboard button clicks)
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || '';
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      // Always answer callback query to remove Telegram loading spinner
      await this.answerCallbackQuery(cq.id);

      if (!chatId || !messageId) {
        return { handled: true };
      }

      // Category selected
      if (data.startsWith('cat_')) {
        const categoryId = data.replace('cat_', '');
        const { text, replyMarkup } = this.buildCategoryResponse(categoryId);
        await this.editMessageText(chatId, messageId, text, replyMarkup);
        return { handled: true, replyText: text };
      }

      // Buy / View Product
      if (data.startsWith('buy_')) {
        const productId = data.replace('buy_', '');
        const { text, replyMarkup } = this.buildProductDetailResponse(productId);
        await this.editMessageText(chatId, messageId, text, replyMarkup);
        return { handled: true, replyText: text };
      }

      // Action: All Products
      if (data === 'action_all') {
        const products = db.getProducts({ status: 'active' });
        if (products.length === 0) {
          const text = `📦 <b>ទំនិញទាំងអស់ (All Products)</b>\n\n` +
            `⚠️ <i>បច្ចុប្បន្នមិនទាន់មានទំនិញដាក់លក់នៅឡើយទេ។ សូមរង់ចាំការដាក់លក់ក្នុងពេលឆាប់ៗ!</i>`;
          await this.editMessageText(chatId, messageId, text, {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'action_back' }]],
          });
          return { handled: true, replyText: text };
        }

        let text = `📦 <b>ទំនិញទាំងអស់ដែលមានក្នុងស្តុក៖</b>\n\n`;
        const keyboard: TelegramInlineKeyboardButton[][] = [];
        products.slice(0, 10).forEach(p => {
          text += `• <b>${p.title}</b> - $${p.priceUSD.toFixed(2)}\n`;
          keyboard.push([{ text: `🛒 ${p.title} ($${p.priceUSD.toFixed(2)})`, callback_data: `buy_${p.id}` }]);
        });
        keyboard.push([{ text: '⬅️ Back', callback_data: 'action_back' }]);
        await this.editMessageText(chatId, messageId, text, { inline_keyboard: keyboard });
        return { handled: true, replyText: text };
      }

      // Action: Search
      if (data === 'action_search') {
        const text = `🔍 <b>ស្វែងរកផលិតផល (Search Products)</b>\n\n` +
          `សូមផ្ញើសារវាយបញ្ចូលឈ្មោះផលិតផល ឬពាក្យគន្លឹះដែលអ្នកចង់ស្វែងរក (ឧទាហរណ៍៖ ChatGPT, Adobe, VPN...) មកកាន់ Chat នេះ។`;
        await this.editMessageText(chatId, messageId, text, {
          inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'action_back' }]],
        });
        return { handled: true, replyText: text };
      }

      // Action: My Orders
      if (data === 'action_orders') {
        const userId = cq.from?.id;
        const orders = userId ? db.getOrders(userId) : [];

        if (orders.length === 0) {
          const text = `🛍️ <b>ប្រវត្តិការបញ្ជាទិញ (My Orders)</b>\n\n` +
            `លោកអ្នកមិនទាន់មានប្រវត្តិបញ្ជាទិញនៅឡើយទេ។\n` +
            `សូមជ្រើសរើសទំនិញដើម្បីធ្វើការបញ្ជាទិញ! ✨`;
          await this.editMessageText(chatId, messageId, text, {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'action_back' }]],
          });
          return { handled: true, replyText: text };
        }

        let text = `🛍️ <b>ប្រវត្តិការបញ្ជាទិញរបស់អ្នក៖</b>\n\n`;
        orders.slice(0, 5).forEach((order, idx) => {
          text += `${idx + 1}. <b>កូដ៖</b> <code>${order.orderNumber}</code>\n`;
          text += `   សរុប: $${order.totalAmountUSD.toFixed(2)}\n`;
          text += `   ស្ថានភាព: <b>${order.paymentStatus}</b> | ${order.fulfillmentStatus}\n\n`;
        });

        await this.editMessageText(chatId, messageId, text, {
          inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'action_back' }]],
        });
        return { handled: true, replyText: text };
      }

      // Action: Support
      if (data === 'action_support') {
        const supportUser = settings.supportTelegramContact.replace('@', '');
        const text = `💬 <b>ផ្នែកបម្រើអតិថិជន (Support & Help)</b>\n\n` +
          `🇰🇭 <b>Khmer Tech Digital Store</b>\n` +
          `📩 Telegram Support: <b>${settings.supportTelegramContact}</b>\n` +
          `📞 ទូរស័ព្ទ: ${settings.supportPhone || '+855 12 345 678'}\n` +
          `⏰ ម៉ោងបម្រើការ: 8:00 AM - 10:00 PM (រៀងរាល់ថ្ងៃ)\n\n` +
          `យើងខ្ញុំរីករាយស្វាគមន៍ និងឆ្លើយតបរាល់ចម្ងល់ ឬសំណើជំនួយបច្ចេកទេសរបស់លោកអ្នក!`;

        const keyboard: TelegramInlineKeyboardButton[][] = [
          [{ text: `💬 ផ្ញើសារទៅកាន់ Support`, url: `https://t.me/${supportUser}` }],
          [{ text: '⬅️ Back', callback_data: 'action_back' }],
        ];
        await this.editMessageText(chatId, messageId, text, { inline_keyboard: keyboard });
        return { handled: true, replyText: text };
      }

      // Action: Back
      if (data === 'action_back') {
        const text = settings.welcomeMessageKhmer;
        const keyboard = this.getMainStoreKeyboard();
        await this.editMessageText(chatId, messageId, text, keyboard);
        return { handled: true, replyText: text };
      }

      return { handled: true };
    }

    // 2. Handle Message
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = msg.text?.trim() || '';

      if (!chatId) return { handled: false };

      // /start command
      if (text.startsWith('/start')) {
        const welcomeText = settings.welcomeMessageKhmer;
        const keyboard = this.getMainStoreKeyboard();
        await this.sendMessage(chatId, welcomeText, keyboard);
        return { handled: true, replyText: welcomeText };
      }

      // /help or help
      if (text.startsWith('/help')) {
        const helpText = `🆘 <b>ជំនួយការប្រើប្រាស់ Bot</b>\n\n` +
          `• ផ្ញើ <code>/start</code> ដើម្បីបើកម៉ឺនុយហាង\n` +
          `• ចុចលើប្រភេទផលិតផលនីមួយៗដើម្បីពិនិត្យមើលតម្លៃ និងស្តុក\n` +
          `• វាយឈ្មោះផលិតផលដើម្បីស្វែងរកភ្លាមៗ\n` +
          `• ជំនួយបច្ចេកទេស៖ ${settings.supportTelegramContact}`;
        await this.sendMessage(chatId, helpText, this.getMainStoreKeyboard());
        return { handled: true, replyText: helpText };
      }

      // Search if user sends normal text
      if (text && !text.startsWith('/')) {
        const matches = db.getProducts({ search: text, status: 'active' });
        if (matches.length === 0) {
          const noMatchText = `🔍 រកមិនឃើញទំនិញដែលត្រូវនឹងពាក្យ "<b>${text}</b>" ទេ។\n\n` +
            `សូមសាកល្បងស្វែងរកដោយប្រើពាក្យផ្សេង ឬជ្រើសរើសតាមប្រភេទខាងក្រោម៖`;
          await this.sendMessage(chatId, noMatchText, this.getMainStoreKeyboard());
          return { handled: true, replyText: noMatchText };
        }

        let matchText = `🔍 <b>លទ្ធផលស្វែងរកសម្រាប់ "${text}" (${matches.length} មុខ):</b>\n\n`;
        const keyboard: TelegramInlineKeyboardButton[][] = [];
        matches.slice(0, 8).forEach(p => {
          matchText += `• <b>${p.title}</b>: $${p.priceUSD.toFixed(2)}\n`;
          keyboard.push([{ text: `🛒 ${p.title} ($${p.priceUSD.toFixed(2)})`, callback_data: `buy_${p.id}` }]);
        });
        keyboard.push([{ text: '⬅️ Back', callback_data: 'action_back' }]);
        await this.sendMessage(chatId, matchText, { inline_keyboard: keyboard });
        return { handled: true, replyText: matchText };
      }
    }

    return { handled: false };
  }
}

export const telegramService = new TelegramService();
