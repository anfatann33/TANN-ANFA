import fs from 'fs';
import path from 'path';
import { Category, Product, Order, StoreSettings } from './types.js';

interface DatabaseData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Exact 24 categories in 8 rows × 3 columns
const INITIAL_CATEGORIES: Category[] = [
  // Row 1
  { id: 'chatgpt', name: 'ChatGPT', nameKhmer: 'ChatGPT', row: 1, col: 1, isActive: true, sortOrder: 1 },
  { id: 'gemini', name: 'Gemini', nameKhmer: 'Gemini', row: 1, col: 2, isActive: true, sortOrder: 2 },
  { id: 'grok', name: 'Grok', nameKhmer: 'Grok', row: 1, col: 3, isActive: true, sortOrder: 3 },

  // Row 2
  { id: 'codex_api', name: 'Codex API', nameKhmer: 'Codex API', row: 2, col: 1, isActive: true, sortOrder: 4 },
  { id: 'claude', name: 'Claude', nameKhmer: 'Claude', row: 2, col: 2, isActive: true, sortOrder: 5 },
  { id: 'kimi', name: 'Kimi', nameKhmer: 'Kimi', row: 2, col: 3, isActive: true, sortOrder: 6 },

  // Row 3
  { id: 'video_ai', name: 'Video AI', nameKhmer: 'Video AI', row: 3, col: 1, isActive: true, sortOrder: 7 },
  { id: 'elevenlabs', name: 'ElevenLabs', nameKhmer: 'ElevenLabs', row: 3, col: 2, isActive: true, sortOrder: 8 },
  { id: 'ai_tools', name: 'AI Tools', nameKhmer: 'AI Tools', row: 3, col: 3, isActive: true, sortOrder: 9 },

  // Row 4
  { id: 'qwen_api', name: 'Qwen API', nameKhmer: 'Qwen API', row: 4, col: 1, isActive: true, sortOrder: 10 },
  { id: 'deepseek_api', name: 'DeepSeek API', nameKhmer: 'DeepSeek API', row: 4, col: 2, isActive: true, sortOrder: 11 },
  { id: 'cursor_api', name: 'Cursor API', nameKhmer: 'Cursor API', row: 4, col: 3, isActive: true, sortOrder: 12 },

  // Row 5
  { id: 'adobe', name: 'Adobe', nameKhmer: 'Adobe', row: 5, col: 1, isActive: true, sortOrder: 13 },
  { id: 'autodesk', name: 'Autodesk', nameKhmer: 'Autodesk', row: 5, col: 2, isActive: true, sortOrder: 14 },
  { id: 'design', name: 'Design', nameKhmer: 'Design', row: 5, col: 3, isActive: true, sortOrder: 15 },

  // Row 6
  { id: 'office', name: 'Office', nameKhmer: 'Office', row: 6, col: 1, isActive: true, sortOrder: 16 },
  { id: 'education', name: 'Education', nameKhmer: 'Education', row: 6, col: 2, isActive: true, sortOrder: 17 },
  { id: 'streaming', name: 'Streaming', nameKhmer: 'Streaming', row: 6, col: 3, isActive: true, sortOrder: 18 },

  // Row 7
  { id: 'music', name: 'Music', nameKhmer: 'Music', row: 7, col: 1, isActive: true, sortOrder: 19 },
  { id: 'vpn', name: 'VPN', nameKhmer: 'VPN', row: 7, col: 2, isActive: true, sortOrder: 20 },
  { id: 'security', name: 'Security', nameKhmer: 'Security', row: 7, col: 3, isActive: true, sortOrder: 21 },

  // Row 8
  { id: 'games', name: 'Games', nameKhmer: 'Games', row: 8, col: 1, isActive: true, sortOrder: 22 },
  { id: 'social', name: 'Social', nameKhmer: 'Social', row: 8, col: 2, isActive: true, sortOrder: 23 },
  { id: 'discord', name: 'Discord', nameKhmer: 'Discord', row: 8, col: 3, isActive: true, sortOrder: 24 },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Khmer Tech Digital Store',
  storeNameKhmer: 'ហាងលក់ផលិតផលឌីជីថល ខ្មែរតិច',
  welcomeMessageKhmer: `សូមស្វាគមន៍មកកាន់ Khmer Tech Digital Store! 🇰🇭✨

យើងខ្ញុំជាប្រភពផ្គត់ផ្គង់គណនី និងសេវាកម្មឌីជីថល AI, APIs, Software, និង Entertainment ដែលមានគុណភាពខ្ពស់ តម្លៃសមរម្យ និងទំនុកចិត្តខ្ពស់។

សូមជ្រើសរើសប្រភេទផលិតផលខាងក្រោមដើម្បីពិនិត្យមើលមុខទំនិញ៖`,
  supportTelegramContact: '@KhmerTechSupport',
  supportPhone: '+855 12 345 678',
  khrExchangeRate: 4100,
  digiseller: {
    enabled: false,
    sellerId: process.env.DIGISELLER_SELLER_ID || '',
    apiKeyConfigured: Boolean(process.env.DIGISELLER_API_KEY),
    autoSync: false,
  },
  abaPayway: {
    enabled: false,
    merchantId: process.env.ABA_PAYWAY_MERCHANT_ID || '',
    environment: (process.env.ABA_PAYWAY_ENV as 'sandbox' | 'production') || 'sandbox',
    khqrEnabled: true,
    apiKeyConfigured: Boolean(process.env.ABA_PAYWAY_API_KEY),
  },
};

