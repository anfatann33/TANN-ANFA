/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Send,
  Radio,
  Settings,
  BookOpen,
  AlertTriangle,
  Zap,
  RefreshCw
} from 'lucide-react';

import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { ProductsTab } from './components/ProductsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { OrdersTab } from './components/OrdersTab';
import { BotSimulatorTab } from './components/BotSimulatorTab';
import { SettingsTab } from './components/SettingsTab';
import { DeploymentGuideTab } from './components/DeploymentGuideTab';
import { TestConnectionModal } from './components/TestConnectionModal';

import {
  Product,
  Category,
  Order,
  StoreSettings,
  BotStatusResponse,
  WebhookInfo,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Core Data
  const [botStatus, setBotStatus] = useState<BotStatusResponse | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);

  // Diagnostic Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Simulator helper
  const [simulatorCategory, setSimulatorCategory] = useState<string | undefined>(undefined);

  // Fetch all initial data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [statusRes, whRes, prodRes, catRes, ordRes, setRes] = await Promise.allSettled([
        fetch('/api/telegram/status').then(r => r.json()),
        fetch('/api/telegram/webhook-info').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
      ]);

      if (statusRes.status === 'fulfilled') setBotStatus(statusRes.value);
      if (whRes.status === 'fulfilled' && whRes.value.result) setWebhookInfo(whRes.value.result);
      if (prodRes.status === 'fulfilled' && prodRes.value.products) setProducts(prodRes.value.products);
      if (catRes.status === 'fulfilled' && catRes.value.categories) setCategories(catRes.value.categories);
      if (ordRes.status === 'fulfilled' && ordRes.value.orders) setOrders(ordRes.value.orders);
      if (setRes.status === 'fulfilled') {
        setSettings(setRes.value.settings);
        setEnvStatus(setRes.value.envStatus);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real getMe Connection Test
  const handleTestConnection = async () => {
    setIsTestModalOpen(true);
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
      });
      const data = await res.json();
      setTestResult(data);

      // Also update header status
      if (data.bot) {
        setBotStatus(prev => ({
          configured: true,
          connected: true,
          bot: data.bot,
        }));
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : 'Network test error',
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Set Webhook
  const handleSetWebhook = async (url?: string) => {
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Webhook successfully registered with Telegram!\nURL: ${data.webhookUrl}`);
        fetchData(true);
      } else {
        alert(`Failed to set webhook: ${data.message || data.telegramResponse?.description}`);
      }
    } catch (err) {
      alert(`Error setting webhook: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Delete Webhook
  const handleDeleteWebhook = async () => {
    if (!confirm('Are you sure you want to delete the Telegram webhook?')) return;
    try {
      const res = await fetch('/api/telegram/delete-webhook', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        alert('Webhook deleted from Telegram.');
        fetchData(true);
      } else {
        alert(`Failed to delete webhook: ${data.description}`);
      }
    } catch (err) {
      alert(`Error deleting webhook: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  // Add Product
  const handleAddProduct = async (productData: any) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      fetchData(true);
    } else {
      const err = await res.json();
      alert(`Error creating product: ${err.error}`);
    }
  };

  // Update Product
  const handleUpdateProduct = async (id: string, updates: any) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Update Category
  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Update Order
  const handleUpdateOrderStatus = async (orderId: string, updates: Partial<Order>) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Create Test Order
  const handleCreateTestOrder = async () => {
    const defaultProduct = products[0] || {
      id: 'prod_chatgpt_sample',
      title: 'ChatGPT Plus Account',
      priceUSD: 10,
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramUserId: 987654321,
        telegramUsername: 'khmer_dev_855',
        totalAmountUSD: defaultProduct.priceUSD,
        items: [
          {
            productId: defaultProduct.id,
            title: defaultProduct.title,
            priceUSD: defaultProduct.priceUSD,
            quantity: 1,
          },
        ],
        paymentMethod: 'aba_khqr',
      }),
    });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Seed Starter Products
  const handleSeedProducts = async () => {
    const res = await fetch('/api/settings/seed-products', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      fetchData(true);
    }
  };

  // Update Settings
  const handleUpdateSettings = async (updates: Partial<StoreSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      fetchData(true);
    }
  };

  // Tab navigation helpers
  const handleNavigateToProducts = (categoryId?: string) => {
    setActiveTab('products');
  };

  const handleNavigateToSimulator = (catId?: string) => {
    setSimulatorCategory(catId);
    setActiveTab('simulator');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', count: products.length, icon: ShoppingBag },
    { id: 'categories', label: 'Categories (8x3)', count: categories.length, icon: Layers },
    { id: 'orders', label: 'Orders', count: orders.length, icon: Send },
    { id: 'simulator', label: 'Bot Simulator', icon: Radio },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings },
    { id: 'deploy', label: 'Deployment Guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        botStatus={botStatus}
        loadingStatus={refreshing}
        onRefreshStatus={() => fetchData()}
        onTestConnection={handleTestConnection}
        testLoading={testLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <div className="text-white text-sm font-medium">Connecting to Khmer Tech Digital Store...</div>
            <div className="text-xs text-slate-400">Loading catalog, Telegram bot state, and database</div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                botStatus={botStatus}
                webhookInfo={webhookInfo}
                settings={settings}
                totalProducts={products.length}
                totalCategories={categories.length}
                totalOrders={orders.length}
                onRefreshWebhook={() => fetchData(true)}
                onSetWebhook={handleSetWebhook}
                onDeleteWebhook={handleDeleteWebhook}
                onTestConnection={handleTestConnection}
                onSeedProducts={handleSeedProducts}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                categories={categories}
                settings={settings}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onSeedProducts={handleSeedProducts}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                onUpdateCategory={handleUpdateCategory}
                onNavigateToProducts={handleNavigateToProducts}
                onNavigateToSimulator={handleNavigateToSimulator}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                products={products}
                settings={settings}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onCreateTestOrder={handleCreateTestOrder}
              />
            )}

            {activeTab === 'simulator' && (
              <BotSimulatorTab
                botStatus={botStatus}
                categories={categories}
                initialCategory={simulatorCategory}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                envStatus={envStatus}
                onUpdateSettings={handleUpdateSettings}
              />
            )}

            {activeTab === 'deploy' && <DeploymentGuideTab />}
          </div>
        )}
      </main>

      {/* Real getMe API Test Modal */}
      <TestConnectionModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        loading={testLoading}
        result={testResult}
      />
    </div>
  );
}
