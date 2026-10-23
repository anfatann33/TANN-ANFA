import React, { useState } from 'react';
import {
  Bot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Link,
  RefreshCw,
  Zap,
  Server,
  Layers,
  ShoppingBag,
  CreditCard,
  Send,
  ExternalLink,
  Copy,
  Check,
  PackagePlus,
  Radio
} from 'lucide-react';
import { BotStatusResponse, WebhookInfo, StoreSettings } from '../types';

interface OverviewTabProps {
  botStatus: BotStatusResponse | null;
  webhookInfo: WebhookInfo | null;
  settings: StoreSettings | null;
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  onRefreshWebhook: () => void;
  onSetWebhook: (url?: string) => Promise<void>;
  onDeleteWebhook: () => Promise<void>;
  onTestConnection: () => void;
  onSeedProducts: () => Promise<void>;
  onNavigateToTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  botStatus,
  webhookInfo,
  settings,
  totalProducts,
  totalCategories,
  totalOrders,
  onRefreshWebhook,
  onSetWebhook,
  onDeleteWebhook,
  onTestConnection,
  onSeedProducts,
  onNavigateToTab,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSetWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingWebhook(true);
    try {
      await onSetWebhook(customWebhookUrl || undefined);
      setCustomWebhookUrl('');
    } finally {
      setSettingWebhook(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Populate starter digital products (ChatGPT Plus, Gemini, Claude, DeepSeek API, Adobe, etc.) for testing?')) return;
    setSeedingLoading(true);
    try {
      await onSeedProducts();
    } finally {
      setSeedingLoading(false);
    }
  };

  const isConnected = Boolean(botStatus?.connected && botStatus?.bot);
  const isConfigured = Boolean(botStatus?.configured);

  return (
    <div className="space-y-6">
      {/* Bot Status Banner & Alerts */}
      {!isConfigured ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white">Telegram Bot Token Not Configured</h4>
              <p className="text-xs text-amber-300/90 mt-0.5">
                To connect the bot, add <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">TELEGRAM_BOT_TOKEN="your_token"</code> into your server environment variables or <code className="bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200">.env</code>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('deploy')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-medium text-xs rounded-lg transition shrink-0"
          >
            View Setup Guide
          </button>
        </div>
      ) : !isConnected ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white">Telegram Connection Failed</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Telegram API returned: {botStatus?.error || 'Invalid Bot Token. Check that the token from BotFather is correct.'}
              </p>
            </div>
          </div>
          <button
            onClick={onTestConnection}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition shrink-0"
          >
            Retry getMe API Test
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white">
                  Telegram Bot Connected: @{botStatus?.bot?.username}
                </h4>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  Real API Verified
                </span>
              </div>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                ID: <span className="font-mono">{botStatus?.bot?.id}</span> • Display: {botStatus?.bot?.first_name} • Webhook ready to receive /start commands.
              </p>
            </div>
          </div>
          <a
            href={`https://t.me/${botStatus?.bot?.username}?start=admin_test`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition shrink-0 shadow-sm"
          >
            <span>Open @{botStatus?.bot?.username} in Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Catalog Products</span>
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalProducts}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>In digital store</span>
            <button
              onClick={() => onNavigateToTab('products')}
              className="text-cyan-400 hover:underline"
            >
              Manage &rarr;
            </button>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Store Categories</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalCategories}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>8 Rows × 3 Columns</span>
            <button
              onClick={() => onNavigateToTab('categories')}
              className="text-indigo-400 hover:underline"
            >
              View Grid &rarr;
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Orders</span>
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Customer orders</span>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-purple-400 hover:underline"
            >
              Orders &rarr;
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">USD / KHR Exchange</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            1 USD = {settings?.khrExchangeRate?.toLocaleString() || 4100} ៛
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>ABA PayWay ready</span>
            <button
              onClick={() => onNavigateToTab('settings')}
              className="text-emerald-400 hover:underline"
            >
              Settings &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Bot Connection Card & Webhook Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Telegram Bot Details & Connection Test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-950/70 border border-indigo-700/50 rounded-lg text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Telegram Bot API Diagnostics</h3>
                <p className="text-xs text-slate-400">Real-time status verified against Telegram servers</p>
              </div>
            </div>
            <button
              onClick={onTestConnection}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Test getMe API</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Connection State:</span>
              <span className="font-medium">
                {isConnected ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                    Authenticated & Online
                  </span>
                ) : isConfigured ? (
                  <span className="text-rose-400 font-semibold">Authentication Error</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Missing Bot Token</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Bot Username:</span>
              <span className="font-mono text-white">
                {botStatus?.bot?.username ? `@${botStatus.bot.username}` : 'Not Available'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Telegram Bot ID:</span>
              <span className="font-mono text-slate-300">
                {botStatus?.bot?.id || '—'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Display Name:</span>
              <span className="text-slate-300">
                {botStatus?.bot?.first_name || 'Khmer Tech Digital Store'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Token Security:</span>
              <span className="text-emerald-400 flex items-center space-x-1 font-mono text-[11px]">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Server-side env only (Zero client exposure)</span>
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab('simulator')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-medium rounded-lg transition flex items-center justify-center space-x-2"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Open Interactive Bot Simulator (Test /start &amp; Keyboards)</span>
            </button>
          </div>
        </div>

        {/* Right: Webhook Inspection & Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-cyan-950/70 border border-cyan-700/50 rounded-lg text-cyan-400">
                <Link className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Server-side Webhook Status</h3>
                <p className="text-xs text-slate-400">Live webhook registered with api.telegram.org</p>
              </div>
            </div>
            <button
              onClick={onRefreshWebhook}
              title="Refresh webhook info"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Active Webhook URL:</span>
              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 break-all">
                <span className="flex-1 truncate">
                  {webhookInfo?.url || 'No active webhook set on Telegram'}
                </span>
                {webhookInfo?.url && (
                  <button
                    onClick={() => copyToClipboard(webhookInfo.url, 'wh_url')}
                    className="p-1 hover:text-white text-slate-400 shrink-0"
                    title="Copy URL"
                  >
                    {copiedText === 'wh_url' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Pending Updates</span>
                <span className="font-mono text-sm font-semibold text-white">
                  {webhookInfo?.pending_update_count ?? 0}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Custom Certificate</span>
                <span className="font-mono text-sm font-semibold text-white">
                  {webhookInfo?.has_custom_certificate ? 'Yes' : 'No (HTTPS Cloud Run)'}
                </span>
              </div>
            </div>

            {webhookInfo?.last_error_message && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px]">
                <span className="font-semibold block text-rose-200">Last Telegram Sync Error:</span>
                {webhookInfo.last_error_message}
              </div>
            )}
          </div>

          {/* Webhook Configuration Actions */}
          <form onSubmit={handleSetWebhookSubmit} className="pt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={customWebhookUrl}
                onChange={e => setCustomWebhookUrl(e.target.value)}
                placeholder="Auto-detects https://.../api/telegram/webhook"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                disabled={settingWebhook}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition shrink-0 disabled:opacity-50"
              >
                {settingWebhook ? 'Registering...' : 'Set Webhook'}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Endpoint: <code className="text-slate-400">/api/telegram/webhook</code></span>
              <button
                type="button"
                onClick={() => onDeleteWebhook()}
                className="text-rose-400 hover:underline"
              >
                Delete Webhook
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Starter Products Seed Banner (If catalog is empty) */}
      {totalProducts === 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-800/50 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Product Catalog is Currently Clean &amp; Empty</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Per requirement #4, Telegram users selecting an empty category will see the Khmer empty notice. Would you like to seed 10 popular digital accounts (ChatGPT, Gemini, DeepSeek API, Adobe, VPN) to test live browsing?
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSeed}
              disabled={seedingLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>{seedingLoading ? 'Seeding...' : 'Seed Starter Products'}</span>
            </button>
            <button
              onClick={() => onNavigateToTab('products')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Phase Roadmap Cards */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Architecture &amp; Roadmap Phases
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-emerald-900/40">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Phase 1: Telegram Bot (Active)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Real Telegram Bot API, /start in Khmer, 8 rows × 3 columns inline keyboard, category product queries, server webhook, and admin console.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
              <Server className="w-4 h-4" />
              <span>Phase 2: DigiSeller API</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Official DigiSeller API integration for automated catalog sync and verified supplier purchasing once authorized API is confirmed.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Phase 3: ABA PayWay KHQR</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              National Cambodian KHQR payment integration with webhook callbacks and instant private delivery of digital license keys and credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
