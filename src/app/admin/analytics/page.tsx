"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Repeat,
  Loader2,
  RefreshCw,
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, repeatRate: 0 });
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; amount: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([]);
  const [channelBreakdown, setChannelBreakdown] = useState<{ channel: string; orders: number; pct: number; color: string }[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Get all orders from this week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", startOfWeek.toISOString())
        .neq("status", "cancelled");

      const allOrders = orders || [];
      const revenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);

      // Unique customers
      const customerIds = new Set(allOrders.map((o) => o.customer_id).filter(Boolean));

      // Weekly revenue by day
      const dayMap: Record<string, number> = {};
      DAYS.forEach((d) => (dayMap[d] = 0));
      allOrders.forEach((o) => {
        const d = DAYS[new Date(o.created_at).getDay()];
        dayMap[d] += o.total || 0;
      });
      const weekData = DAYS.slice(1).concat(DAYS[0]).map((d) => ({ day: d, amount: dayMap[d] }));

      // Top products from order_items
      const productMap: Record<string, { units: number; revenue: number }> = {};
      allOrders.forEach((o) => {
        (o.order_items || []).forEach((item: any) => {
          const key = item.product_name || "Unknown";
          if (!productMap[key]) productMap[key] = { units: 0, revenue: 0 };
          productMap[key].units += item.quantity || 0;
          productMap[key].revenue += (item.unit_price || 0) * (item.quantity || 0);
        });
      });
      const topProds = Object.entries(productMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Channel breakdown
      const channelMap: Record<string, number> = {};
      allOrders.forEach((o) => {
        const ch = o.channel || "WhatsApp";
        channelMap[ch] = (channelMap[ch] || 0) + 1;
      });
      const totalOrders = allOrders.length || 1;
      const colors = ["bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500"];
      const channels = Object.entries(channelMap)
        .map(([channel, count], i) => ({
          channel,
          orders: count,
          pct: Math.round((count / totalOrders) * 100),
          color: colors[i % colors.length],
        }))
        .sort((a, b) => b.orders - a.orders);

      // Repeat customers
      const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      const { count: repeatCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .gt("total_orders", 1);
      const rr = totalCustomers ? Math.round(((repeatCustomers || 0) / totalCustomers) * 100) : 0;

      setStats({ revenue, orders: allOrders.length, customers: customerIds.size, repeatRate: rr });
      setWeeklyRevenue(weekData);
      setTopProducts(topProds);
      setChannelBreakdown(channels);
    } catch (err) {
      console.error("Analytics fetch:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.amount), 1);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Business insights for the current week.
          </p>
        </div>
        <button onClick={fetchAnalytics} className="p-2.5 hover:bg-gray-100 rounded-xl" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.revenue)}
          </p>
          <p className="text-sm text-gray-500">Weekly Revenue</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
          <p className="text-sm text-gray-500">Unique Customers</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.repeatRate}%</p>
          <p className="text-sm text-gray-500">Repeat Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart (bar chart using divs) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Weekly Revenue</h2>
          <div className="flex items-end gap-3 h-48">
            {weeklyRevenue.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">
                  {formatCurrency(day.amount)}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-brand-green to-brand-green-light rounded-t-lg transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${(day.amount / maxRevenue) * 100}%`,
                    minHeight: "8px",
                  }}
                />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet this week.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 bg-brand-green/10 text-brand-green text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {product.name}
                      </span>
                      <span className="text-sm font-bold text-brand-green">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-brand-green rounded-full h-2 transition-all duration-500"
                        style={{
                          width: `${(product.revenue / (topProducts[0]?.revenue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {product.units} units sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Sales by Channel</h2>
          {channelBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No orders yet this week.</p>
          ) : (
            <div className="space-y-4">
              {channelBreakdown.map((ch) => (
                <div key={ch.channel} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {ch.channel}
                    </span>
                    <span className="text-sm text-gray-500">
                      {ch.orders} orders ({ch.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${ch.color} rounded-full h-3 transition-all duration-500`}
                      style={{ width: `${ch.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Insight */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-6">Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700 font-medium">
                {stats.repeatRate > 50
                  ? `💡 ${stats.repeatRate}% of your customers come back. Consider a loyalty program to push this even higher!`
                  : stats.orders > 0
                  ? `💡 You have ${stats.orders} orders this week. Keep the momentum going!`
                  : `💡 No orders this week yet. Share your menu on WhatsApp and Instagram to drive traffic!`}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">
                📊 Analytics update live from your Supabase database. As orders come in, this dashboard populates automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
