"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Clock, Filter, PackageCheck, AlertCircle } from "lucide-react";

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const timeframes = [
    { id: "12h", label: "Past 12 Hours" },
    { id: "24h", label: "Past 24 Hours" },
    { id: "1w", label: "Past 1 Week" },
    { id: "1m", label: "Past 1 Month" },
    { id: "all", label: "All Time" },
  ];

  const fetchOrders = async (tf: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(timeframe);
  }, [timeframe]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalUnits = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0),
    0
  );
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-6 text-white">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Orders Fulfillment Matrix
          </h2>
          <p className="text-xs text-[#777777]">
            Monitor customer order dispatch states across dynamic time windows.
          </p>
        </div>

        {/* Timeframe pills */}
        <div className="flex items-center gap-1.5 bg-[#0a0a0a] border border-white/10 p-1 rounded-lg overflow-x-auto">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                timeframe === tf.id
                  ? "bg-white text-black font-bold"
                  : "text-[#888888] hover:text-white"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#777777]">
            Allocated Revenue ({timeframe.toUpperCase()})
          </div>
          <div className="text-2xl font-mono font-bold text-[#d4ff00]">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#777777]">
            Orders Committed
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {orders.length} <span className="text-xs text-[#666666]">({totalUnits} units)</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#777777]">
            Average Order Value (AOV)
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatCurrency(avgOrderValue)}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#888888]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-xs uppercase tracking-wider text-[#666666]">
            No orders placed within this time interval.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e0e0e] text-[#777777] uppercase font-mono text-[10px] tracking-wider">
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer Email</th>
                <th className="p-4">Items Breakdown</th>
                <th className="p-4">Total</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#cccccc]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono font-bold text-white tracking-wider">
                    {order.order_number}
                  </td>
                  <td className="p-4 font-mono text-[#aaaaaa]">
                    {order.user_email}
                  </td>
                  <td className="p-4">
                    <div className="space-y-0.5 max-w-xs">
                      {(order.items || []).map((i: any, idx: number) => (
                        <div key={idx} className="text-[11px] truncate">
                          {i.quantity}x {i.name} {i.size ? `(${i.size})` : ""}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#d4ff00]">
                    {formatCurrency(Number(order.total))}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#777777]">
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {updatingId === order.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4ff00]" />
                      )}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="bg-[#141414] border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#d4ff00] cursor-pointer"
                      >
                        <option value="processing">Processing</option>
                        <option value="tailoring">Tailoring</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
