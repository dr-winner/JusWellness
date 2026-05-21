"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Search, Eye, Check, Truck, Loader2, RefreshCw, X } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  online: "bg-blue-50 text-blue-700",
  whatsapp: "bg-green-50 text-green-700",
  walkin: "bg-gray-50 text-gray-700",
  wholesale: "bg-orange-50 text-orange-700",
};

const statusFilters = ["all", "pending", "confirmed", "preparing", "delivered", "cancelled"];
const nextStatus: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "delivered",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) console.error("Orders fetch error:", error.message);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      alert("Failed to update: " + error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filtered = orders.filter(
    (o) =>
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase())
  );

  const todayRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage all orders — online, walk-in, WhatsApp & wholesale.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-brand-green">
              {formatCurrency(todayRevenue)}
            </p>
          </div>
          <button onClick={fetchOrders} className="p-2.5 hover:bg-gray-100 rounded-xl" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                filter === s
                  ? "bg-brand-green text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden md:table-cell">Items</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Channel</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                      <br />
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString("en-GH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
                      <br />
                      <span className="text-xs text-gray-400">{order.customer_phone}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-600 max-w-[200px] truncate">
                        {(order.order_items || []).map((i: any) => `${i.product_name} x${i.quantity}`).join(", ") || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(Number(order.total))}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${typeColors[order.channel] || "bg-gray-50 text-gray-600"}`}>
                        {order.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {nextStatus[order.status] && (
                          <button
                            onClick={() => updateStatus(order.id, nextStatus[order.status])}
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                            title={`Move to ${nextStatus[order.status]}`}
                          >
                            {order.status === "preparing" ? (
                              <Truck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        )}
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <button
                            onClick={() => updateStatus(order.id, "cancelled")}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
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
    </div>
  );
}
