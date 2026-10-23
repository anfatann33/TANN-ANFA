export interface Category {
  id: string;
  name: string;
  nameKhmer: string;
  icon?: string;
  row: number;
  col: number;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  activeProductCount?: number;
}

export interface Product {
  id: string;
  title: string;
  titleKhmer?: string;
  description: string;
  descriptionKhmer?: string;
  categoryId: string;
  priceUSD: number;
  priceKHR?: number;
  stock: number;
  sku: string;
  deliveryType: 'instant_license_key' | 'account_credentials' | 'manual_fulfillment' | 'digiseller_auto';
  deliveryContent?: string;
  status: 'active' | 'out_of_stock' | 'draft';
  digisellerProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  priceUSD: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  telegramUserId: number | string;
  telegramUsername?: string;
  telegramFirstName?: string;
  items: OrderItem[];
  totalAmountUSD: number;
  totalAmountKHR: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'delivered' | 'cancelled';
  paymentMethod: 'aba_khqr' | 'manual_transfer' | 'digiseller';
  paymentReference?: string;
  deliveredContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameKhmer: string;
  welcomeMessageKhmer: string;
  supportTelegramContact: string;
  supportPhone?: string;
  khrExchangeRate: number;
  digiseller: {
    enabled: boolean;
    sellerId: string;
    apiKeyConfigured: boolean;
    autoSync: boolean;
  };
  abaPayway: {
    enabled: boolean;
    merchantId: string;
    environment: 'sandbox' | 'production';
    khqrEnabled: boolean;
    apiKeyConfigured: boolean;
  };
}

export interface BotStatusResponse {
  configured: boolean;
  connected: boolean;
  message?: string;
  error?: string | null;
  errorCode?: number | null;
  bot?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
  } | null;
}

export interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
}
