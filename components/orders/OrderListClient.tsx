"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Package, ChevronDown, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";

export function OrderListClient({ orders }: { orders: Order[] }) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "shipped":
        return "bg-[#d4ff00]/10 text-[#d4ff00] border-[#d4ff00]/30";
      case "tailoring":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "processing":
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="py-24 text-center space-y-4 bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#666666]">
          <Package className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm uppercase tracking-widest font-bold text-white">
            No Archival Orders Found
          </h3>
          <p className="text-xs text-[#777777]">
            You have not placed any orders with this Google account yet.
          </p>
        </div>
        <Link
          href="/catalogue"
          className="inline-block px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
        >
          Explore Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const totalItemsCount = (order.items || []).reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );

        return (
          <div
            key={order.id}
            className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden transition-colors hover:border-white/20"
          >
            {/* Header */}
            <div
              onClick={() => toggleExpand(order.id)}
              className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#121212] border border-white/10 flex items-center justify-center text-[#d4ff00]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-white">
                      {order.order_number}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777777] font-mono mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" • "}
                    {totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-[#666666]">
                    Order Total
                  </div>
                  <div className="text-sm font-mono font-bold text-[#d4ff00]">
                    {formatCurrency(Number(order.total))}
                  </div>
                </div>

                <button
                  className="p-1.5 text-[#888888] hover:text-white transition-colors"
                  aria-label="Expand Order"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="p-6 bg-[#080808] border-t border-white/10 space-y-6">
                {/* Items List */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-[#888888]">
                    Purchased Silhouettes
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-3 bg-[#0d0d0d] border border-white/5 rounded-lg items-center"
                      >
                        <div className="relative w-12 h-14 bg-[#141414] rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || item.custom_image_url || "/placeholder-garment.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 text-xs space-y-0.5">
                          <div className="font-bold text-white uppercase">{item.name}</div>
                          <div className="text-[10px] text-[#777777] font-mono">
                            {item.size && `Size: ${item.size} `}
                            {item.fabric && `• ${item.fabric} `}
                            {item.pattern && `• Pattern: ${item.pattern}`}
                          </div>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <div className="text-white">{formatCurrency(item.price)}</div>
                          <div className="text-[10px] text-[#666666]">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#666666] block">
                      Dispatch Address
                    </span>
                    <p className="text-white font-medium">{order.shipping_address?.fullName}</p>
                    <p className="text-[#888888]">{order.shipping_address?.addressLine1}</p>
                    <p className="text-[#888888]">
                      {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                      {order.shipping_address?.postalCode}
                    </p>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <span className="text-[10px] uppercase tracking-wider text-[#666666] block">
                      Payment Verification
                    </span>
                    <p className="text-white font-mono uppercase">Status: {order.payment_status}</p>
                    {order.coupon_code && (
                      <p className="text-[#d4ff00] font-mono text-[11px]">
                        Promo: {order.coupon_code} (-{formatCurrency(Number(order.discount))})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
