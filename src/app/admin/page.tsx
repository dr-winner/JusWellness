"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface DashboardData {
  revenueToday: number;
  ordersToday: number;
  productsSold: number;
  avgOrderValue: number;
  recentOrders: any[];
  lowStockItems: any[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [ordersRes, recentRes, inventoryRes] = await Promise.all([
        supabase
          .from("orders")
          .select("total, status")
          .gte("created_at", todayISO),
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("inventory").select("*"),
      ]);

      const todayOrders = ordersRes.data || [];
      const activeOrders = todayOrders.filter((o) => o.status !== "cancelled");
      const revenue = activeOrders.reduce((s, o) => s + Number(o.total), 0);
      const productsSold = (recentRes.data || [])
        .flatMap((o: any) => o.order_items || [])
        .reduce((s: number, i: any) => s + (i.quantity || 0), 0);
      const avg = activeOrders.length > 0 ? revenue / activeOrders.length : 0;

      const lowStock = (inventoryRes.data || []).filter(
        (i: any) => i.quantity <= i.reorder_level
      );

      setData({
        revenueToday: revenue,
        ordersToday: todayOrders.length,
        productsSold,
        avgOrderValue: avg,
        recentOrders: recentRes.data || [],
        lowStockItems: lowStock,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  const stats = [
    {
      label: "Revenue Today",
      value: formatCurrency(data.revenueToday),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Orders Today",
      value: String(data.ordersToday),
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Products Sold",
      value: String(data.productsSold),
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(data.avgOrderValue),
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <a
              href="/admin/orders"
              className="text-sm text-brand-green font-medium hover:underline"
            >
              View all
            </a>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No orders yet. They&apos;ll show up here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Order</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3 hidden sm:table-cell">Items</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Total</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                        <br />
                        <span className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.customer_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell max-w-[200px] truncate">
                        {(order.order_items || []).map((i: any) => `${i.product_name} x${i.quantity}`).join(", ")}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(Number(order.total))}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
            <span className="w-6 h-6 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
              {data.lowStockItems.length}
            </span>
          </div>
          <div className="p-6 space-y-4">
            {data.lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">All stocked up!</p>
            ) : (
              data.lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-red-600">
                      {item.quantity} {item.unit} left (reorder at {item.reorder_level})
                    </p>
                  </div>
                  <a
                    href="/admin/inventory"
                    className="px-3 py-1.5 bg-white text-xs font-semibold text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    Restock
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
