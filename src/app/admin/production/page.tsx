"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { Plus, Clock, CheckCircle, Beaker, Loader2, RefreshCw } from "lucide-react";

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    product_name: products[0]?.name || "",
    quantity: "",
    notes: "",
  });

  const fetchBatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("production_batches")
      .select("*, batch_ingredients(*)")
      .order("produced_at", { ascending: false })
      .limit(50);
    if (error) console.error("Production fetch:", error.message);
    setBatches(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleLogBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("production_batches").insert({
      product_name: formData.product_name,
      quantity: Number(formData.quantity),
      notes: formData.notes || null,
      status: "in-progress",
    });
    setSaving(false);
    if (error) { alert("Failed: " + error.message); return; }
    setShowLogModal(false);
    setFormData({ product_name: products[0]?.name || "", quantity: "", notes: "" });
    fetchBatches();
  };

  const completeBatch = async (id: string) => {
    const { error } = await supabase
      .from("production_batches")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { alert("Failed: " + error.message); return; }
    setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, status: "completed" } : b)));
  };

  const completedToday = batches.filter((b) => b.status === "completed").length;
  const totalProduced = batches.reduce((s, b) => s + (b.quantity || 0), 0);
  const inProgress = batches.filter((b) => b.status === "in-progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-500 mt-1">
            Log production batches and track what was made today.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchBatches} className="p-2.5 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Batch
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedToday}
              </p>
              <p className="text-sm text-gray-500">Batches Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Beaker className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalProduced}
              </p>
              <p className="text-sm text-gray-500">Units Produced Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch cards */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Beaker className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No batches logged yet. Start producing!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">{batch.product_name}</h3>
                  <p className="text-xs text-gray-400">{batch.batch_number || batch.id?.slice(0, 8)}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                    batch.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {batch.status === "completed" ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {batch.status === "completed" ? "Completed" : "In Progress"}
                </span>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="font-bold text-brand-green">
                    {batch.quantity} bottles
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Produced</span>
                  <span className="text-sm text-gray-700">
                    {new Date(batch.produced_at).toLocaleString("en-GH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {batch.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Expires</span>
                    <span className="text-sm text-gray-700">
                      {new Date(batch.expires_at).toLocaleDateString("en-GH", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                )}

                {/* Ingredients */}
                {(batch.batch_ingredients || []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Ingredients Used:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {batch.batch_ingredients.map((ing: any) => (
                        <span
                          key={ing.id}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg"
                        >
                          {ing.ingredient_name}: {ing.amount} {ing.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {batch.notes && (
                  <p className="text-sm text-gray-500 italic bg-yellow-50 p-3 rounded-lg">
                    📝 {batch.notes}
                  </p>
                )}
              </div>
              {batch.status === "in-progress" && (
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => completeBatch(batch.id)}
                    className="w-full py-2 bg-brand-green text-white text-sm font-semibold rounded-lg hover:bg-brand-green-dark transition-colors"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Batch Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogModal(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Log Production Batch
            </h2>
            <form onSubmit={handleLogBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Produced
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 24"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this batch..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm resize-none"
                />
              </div>
              <p className="text-xs text-gray-400">
                Ingredients will be auto-deducted from inventory based on the
                recipe.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark disabled:opacity-50"
                >
                  {saving ? "Logging..." : "Log Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
