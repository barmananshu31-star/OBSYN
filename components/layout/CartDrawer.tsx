"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Surface */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-[#080808] border-l border-white/10 flex flex-col justify-between shadow-2xl text-white"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm uppercase tracking-[0.2em] font-bold">Shopping Bag</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#d4ff00] font-mono">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 text-[#888888] hover:text-white transition-colors"
                  aria-label="Close Bag"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#555555]">
                      <X className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold uppercase tracking-wider">Your Bag is Empty</p>
                      <p className="text-xs text-[#777777]">Explore archival silhouettes in Drop 01.</p>
                    </div>
                    <Link
                      href="/catalogue"
                      onClick={closeCart}
                      className="mt-4 px-6 py-3 border border-white/20 text-xs uppercase tracking-widest hover:border-white transition-colors"
                    >
                      Browse Catalogue
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3.5 rounded-lg bg-[#0e0e0e] border border-white/[0.06] hover:border-white/10 transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-20 h-24 bg-[#141414] rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || item.custom_image_url || "/placeholder-garment.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {item.is_custom && (
                          <span className="absolute top-1 left-1 bg-[#d4ff00] text-black text-[9px] font-black uppercase px-1 py-0.5 tracking-tighter">
                            BESPOKE
                          </span>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold tracking-tight uppercase line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[#555555] hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs font-mono text-[#d4ff00] mt-1">
                            {formatCurrency(item.price)}
                          </p>

                          {/* Selected Specs */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.size && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0a0]">
                                Size: {item.size}
                              </span>
                            )}
                            {item.fabric && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0a0]">
                                {item.fabric}
                              </span>
                            )}
                            {item.pattern && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0a0]">
                                {item.pattern}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-white/15 rounded bg-black/40">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-[#888888] hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-[#888888] hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-xs font-mono font-bold text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-[#0a0a0a] space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#888888]">
                      <span>Subtotal</span>
                      <span className="font-mono text-white text-sm font-bold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#555555]">
                      <span>Shipping</span>
                      <span className="text-[#d4ff00]">Calculated at Checkout</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#777777] bg-white/[0.02] border border-white/5 p-2 rounded">
                    <ShieldCheck className="w-4 h-4 text-[#d4ff00]" />
                    <span>Complimentary express insured global delivery on Drop 01.</span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black text-xs font-extrabold uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] transition-colors"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
