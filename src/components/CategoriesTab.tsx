import React, { useState } from 'react';
import { Layers, Edit3, CheckCircle2, XCircle, ShoppingBag, Plus, Eye, Radio } from 'lucide-react';
import { Category } from '../types';

interface CategoriesTabProps {
  categories: Category[];
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  onNavigateToProducts: (categoryId: string) => void;
  onNavigateToSimulator: (categoryId?: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  onUpdateCategory,
  onNavigateToProducts,
  onNavigateToSimulator,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [nameKhmer, setNameKhmer] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Group by rows (1 through 8)
  const rows = [1, 2, 3, 4, 5, 6, 7, 8];

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setNameKhmer(cat.nameKhmer || cat.name);
    setNameEnglish(cat.name);
    setIsActive(cat.isActive);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);
    try {
      await onUpdateCategory(editingCategory.id, {
        name: nameEnglish,
        nameKhmer: nameKhmer,
        isActive,
      });
      setEditingCategory(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-950/70 border border-indigo-700/50 rounded-xl text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                Telegram Inline Keyboard Layout (8 Rows × 3 Columns)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This exact layout is rendered by the Telegram Bot API when a user sends <code>/start</code>. Click any category to view its catalog or test its response.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToSimulator()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Open in Bot Simulator</span>
          </button>
        </div>
      </div>

      {/* 8 Rows Visual Keyboard Grid */}
      <div className="space-y-4">
        {rows.map(rowNum => {
          const rowCategories = categories
            .filter(c => c.row === rowNum)
            .sort((a, b) => a.col - b.col);

          return (
            <div key={rowNum} className="space-y-1.5">
              <div className="flex items-center justify-between px-1 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <span>Row {rowNum}</span>
                <span className="text-slate-600">3 Columns</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {rowCategories.map(cat => {
                  const hasProducts = (cat.activeProductCount || 0) > 0;
                  return (
                    <div
                      key={cat.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group relative flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-white text-sm group-hover:text-cyan-300 transition">
                            {cat.name}
                          </div>
                          {cat.nameKhmer && cat.nameKhmer !== cat.name && (
                            <div className="text-[11px] text-cyan-400 font-sans mt-0.5">
                              {cat.nameKhmer}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: {cat.id}
                          </div>
                        </div>

                        {/* Product count badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            hasProducts
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                          }`}
                        >
                          {hasProducts ? `${cat.activeProductCount} items` : 'Empty (0)'}
                        </span>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => onNavigateToProducts(cat.id)}
                          className="text-cyan-400 hover:underline flex items-center space-x-1 text-[11px]"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Products</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onNavigateToSimulator(cat.id)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                            title="Simulate Telegram response"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(cat)}
                            className="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition"
                            title="Edit Category Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Buttons Specification Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Additional Telegram Bot Buttons (Rows 9 - 11)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="font-semibold text-white block">🔍 Search Products</span>
            <span className="text-[10px] text-slate-500 font-mono">action_search</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="font-semibold text-white block">📦 All Products</span>
            <span className="text-[10px] text-slate-500 font-mono">action_all</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="font-semibold text-white block">🛍️ My Orders</span>
            <span className="text-[10px] text-slate-500 font-mono">action_orders</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <span className="font-semibold text-white block">💬 Support</span>
            <span className="text-[10px] text-slate-500 font-mono">action_support</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="font-semibold text-white block">⬅️ Back</span>
            <span className="text-[10px] text-slate-500 font-mono">action_back</span>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white text-base">
                Edit Category: {editingCategory.name}
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Display Name (English) *</label>
                <input
                  type="text"
                  required
                  value={nameEnglish}
                  onChange={e => setNameEnglish(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Display Name (Khmer)</label>
                <input
                  type="text"
                  value={nameKhmer}
                  onChange={e => setNameKhmer(e.target.value)}
                  placeholder="ឈ្មោះជាភាសាខ្មែរ"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-600 focus:ring-0"
                />
                <label htmlFor="cat-active" className="text-slate-300 font-medium">
                  Active in Telegram Keyboard
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