class Database {
  private data: DatabaseData;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadData();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Ensure all 24 categories exist
        const existingCatIds = new Set(parsed.categories?.map((c: Category) => c.id) || []);
        const mergedCategories = [...(parsed.categories || [])];
        for (const initialCat of INITIAL_CATEGORIES) {
          if (!existingCatIds.has(initialCat.id)) {
            mergedCategories.push(initialCat);
          }
        }

        return {
          categories: mergedCategories,
          products: parsed.products || [],
          orders: parsed.orders || [],
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
        };
      } catch (err) {
        console.error('Error reading store.json, re-initializing database:', err);
      }
    }

    const defaultData: DatabaseData = {
      categories: INITIAL_CATEGORIES,
      products: [], // starts clean per requirement #8
      orders: [],
      settings: INITIAL_SETTINGS,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseData) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data to store.json:', err);
    }
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getCategory(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.data.categories[index] = { ...this.data.categories[index], ...updates };
    this.saveData(this.data);
    return this.data.categories[index];
  }

  // Products
  public getProducts(filter?: { categoryId?: string; status?: string; search?: string }): Product[] {
    return this.data.products.filter(p => {
      if (filter?.categoryId && p.categoryId !== filter.categoryId) return false;
      if (filter?.status && p.status !== filter.status) return false;
      if (filter?.search) {
        const query = filter.search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(query) || (p.titleKhmer && p.titleKhmer.toLowerCase().includes(query));
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }

  public getProduct(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date().toISOString();
    const product: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.products.push(product);
    this.saveData(this.data);
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Orders
  public getOrders(telegramUserId?: number | string): Order[] {
    if (telegramUserId) {
      return this.data.orders.filter(o => String(o.telegramUserId) === String(telegramUserId));
    }
    return [...this.data.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrder(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const now = new Date().toISOString();
    const orderNumber = `KT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const order: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };
    this.data.orders.push(order);
    this.saveData(this.data);
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const index = this.data.orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    this.data.orders[index] = {
      ...this.data.orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.orders[index];
  }

  // Settings
  public getSettings(): StoreSettings {
    return { ...this.data.settings };
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      digiseller: {
        ...this.data.settings.digiseller,
        ...(updates.digiseller || {}),
      },
      abaPayway: {
        ...this.data.settings.abaPayway,
        ...(updates.abaPayway || {}),
      },
    };
    this.saveData(this.data);
    return this.data.settings;
  }
}

export const db = new Database();
