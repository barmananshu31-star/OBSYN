import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Package, Clock, Shield } from "lucide-react";

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderNumber?: string };
}) {
  const orderNumber = searchParams.orderNumber || "OBS-8A9F21B";

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-white space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center mx-auto text-[#d4ff00]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
            ALLOCATION CONFIRMED
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            ORDER COMMITTED TO ATELIER
          </h1>
          <p className="text-sm text-[#888888] max-w-md mx-auto font-light">
            Your silhouette has been reserved in our inventory and assigned to our master tailoring queue.
          </p>
        </div>
      </div>

      {/* Order Card */}
      <div className="p-8 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#666666]">ORDER IDENTIFIER</div>
            <div className="text-xl font-mono font-bold text-white tracking-wider">{orderNumber}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-[10px] uppercase tracking-widest text-[#666666]">ESTIMATED DISPATCH</div>
            <div className="text-xs font-mono text-[#d4ff00]">WITHIN 24-48 HOURS</div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-widest font-bold text-[#888888]">
            Atelier Progress Timeline
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-[#141414] border border-[#d4ff00]/40 rounded space-y-1">
              <div className="text-[10px] font-mono text-[#d4ff00] font-bold">01 // AUTHORIZED</div>
              <div className="text-xs text-white">Stock Reserved</div>
            </div>
            <div className="p-3 bg-[#111111] border border-white/5 rounded space-y-1 opacity-70">
              <div className="text-[10px] font-mono text-[#888888]">02 // TAILORING</div>
              <div className="text-xs text-[#aaaaaa]">Pattern Prep</div>
            </div>
            <div className="p-3 bg-[#111111] border border-white/5 rounded space-y-1 opacity-70">
              <div className="text-[10px] font-mono text-[#888888]">03 // INSPECTION</div>
              <div className="text-xs text-[#aaaaaa]">Tactile Audit</div>
            </div>
            <div className="p-3 bg-[#111111] border border-white/5 rounded space-y-1 opacity-70">
              <div className="text-[10px] font-mono text-[#888888]">04 // TRANSIT</div>
              <div className="text-xs text-[#aaaaaa]">Insured Dispatch</div>
            </div>
          </div>
        </div>

        {/* Security & Support note */}
        <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded text-xs text-[#777777]">
          <Shield className="w-5 h-5 text-[#d4ff00] flex-shrink-0" />
          <span>A dispatch confirmation and encrypted tracking URL have been forwarded to your registered email.</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/orders"
          className="w-full sm:w-auto px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] transition-colors text-center"
        >
          View in My Orders
        </Link>
        <Link
          href="/catalogue"
          className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] rounded hover:border-white transition-colors text-center"
        >
          Back to Catalogue
        </Link>
      </div>
    </div>
  );
}
