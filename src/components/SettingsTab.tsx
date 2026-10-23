import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  ShoppingBag,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../types';

interface SettingsTabProps {
  settings: StoreSettings | null;
  envStatus: {
    telegramBotTokenConfigured: boolean;
    telegramWebhookSecretConfigured: boolean;
    appUrl: string;
    digisellerApiKeyConfigured: boolean;
    abaApiKeyConfigured: boolean;
  } | null;
  onUpdateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  envStatus,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(() => settings || {
    storeName: 'Khmer Tech Digital Store',
    storeNameKhmer: 'ហាងលក់ផលិតផលឌីជីថល ខ្មែរតិច',
    welcomeMessageKhmer: '',
    supportTelegramContact: '@KhmerTechSupport',
    supportPhone: '+855 12 345 678',
    khrExchangeRate: 4100,
    digiseller: {
      enabled: false,
      sellerId: '',
      apiKeyConfigured: false,
      autoSync: false,
    },
    abaPayway: {
      enabled: false,
      merchantId: '',
      environment: 'sandbox',
      khqrEnabled: true,
      apiKeyConfigured: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Store Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <div className="p-2 bg-cyan-950/70 border border-cyan-700/50 rounded-lg text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">General Store &amp; Khmer Localization</h3>
              <p className="text-xs text-slate-400">Store branding, exchange rates, and Telegram greeting copy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Store Name (English)</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Store Name (Khmer)</label>
              <input
                type="text"
                value={formData.storeNameKhmer}
                onChange={e => setFormData({ ...formData, storeNameKhmer: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Support Telegram Handle</label>
              <input
                type="text"
                value={formData.supportTelegramContact}
                onChange={e => setFormData({ ...formData, supportTelegramContact: e.target.value })}
                placeholder="@KhmerTechSupport"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">USD to KHR Exchange Rate (៛)</label>
              <input
                type="number"
                value={formData.khrExchangeRate}
                onChange={e => setFormData({ ...formData, khrExchangeRate: parseInt(e.target.value, 10) || 4100 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Welcome Message in Khmer */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-medium flex items-center justify-between">
              <span>Welcome Message in Khmer (Sent upon <code>/start</code>)</span>
              <span className="text-[10px] text-cyan-400 font-mono">HTML formatting supported</span>
            </label>
            <textarea
              rows={4}
              value={formData.welcomeMessageKhmer}
              onChange={e => setFormData({ ...formData, welcomeMessageKhmer: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* DigiSeller Integration Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-950/70 border border-indigo-700/50 rounded-lg text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">DigiSeller Integration Settings</h3>
                <p className="text-xs text-slate-400">
                  Digital goods supplier catalog API &amp; automated fulfillment (Future Phase)
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-mono">
              Phase 2 Ready
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-white font-medium">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Automated Supplier Purchasing Protocol:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Per requirements, automated supplier purchasing will only be enabled after DigiSeller confirms that an authorized purchase API is available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">DigiSeller Seller ID (id_seller)</label>
              <input
                type="text"
                value={formData.digiseller.sellerId}
                onChange={e =>
                  setFormData({
                    ...formData,
                    digiseller: { ...formData.digiseller, sellerId: e.target.value },
                  })
                }
                placeholder="e.g. 1092837"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">API Key Status in Server Environment</label>
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                {envStatus?.digisellerApiKeyConfigured ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DIGISELLER_API_KEY Configured in .env</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Optional: Set DIGISELLER_API_KEY in .env</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="digiseller-sync"
              checked={formData.digiseller.autoSync}
              onChange={e =>
                setFormData({
                  ...formData,
                  digiseller: { ...formData.digiseller, autoSync: e.target.checked },
                })
              }
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="digiseller-sync" className="text-slate-300 font-medium">
              Enable Auto-Sync Product Pricing from DigiSeller
            </label>
          </div>
        </div>

        {/* ABA PayWay Integration Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-950/70 border border-purple-700/50 rounded-lg text-purple-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">ABA PayWay KHQR Integration Settings</h3>
                <p className="text-xs text-slate-400">
                  Cambodian KHQR payments with server-side transaction verification (Future Phase)
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700/60 font-mono">
              Phase 3 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">ABA Merchant ID</label>
              <input
                type="text"
                value={formData.abaPayway.merchantId}
                onChange={e =>
                  setFormData({
                    ...formData,
                    abaPayway: { ...formData.abaPayway, merchantId: e.target.value },
                  })
                }
                placeholder="e.g. ec123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Environment</label>
              <select
                value={formData.abaPayway.environment}
                onChange={e =>
                  setFormData({
                    ...formData,
                    abaPayway: {
                      ...formData.abaPayway,
                      environment: e.target.value as 'sandbox' | 'production',
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="sandbox">Sandbox (Testing / UAT)</option>
                <option value="production">Production (Live ABA PayWay)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">API Key Status in .env</label>
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
                {envStatus?.abaApiKeyConfigured ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ABA_PAYWAY_API_KEY Configured</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Optional: ABA_PAYWAY_API_KEY in .env</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1 text-xs">
            <input
              type="checkbox"
              id="aba-khqr"
              checked={formData.abaPayway.khqrEnabled}
              onChange={e =>
                setFormData({
                  ...formData,
                  abaPayway: { ...formData.abaPayway, khqrEnabled: e.target.checked },
                })
              }
              className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-0"
            />
            <label htmlFor="aba-khqr" className="text-slate-300 font-medium">
              Generate Standard Bakong KHQR DeepLinks for Instant ABA Mobile Checkout
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Store settings updated successfully!</span>
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
