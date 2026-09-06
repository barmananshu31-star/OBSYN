"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Tag, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
  } | null>(null);

  // Shipping form state
  const [shipping, setShipping] = useState({
    fullName: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  // Submission state
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  // Validate coupon through server-side endpoint
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discount: data.calculatedDiscount,
          discountType: data.discountType,
        });
      }
    } catch (err) {
      setCouponError("Unable to validate coupon at this time.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Submit checkout
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (items.length === 0) {
      setCheckoutError("Your shopping bag is empty.");
      return;
    }

    if (!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setCheckoutError("Please fill in all required shipping address fields.");
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subtotal,
          discount,
          total: finalTotal,
          couponCode: appliedCoupon?.code || null,
          shippingAddress: shipping,
          paymentPayload: { simulated: true },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed. Please review your details.");
      }

      // Order created successfully via atomic RPC!
      const orderNumber = data.order?.order_number || "OBS-CONFIRMED";
      clearCart();
      router.push(`/order-confirmation?orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch (err: any) {
      console.error("[Checkout error]:", err);
      setCheckoutError(err.message || "An error occurred during order processing.");
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-28 text-center space-y-6 text-white">
        <h1 className="text-3xl font-black uppercase tracking-tight">Your Bag is Empty</h1>
        <p className="text-sm text-[#888888]">
          Add archival garments or configure a bespoke piece before proceeding to checkout.
        </p>
        <Link
          href="/catalogue"
          className="inline-block px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded hover:bg-[#d4ff00] transition-colors"
        >
          Explore Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 text-white">
      {/* Return to cart */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#888888] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Form: Shipping & Abstracted Payment */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
              STAGE 02 // DISPATCH
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white mt-1">
              CHECKOUT & DISPATCH
            </h1>
          </div>

          {checkoutError && (
            <div className="p-4 bg-red-950/60 border border-red-500/40 rounded text-xs text-red-300">
              {checkoutError}
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Contact Details */}
            <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white">
                01 // Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white tracking-wider focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white">
                02 // Shipping Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104 Mercer St"
                    value={shipping.addressLine1}
                    onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                    className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#888888] block mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      className="w-full bg-[#121212] border border-white/10 rounded px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section (Abstracted Payment Adapter) */}
            <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#d4ff00]" />
                  <span>03 // Payment Terminal</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#d4ff00] uppercase">
                  ADAPTER ARCHITECTURE
                </span>
              </div>

              <div className="p-4 bg-[#121212] border border-white/5 rounded space-y-2 text-xs text-[#888888]">
                <p>
                  Payments are routed through the modular <span className="text-white font-mono">OBSYN Payment Adapter</span>. Currently configured for live simulated execution (ready for Stripe, Razorpay, or PayPal via <span className="text-white font-mono">PAYMENT_PROVIDER</span>).
                </p>
                <div className="flex items-center gap-2 text-[#d4ff00] text-[11px] font-mono pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test simulation active — no external charge will be debited.</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(255,255,255,0.15)] disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Allocating Inventory & Securing Order...</span>
                </>
              ) : (
                <span>Complete Order // {formatCurrency(finalTotal)}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Summary: Line Items & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-6">
            <h3 className="text-xs uppercase tracking-widest font-bold text-white border-b border-white/10 pb-4">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Line Items */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative w-14 h-16 bg-[#141414] rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image || item.custom_image_url || "/placeholder-garment.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="font-bold uppercase tracking-tight line-clamp-1">{item.name}</div>
                    <div className="text-[10px] text-[#777777]">
                      {item.size && `Size: ${item.size} `}
                      {item.fabric && `• ${item.fabric} `}
                      {item.quantity > 1 && `• Qty: ${item.quantity}`}
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-white/10 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-[#888888] block">
                Promotional Code (Try: OBSYN10 or WELCOME20)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#121212] border border-white/10 rounded px-3 py-2 text-xs text-white uppercase tracking-widest focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="px-4 py-2 bg-white/10 text-white text-xs uppercase tracking-widest font-bold rounded hover:bg-white hover:text-black transition-colors"
                >
                  {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-400">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#d4ff00]">
                  <Tag className="w-3 h-3" />
                  <span>Promotional code {appliedCoupon.code} applied (-{formatCurrency(appliedCoupon.discount)})</span>
                </div>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#888888]">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#d4ff00]">
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#888888]">
                <span>Insured Express Shipping</span>
                <span className="text-[#d4ff00] uppercase font-mono">Complimentary</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between text-base font-bold text-white">
                <span>Total</span>
                <span className="font-mono text-[#d4ff00]">{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-xs text-[#777777]">
            <ShieldCheck className="w-5 h-5 text-[#d4ff00] flex-shrink-0" />
            <span>Orders are atomically reserved in inventory upon authorization.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
