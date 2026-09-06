"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Plus, Minus, Shield, Sparkles, Truck, ChevronDown } from "lucide-react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.size_options?.[0] || "M");
  const [selectedFabric, setSelectedFabric] = useState(product.fabric_options?.[0] || "500 GSM French Terry");
  const [selectedPattern, setSelectedPattern] = useState(product.pattern_options?.[0] || "Solid Obsidian");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("specs");

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: selectedImage || product.images?.[0] || "",
      size: selectedSize,
      fabric: selectedFabric,
      pattern: selectedPattern,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 text-white">
      {/* Back Link */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#888888] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalogue</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        {/* Left Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-24 rounded overflow-hidden border transition-all flex-shrink-0 ${
                    selectedImage === img
                      ? "border-[#d4ff00] scale-105"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} angle ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Large Image Preview */}
          <div className="relative flex-1 aspect-[4/5] bg-[#0c0c0c] border border-white/10 rounded-lg overflow-hidden">
            <Image
              src={selectedImage || product.images?.[0] || "/placeholder-garment.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center grayscale contrast-115 filter transition-all duration-500"
            />
          </div>
        </div>

        {/* Right Info & Purchasing Stage */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
              <span>{product.category}</span>
              <span>//</span>
              <span>DROP 01</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight-headline text-white">
              {product.name}
            </h1>
            <p className="text-xl font-mono font-bold text-white pt-1">
              {formatCurrency(Number(product.price))}
            </p>
          </div>

          <p className="text-sm text-[#888888] leading-relaxed font-light">
            {product.description}
          </p>

          {/* Size Selector */}
          {product.size_options && product.size_options.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#888888]">
                <span>Select Proportions</span>
                <span className="text-[#555555] cursor-pointer hover:text-white">Size Chart</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.size_options.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[48px] py-2.5 px-3 rounded text-xs uppercase font-bold tracking-wider border transition-all ${
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-[#0f0f0f] text-[#888888] border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fabric Selector */}
          {product.fabric_options && product.fabric_options.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-widest text-[#888888]">
                Textile Specification
              </div>
              <div className="flex flex-col gap-2">
                {product.fabric_options.map((fab) => (
                  <button
                    key={fab}
                    onClick={() => setSelectedFabric(fab)}
                    className={`w-full py-3 px-4 rounded text-xs text-left font-medium tracking-wider border transition-all flex items-center justify-between ${
                      selectedFabric === fab
                        ? "bg-[#141414] text-white border-[#d4ff00]"
                        : "bg-[#0c0c0c] text-[#777777] border-white/5 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span>{fab}</span>
                    {selectedFabric === fab && <Check className="w-3.5 h-3.5 text-[#d4ff00]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA */}
          <div className="pt-4 border-t border-white/[0.08] space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity input */}
              <div className="flex items-center border border-white/15 rounded bg-[#0d0d0d] px-2 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-[#888888] hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-[#888888] hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : product.stock === 0 ? (
                  <span>Sold Out</span>
                ) : (
                  <span>Add to Bag // {formatCurrency(Number(product.price) * quantity)}</span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#555555]">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-[#d4ff00]" : "bg-red-500"}`} />
              <span>
                {product.stock > 10
                  ? "ALLOCATION READY FOR SHIPMENT"
                  : product.stock > 0
                  ? `ONLY ${product.stock} UNITS REMAINING`
                  : "CURRENTLY SOLD OUT"}
              </span>
            </div>
          </div>

          {/* Accordion Specs */}
          <div className="pt-6 border-t border-white/[0.08] space-y-3 text-xs">
            {/* Specs */}
            <div className="border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => toggleAccordion("specs")}
                className="w-full p-4 flex items-center justify-between text-left font-bold uppercase tracking-widest bg-[#0a0a0a]"
              >
                <span>Architectural Specifications</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "specs" ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === "specs" && (
                <div className="p-4 bg-[#080808] border-t border-white/5 text-[#888888] space-y-2 leading-relaxed">
                  <p>• Engineered with Japanese loopback weave preventing shrinkage and structural sagging.</p>
                  <p>• Heavyweight double-needle flatlock construction on all load-bearing stress points.</p>
                  <p>• Custom dyed using archival non-toxic obsidian pigments.</p>
                </div>
              )}
            </div>

            {/* Sizing */}
            <div className="border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => toggleAccordion("sizing")}
                className="w-full p-4 flex items-center justify-between text-left font-bold uppercase tracking-widest bg-[#0a0a0a]"
              >
                <span>Silhouette Proportion Guide</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "sizing" ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === "sizing" && (
                <div className="p-4 bg-[#080808] border-t border-white/5 text-[#888888] space-y-2 leading-relaxed">
                  <p>This piece features an intentional boxy oversized drape. For a relaxed signature fit, select your true size. For a tailored profile, size down one unit.</p>
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="border border-white/10 rounded overflow-hidden">
              <button
                onClick={() => toggleAccordion("delivery")}
                className="w-full p-4 flex items-center justify-between text-left font-bold uppercase tracking-widest bg-[#0a0a0a]"
              >
                <span>Complimentary Delivery & Returns</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === "delivery" ? "rotate-180" : ""}`} />
              </button>
              {activeAccordion === "delivery" && (
                <div className="p-4 bg-[#080808] border-t border-white/5 text-[#888888] space-y-2 leading-relaxed">
                  <p>Dispatched via priority courier with end-to-end tracking within 24 hours. We offer complimentary 14-day archival exchanges on all unworn items.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
