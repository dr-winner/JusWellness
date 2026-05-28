"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Search,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

const channelOptions = ["walkin", "whatsapp", "online", "wholesale"];
const paymentOptions = ["cash", "momo", "transfer", "paystack"];

// Build a flat list of product + size combos for quick selection
const productSizeOptions = products.flatMap((p) =>
  p.sizes.map((s) => ({
    label: `${p.name} — ${s.label}`,
    productName: p.name,
    size: s.label,
    price: s.price,
  }))
);

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    product_name: products[0]?.name || "",
    bottle_size: products[0]?.sizes[0]?.label || "250ml",
    units_sold: "",
    unit_price: String(products[0]?.sizes[0]?.price || ""),
    customer_name: "",
    customer_phone: "",
    channel: "walkin",
    payment_method: "cash",
    notes: "",
  });

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("sold_at", { ascending: false })
      .limit(100);
    if (error) console.error("Sales fetch:", error.message);
    setSales(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleProductChange = (productName: string) => {
    const product = products.find((p) => p.name === productName);
    const size = product?.sizes[0];
    setFormData({
      ...formData,
      product_name: productName,
      bottle_size: size?.label || "",
      unit_price: String(size?.price || ""),
    });
  };

  const handleSizeChange = (sizeLabel: string) => {
    const product = products.find((p) => p.name === formData.product_name);
    const size = product?.sizes.find((s) => s.label === sizeLabel);
    setFormData({
      ...formData,
      bottle_size: sizeLabel,
      unit_price: String(size?.price || formData.unit_price),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const unitsSold = Number(formData.units_sold);
    const unitPrice = Number(formData.unit_price);
    const { error } = await supabase.from("sales").insert({
      product_name: formData.product_name,
      bottle_size: formData.bottle_size,
      units_sold: unitsSold,
      unit_price: unitPrice,
      total_price: unitsSold * unitPrice,
      customer_name: formData.customer_name || null,
      customer_phone: formData.customer_phone || null,
      channel: formData.channel,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
    });
    setSaving(false);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setShowModal(false);
    setFormData({
      product_name: products[0]?.name || "",
      bottle_size: products[0]?.sizes[0]?.label || "250ml",
      units_sold: "",
      unit_price: String(products[0]?.sizes[0]?.price || ""),
      customer_name: "",
      customer_phone: "",
      channel: "walkin",
      payment_method: "cash",
      notes: "",
    });
    fetchSales();
  };

  const todaySales = sales.filter(
    (s) => new Date(s.sold_at).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total_price || 0), 0);
  const todayUnits = todaySales.reduce((sum, s) => sum + (s.units_sold || 0), 0);

  const filtered = sales.filter(
    (s) =>
      s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.sale_number?.toLowerCase().includes(search.toLowerCase())
  );

  const currentProduct = products.find((p) => p.name === formData.product_name);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-500 mt-1">
            Log daily sales — every bottle that leaves the shop.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSales} className="p-2.5 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Sale
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayUnits}</p>
              <p className="text-sm text-gray-500">Units Sold Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todaySales.length}</p>
              <p className="text-sm text-gray-500">Transactions Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by product, customer or sale number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none text-sm bg-white"
        />
      </div>

      {/* Sales table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sales logged yet. Start selling!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Sale #</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Size</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Qty</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden lg:table-cell">Channel</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{sale.sale_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{sale.product_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {sale.bottle_size}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{sale.units_sold}</td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-green">{formatCurrency(Number(sale.total_price))}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{sale.customer_name || "—"}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="inline-block px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full capitalize">
                        {sale.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(sale.sold_at).toLocaleString("en-GH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Log Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={formData.product_name}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Size</label>
                  <select
                    value={formData.bottle_size}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                  >
                    {currentProduct?.sizes.map((s) => (
                      <option key={s.label} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Sold</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.units_sold}
                    onChange={(e) => setFormData({ ...formData, units_sold: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (GHS)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                />
                {formData.units_sold && formData.unit_price && (
                  <p className="text-xs text-brand-green font-semibold mt-1">
                    Total: {formatCurrency(Number(formData.units_sold) * Number(formData.unit_price))}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                  >
                    {channelOptions.map((ch) => (
                      <option key={ch} value={ch} className="capitalize">{ch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                  >
                    {paymentOptions.map((pm) => (
                      <option key={pm} value={pm} className="capitalize">{pm}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this sale..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark disabled:opacity-50">
                  {saving ? "Logging..." : "Log Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
