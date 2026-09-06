"use client";

import React, { useState } from "react";
import { Package, Tag, Zap, ShoppingCart, Activity } from "lucide-react";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCoupons } from "@/components/admin/AdminCoupons";
import { AdminSales } from "@/components/admin/AdminSales";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminActivityLogs } from "@/components/admin/AdminActivityLogs";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"products" | "coupons" | "sales" | "orders" | "logs">("products");

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "sales", label: "Flash Sales", icon: Zap },
    { id: "orders", label: "Orders Queue", icon: ShoppingCart },
    { id: "logs", label: "Activity Logs", icon: Activity },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest font-mono transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                  : "bg-[#0c0c0c] text-[#888888] hover:text-white border border-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Views */}
      <div className="pt-2">
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "sales" && <AdminSales />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "logs" && <AdminActivityLogs />}
      </div>
    </div>
  );
}
