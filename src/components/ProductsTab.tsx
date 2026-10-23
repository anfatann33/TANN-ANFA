import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Key,
  Lock,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  onAddProduct: (productData: any) => Promise<void>;
  onUpdateProduct: (id: string, updates: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onSeedProducts: () => Promise<void>;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  settings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSeedProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    titleKhmer: string;
    description: string;
    categoryId: string;
    priceUSD: number;
    stock: number;
    sku: string;
    deliveryType: 'instant_license_key' | 'account_credentials' | 'manual_fulfillment' | 'digiseller_auto';
    deliveryContent: string;
    status: 'active' | 'out_of_stock' | 'draft';
  }>({
    title: '',
    titleKhmer: '',
    description: '',
    categoryId: 'chatgpt',
    priceUSD: 10,
    stock: 10,
    sku: '',
    deliveryType: 'instant_license_key',
    deliveryContent: '',
    status: 'active',
  });

  const exchangeRate = settings?.khrExchangeRate || 4100;

  const openAddModal = (catId?: string) => {
    setEditingProduct(null);
    setFormData({
      title: '',
      titleKhmer: '',
      description: '',
      categoryId: catId || (selectedCategory !== 'all' ? selectedCategory : 'chatgpt'),
      priceUSD: 9.99,
      stock: 10,
      sku: `KT-${Date.now().toString().slice(-5)}`,
      deliveryType: 'instant_license_key',
      deliveryContent: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      titleKhmer: prod.titleKhmer || '',
      description: prod.description || '',
      categoryId: prod.categoryId,
      priceUSD: prod.priceUSD,
      stock: prod.stock,
      sku: prod.sku,
      deliveryType: prod.deliveryType,
      deliveryContent: prod.deliveryContent || '',
      status: prod.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId) return;

    setFormLoading(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, formData);
      } else {
        await onAddProduct(formData);
      }
      setIsModalOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      await onDeleteProduct(id);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        (p.titleKhmer && p.titleKhmer.toLowerCase().includes(q)) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, SKU, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({products.filter(p => p.categoryId === cat.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Add Product Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => openAddModal()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Products Table / Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium text-base">No Products Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No products matched your search filters. Try clearing the filter criteria.'
                : 'Your digital catalog is currently empty. Add your first digital account or seed starter items to test live Telegram store queries.'}
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => openAddModal()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition"
            >
              Add First Product
            </button>
            <button
              onClick={onSeedProducts}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seed 10 Starter Accounts</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (USD / KHR)</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Delivery Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map(prod => {
                  const khrApprox = (prod.priceUSD * exchangeRate).toLocaleString();
                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-medium text-white text-sm">{prod.title}</div>
                          {prod.titleKhmer && (
                            <div className="text-[11px] text-cyan-400 font-sans">{prod.titleKhmer}</div>
                          )}
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {prod.sku}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
                          {getCategoryName(prod.categoryId)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">${prod.priceUSD.toFixed(2)}</div>
                        <div className="text-[11px] text-slate-400">~{khrApprox} ៛</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-medium ${
                            prod.stock <= 0
                              ? 'text-rose-400'
                              : prod.stock < 5
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center space-x-1 text-slate-300 capitalize text-[11px]">
                          <Key className="w-3 h-3 text-cyan-400" />
                          <span>{prod.deliveryType.replace(/_/g, ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            prod.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                              : prod.status === 'out_of_stock'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {prod.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Showing {filteredProducts.length} of {products.length} products</span>
            <span>Live data served via Telegram Bot API</span>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white text-base">
                {editingProduct ? 'Edit Digital Product' : 'Add New Digital Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. ChatGPT Plus 1-Month"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Title Khmer */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Title in Khmer (optional)</label>
                  <input
                    type="text"
                    value={formData.titleKhmer}
                    onChange={e => setFormData({ ...formData, titleKhmer: e.target.value })}
                    placeholder="e.g. គណនី ChatGPT Plus 1 ខែ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Category (Telegram Keyboard Row) *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      Row {cat.row}: {cat.name} ({cat.nameKhmer})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Price USD */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.priceUSD}
                    onChange={e => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    ≈ {(formData.priceUSD * exchangeRate).toLocaleString()} ៛
                  </span>
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Stock Count *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* SKU */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Delivery Mode</label>
                  <select
                    value={formData.deliveryType}
                    onChange={e => setFormData({ ...formData, deliveryType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="instant_license_key">Instant License Key / Redeem Code</option>
                    <option value="account_credentials">Account Login (Email + Password)</option>
                    <option value="manual_fulfillment">Manual Admin Delivery / Invite</option>
                    <option value="digiseller_auto">DigiSeller Automatic Dispatch (Phase 2)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Catalog Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">Active (Visible in Telegram Bot)</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Secret Digital Delivery Payload */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Digital Fulfillment Content (Delivered Privately Upon Purchase)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.deliveryContent}
                  onChange={e => setFormData({ ...formData, deliveryContent: e.target.value })}
                  placeholder="e.g. License Key: ABCD-1234-EFGH or Login: user@domain.com | Pass: SecurePass"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Product Description / Features</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features shown in Telegram message..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
