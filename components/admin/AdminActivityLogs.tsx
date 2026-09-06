"use client";

import React, { useState, useEffect } from "react";
import { ActivityLog } from "@/lib/types";
import { Loader2, UserPlus, ShoppingBag, ShieldAlert, Edit, Layers, ChevronDown } from "lucide-react";

export function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/logs?action=${action}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filterAction);
  }, [filterAction]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "user_signed_up":
        return <UserPlus className="w-3.5 h-3.5 text-[#d4ff00]" />;
      case "order_placed":
        return <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />;
      case "custom_design_created":
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Edit className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">
            Activity & Security Audit Ledger
          </h2>
          <p className="text-xs text-[#777777]">
            Append-only record of customer signups (via Clerk Webhook), orders, and admin alterations.
          </p>
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-[#0a0a0a] text-white border border-white/10 rounded px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-white cursor-pointer"
        >
          <option value="all">All Event Actions</option>
          <option value="user_signed_up">Signups (user_signed_up)</option>
          <option value="order_placed">Orders (order_placed)</option>
          <option value="custom_design_created">Atelier Designs (custom_design_created)</option>
          <option value="admin_product_created">Admin: Product Created</option>
          <option value="admin_order_status_updated">Admin: Order Status</option>
          <option value="admin_coupon_created">Admin: Coupon Created</option>
        </select>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-[#888888]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-xs uppercase tracking-wider text-[#666666]">
            No activity log records found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-[#141414] border border-white/10 flex items-center justify-center flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white uppercase">
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-[#777777]">
                            {log.user_email || "system"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-[11px] font-mono text-[#666666]">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Metadata JSON Drawer */}
                  {isExpanded && (
                    <div className="mt-3 p-3 rounded bg-[#060606] border border-white/10">
                      <div className="text-[10px] uppercase font-mono text-[#777777] mb-1">
                        PAYLOAD METADATA
                      </div>
                      <pre className="text-[11px] font-mono text-[#a0a0a0] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
