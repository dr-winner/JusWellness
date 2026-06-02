"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import {
  Plus,
  Clock,
  CheckCircle,
  Beaker,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function generateBatchNumber(): string {
  const now = new Date();
  const day = DAYS_SHORT[now.getDay()];
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${day}${y}${m}${d}`;
}

const statusColors: Record<string, string> = {
  "in-progress": "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  discarded: "bg-red-100 text-red-700",
};

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultProduct = products[0];
  const [formData, setFormData] = useState({
    product_name: defaultProduct?.name || "",
    bottle_size: defaultProduct?.sizes[0]?.label || "",
    quantity: "",
    batch_number: generateBatchNumber(),
    units_wasted: "",
    waste_reason: "",
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

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleProductChange = (productName: string) => {
    const product = products.find((p) => p.name === productName);
    setFormData({
      ...formData,
      product_name: productName,
      bottle_size: product?.sizes[0]?.label || "",
    });
  };

  const handleLogBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("production_batches").insert({
      product_name: formData.product_name,
      bottle_size: formData.bottle_size || null,
      quantity: Number(formData.quantity),
      batch_number: formData.batch_number || null,
      units_wasted: Number(formData.units_wasted) || 0,
      waste_reason: formData.waste_reason || null,
      notes: formData.notes || null,
      status: "in-progress",
    });
    setSaving(false);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setShowLogModal(false);
    setFormData({
      product_name: defaultProduct?.name || "",
      bottle_size: defaultProduct?.sizes[0]?.label || "",
      quantity: "",
      batch_number: generateBatchNumber(),
      units_wasted: "",
      waste_reason: "",
      notes: "",
    });
    fetchBatches();
  };

  const completeBatch = async (id: string) => {
    const { error } = await supabase
      .from("production_batches")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "completed" } : b))
    );
  };

  const discardBatch = async (id: string) => {
    if (!confirm("Mark this batch as discarded?")) return;
    const { error } = await supabase
      .from("production_batches")
      .update({ status: "discarded" })
      .eq("id", id);
    if (error) {
      alert("Failed: " + error.message);
      return;
    }
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "discarded" } : b))
    );
  };

  const totalProduced = batches.reduce((s, b) => s + (b.quantity || 0), 0);
  const totalWasted = batches.reduce((s, b) => s + (b.units_wasted || 0), 0);
  const completedCount = batches.filter((b) => b.status === "completed").length;
  const inProgressCount = batches.filter((b) => b.status === "in-progress").length;

  const currentProduct = products.find((p) => p.name === formData.product_name);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Production & Waste
          </h1>
          <p className="text-gray-500 mt-1">
            Log batches produced, track waste and spoilage.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBatches}
            className="p-2.5 hover:bg-gray-100 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                batch_number: generateBatchNumber(),
              }));
              setShowLogModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Batch
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {completedCount}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Beaker className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {inProgressCount}
              </p>
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
              <p className="text-sm text-gray-500">Units Produced</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{totalWasted}</p>
              <p className="text-sm text-gray-500">Units Wasted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Batches table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
          </div>
        ) : batches.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Beaker className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No batches logged yet. Start producing!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Batch #
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Size
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Produced
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Wasted
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {batch.batch_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {batch.product_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {batch.bottle_size || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-brand-green">
                      {batch.quantity}
                    </td>
                    <td className="px-6 py-4">
                      {batch.units_wasted > 0 ? (
                        <span className="text-sm font-bold text-red-600">
                          {batch.units_wasted}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                      {batch.waste_reason && (
                        <p className="text-xs text-red-400 truncate max-w-[120px]">
                          {batch.waste_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                          statusColors[batch.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {batch.status === "completed" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : batch.status === "discarded" ? (
                          <Trash2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {batch.status === "completed"
                          ? "Completed"
                          : batch.status === "discarded"
                          ? "Discarded"
                          : "In Progress"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 hidden md:table-cell">
                      {new Date(batch.produced_at).toLocaleString("en-GH", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {batch.status === "in-progress" && (
                          <>
                            <button
                              onClick={() => completeBatch(batch.id)}
                              className="p-1.5 hover:bg-green-50 rounded-lg"
                              title="Mark Completed"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => discardBatch(batch.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg"
                              title="Discard"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bottle Size
                  </label>
                  <select
                    value={formData.bottle_size}
                    onChange={(e) =>
                      setFormData({ ...formData, bottle_size: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm bg-white"
                  >
                    {currentProduct?.sizes.map((s) => (
                      <option key={s.label} value={s.label}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_number: e.target.value })
                    }
                    placeholder="e.g. MON20260522"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units Produced
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="e.g. 24"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units Wasted / Spoilt
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.units_wasted}
                    onChange={(e) =>
                      setFormData({ ...formData, units_wasted: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
              </div>
              {Number(formData.units_wasted) > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Reason
                  </label>
                  <input
                    type="text"
                    value={formData.waste_reason}
                    onChange={(e) =>
                      setFormData({ ...formData, waste_reason: e.target.value })
                    }
                    placeholder="e.g. Spoilt, leaked, dropped..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any notes about this batch..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm resize-none"
                />
              </div>
              <p className="text-xs text-gray-400">
                Ingredients will be auto-deducted from inventory when batch is
                marked completed.
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
