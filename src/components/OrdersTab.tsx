import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Clock, XCircle, User, CreditCard, Key, Filter, Search, Plus } from 'lucide-react';
import { Order, Product, StoreSettings } from '../types';

interface OrdersTabProps {
  orders: Order[];
  products: Product[];
  settings: StoreSettings | null;
  onUpdateOrderStatus: (orderId: string, updates: Partial<Order>) => Promise<void>;
  onCreateTestOrder: () => Promise<void>;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  products,
  settings,
  onUpdateOrderStatus,
  onCreateTestOrder,
}) => {
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false;
    if (filterFulfillment !== 'all' && o.fulfillmentStatus !== filterFulfillment) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        o.orderNumber.toLowerCase().includes(q) ||
        (o.telegramUsername && o.telegramUsername.toLowerCase().includes(q)) ||
        String(o.telegramUserId).includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order # or Telegram Username..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending Payment</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={filterFulfillment}
              onChange={e => setFilterFulfillment(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Fulfillment</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending Delivery</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <button
          onClick={onCreateTestOrder}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Sample Telegram Order</span>
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium text-base">No Orders Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Customer orders placed via the Telegram bot or ABA PayWay checkout will appear here in real time.
            </p>
          </div>
          <button
            onClick={onCreateTestOrder}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition"
          >
            Create Test Order
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="text-white font-medium">
                            {order.telegramUsername ? `@${order.telegramUsername}` : 'Telegram User'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {order.telegramUserId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300">
                        {order.items.map(it => `${it.title} (${it.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">${order.totalAmountUSD.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">~{order.totalAmountKHR.toLocaleString()} ៛</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : order.paymentStatus === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          order.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : order.fulfillmentStatus === 'pending'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Customer Telegram: @{selectedOrder.telegramUsername || selectedOrder.telegramUserId}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Order Items:</span>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-white">
                    <span>{it.title} (x{it.quantity})</span>
                    <span className="font-mono">${(it.priceUSD * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-cyan-400">
                  <span>Total Amount</span>
                  <span>${selectedOrder.totalAmountUSD.toFixed(2)} ({selectedOrder.totalAmountKHR.toLocaleString()} ៛)</span>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={async e => {
                      const newStatus = e.target.value as any;
                      await onUpdateOrderStatus(selectedOrder.id, { paymentStatus: newStatus });
                      setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid (Verified)</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Fulfillment Status</label>
                  <select
                    value={selectedOrder.fulfillmentStatus}
                    onChange={async e => {
                      const newStatus = e.target.value as any;
                      await onUpdateOrderStatus(selectedOrder.id, { fulfillmentStatus: newStatus });
                      setSelectedOrder({ ...selectedOrder, fulfillmentStatus: newStatus });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pending">Pending Delivery</option>
                    <option value="delivered">Delivered to Customer</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Delivery Payload */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center space-x-1">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Delivered License Key / Account Credentials</span>
                </label>
                <textarea
                  rows={2}
                  value={selectedOrder.deliveredContent || ''}
                  onChange={e => setSelectedOrder({ ...selectedOrder, deliveredContent: e.target.value })}
                  placeholder="Enter license key, account login, or link delivered to customer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedOrder) {
                    await onUpdateOrderStatus(selectedOrder.id, {
                      paymentStatus: selectedOrder.paymentStatus,
                      fulfillmentStatus: selectedOrder.fulfillmentStatus,
                      deliveredContent: selectedOrder.deliveredContent,
                    });
                    setSelectedOrder(null);
                  }
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Save Order Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
