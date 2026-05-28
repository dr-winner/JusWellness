"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Package,
  Loader2,
  RefreshCw,
  Edit3,
} from "lucide-react";

const categoryColors: Record<string, string> = {
  fruit: "bg-orange-50 text-orange-700",
  vegetable: "bg-green-50 text-green-700",
  spice: "bg-yellow-50 text-yellow-700",
  packaging: "bg-blue-50 text-blue-700",
  other: "bg-gray-50 text-gray-700",
};

const conditionColors: Record<string, string> = {
  good: "bg-green-100 text-green-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-orange-100 text-orange-700",
  expired: "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockItem, setRestockItem] = useState<any | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockSaving, setRestockSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "fruit",
    unit: "kg",
    quantity: "",
    cost_per_unit: "",
    reorder_level: "",
    supplier: "",
    condition: "good",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name");
    if (error) console.error("Inventory fetch:", error.message);
    setInventory(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    setRestockSaving(true);
    const newQty = restockItem.quantity + Number(restockQty);
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQty, condition: "good" })
      .eq("id", restockItem.id);
    setRestockSaving(false);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setRestockItem(null);
    setRestockQty("");
    fetchInventory();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("inventory").insert({
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      quantity: Number(formData.quantity),
      cost_per_unit: Number(formData.cost_per_unit),
      reorder_level: Number(formData.reorder_level),
      supplier: formData.supplier || null,
      condition: formData.condition,
      notes: formData.notes || null,
    });
    setSaving(false);
    if (error) {
      alert("Failed to add: " + error.message);
      return;
    }
    setShowAddModal(false);
    setFormData({ name: "", category: "fruit", unit: "kg", quantity: "", cost_per_unit: "", reorder_level: "", supplier: "", condition: "good", notes: "" });
    fetchInventory();
  };

  const lowStockCount = inventory.filter((i) => i.quantity <= i.reorder_level).length;
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.cost_per_unit, 0);

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Track raw materials, packaging, and supplies.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2.5 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-gray-500">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none text-sm bg-white"
        />
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Item</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Stock</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Cost/Unit</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Supplier</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden lg:table-cell">Condition</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.reorder_level;
                  return (
                    <tr key={item.id} className={cn("border-b border-gray-50 hover:bg-gray-50/50", isLow && "bg-red-50/30")}>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                        {item.notes && <p className="text-xs text-gray-400 truncate max-w-[150px]">{item.notes}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${categoryColors[item.category] || "bg-gray-50 text-gray-600"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("text-sm font-bold", isLow ? "text-red-600" : "text-gray-900")}>
                          {item.quantity} {item.unit}
                        </span>
                        <br />
                        <span className="text-xs text-gray-400">Reorder at {item.reorder_level}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                        {formatCurrency(item.cost_per_unit)}/{item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{item.supplier || "—"}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${conditionColors[item.condition] || "bg-gray-100 text-gray-600"}`}>
                          {item.condition || "good"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <button
                            onClick={() => { setRestockItem(item); setRestockQty(""); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
                          >
                            <AlertTriangle className="w-3 h-3" />Restock
                          </button>
                        ) : (
                          <button
                            onClick={() => { setRestockItem(item); setRestockQty(""); }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full hover:bg-green-200 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />OK
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Inventory Item</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Spinach" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white">
                    <option value="fruit">Fruit</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="spice">Spice</option>
                    <option value="packaging">Packaging</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white">
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" required min="0" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white">
                    <option>kg</option><option>pcs</option><option>litres</option><option>bags</option><option>boxes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Amount (GHS)</label>
                  <input type="number" required min="0" step="0.01" value={formData.cost_per_unit} onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                  <input type="number" required min="0" step="0.01" value={formData.reorder_level} onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Details</label>
                <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} placeholder="e.g. Madina Market — Kofi, 0551234567" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any notes about condition, delivery, etc..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark disabled:opacity-50">
                  {saving ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRestockItem(null)} />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Restock {restockItem.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Current: <span className="font-bold text-gray-900">{restockItem.quantity} {restockItem.unit}</span> (reorder at {restockItem.reorder_level})</p>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add ({restockItem.unit})</label>
                <input type="number" required min="0.01" step="0.01" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} placeholder={`e.g. 10`} autoFocus className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm" />
                {restockQty && (
                  <p className="text-xs text-brand-green font-semibold mt-1">New total: {(restockItem.quantity + Number(restockQty)).toFixed(1)} {restockItem.unit}</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRestockItem(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={restockSaving} className="flex-1 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark disabled:opacity-50">
                  {restockSaving ? "Restocking..." : "Restock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
