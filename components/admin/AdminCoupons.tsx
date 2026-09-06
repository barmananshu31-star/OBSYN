"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Loader2, Tag } from "lucide-react";
import { Coupon } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(100);
  const [expiresAt, setExpiresAt] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
      });
      if (res.ok) {
        setCoupons(coupons.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)));
      }
    } catch (err) {
      console.error("Error toggling coupon:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotional code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order_value: Number(minOrderValue),
          expires_at: expiresAt || null,
          active: true,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setCode("");
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Promotional Coupons
          </h2>
          <p className="text-xs text-[#777777]">
            Codes are securely verified server-side to protect discount margins.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Code</span>
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#888888]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center text-xs uppercase tracking-wider text-[#666666]">
            No promotional codes created yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e0e0e] text-[#777777] uppercase font-mono text-[10px] tracking-wider">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#cccccc]">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono font-bold text-white tracking-widest flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#d4ff00]" />
                    <span>{coupon.code}</span>
                  </td>
                  <td className="p-4 font-mono">
                    {coupon.discount_type === "percent"
                      ? `${coupon.discount_value}% OFF`
                      : `${formatCurrency(Number(coupon.discount_value))} OFF`}
                  </td>
                  <td className="p-4 font-mono">{formatCurrency(Number(coupon.min_order_value))}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors ${
                        coupon.active
                          ? "bg-[#d4ff00]/10 text-[#d4ff00] border border-[#d4ff00]/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {coupon.active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1.5 text-[#888888] hover:text-red-400 transition-colors"
                      title="Delete Coupon"
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-white/15 rounded-xl p-6 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm uppercase tracking-widest font-bold">
                Create Promotional Code
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#888888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-[#888888] uppercase tracking-wider block mb-1">Code Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP25"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono uppercase tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Flat ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#888888] uppercase tracking-wider block mb-1">
                    Value {discountType === "percent" ? "(%)" : "($)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#888888] uppercase tracking-wider block mb-1">
                  Minimum Order Value ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-white/10 rounded px-3 py-2 text-white font-mono"
                />
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
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
