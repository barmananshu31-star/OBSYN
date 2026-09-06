"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Loader2, Zap } from "lucide-react";
import { Sale } from "@/lib/types";

export function AdminSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [discountPercent, setDiscountPercent] = useState(15);
  const [scope, setScope] = useState("all");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sales");
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales || []);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleToggleActive = async (sale: Sale) => {
    try {
      const res = await fetch("/api/admin/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sale.id, active: !sale.active }),
      });
      if (res.ok) {
        setSales(sales.map((s) => (s.id === sale.id ? { ...s, active: !s.active } : s)));
      }
    } catch (err) {
      console.error("Error toggling sale:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotional campaign?")) return;
    try {
      const res = await fetch(`/api/admin/sales?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSales(sales.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting sale:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          discount_percent: Number(discountPercent),
          scope,
          starts_at: startsAt,
          ends_at: endsAt,
          active: true,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        fetchSales();
      }
    } catch (err) {
      console.error("Error creating sale:", err);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Flash Sales & Campaigns
          </h2>
          <p className="text-xs text-[#777777]">
            Schedule category-specific or storewide flash promotions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#888888]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="py-20 text-center text-xs uppercase tracking-wider text-[#666666]">
            No sales campaigns currently scheduled.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e0e0e] text-[#777777] uppercase font-mono text-[10px] tracking-wider">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Scope</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#cccccc]">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white uppercase flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#d4ff00]" />
                    <span>{sale.name}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#d4ff00]">
                    {sale.discount_percent}% OFF
                  </td>
                  <td className="p-4 uppercase font-mono">{sale.scope}</td>
                  <td className="p-4 font-mono text-[11px] text-[#777777]">
                    {new Date(sale.starts_at).toLocaleDateString()} — {new Date(sale.ends_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(sale)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                        sale.active
                          ? "bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {sale.active ? "ACTIVE" : "PAUSED"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="p-1.5 text-[#888888] hover:text-red-400 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-white/15 rounded-xl p-6 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm uppercase tracking-widest font-bold">
                Launch Sale Campaign
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-[#888888] uppercase tracking-wider block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MID-SEASON ARCHIVE DROP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="all">Storewide (All)</option>
                    <option value="Hoodies">Hoodies Only</option>
                    <option value="Outerwear">Outerwear Only</option>
                    <option value="Bottoms">Bottoms Only</option>
                    <option value="T-Shirts">T-Shirts Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-[#888888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
