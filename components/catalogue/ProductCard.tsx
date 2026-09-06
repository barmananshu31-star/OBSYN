"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage = product.images?.[0] || "/placeholder-hoodie.jpg";
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image: primaryImage,
      size: product.size_options?.[2] || product.size_options?.[0] || "M",
      fabric: product.fabric_options?.[0] || "500 GSM French Terry",
      pattern: product.pattern_options?.[0] || "Solid Obsidian",
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col bg-[#0a0a0a] border border-white/[0.08] rounded-md overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      {/* Product Image Stage */}
      <Link
        href={`/catalogue/${product.id}`}
        className="relative w-full aspect-[4/5] bg-[#111] overflow-hidden block"
      >
        <Image
          src={hovered ? secondaryImage : primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center grayscale contrast-115 filter transition-all duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest font-bold text-[#d4ff00]">
              FEATURED
            </span>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-red-500/30 text-[9px] uppercase tracking-widest font-bold text-red-400">
              ONLY {product.stock} LEFT
            </span>
          )}
        </div>

        {/* Quick Add To Bag Hover Button */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded flex items-center justify-center gap-2 hover:bg-[#d4ff00] hover:text-black transition-colors shadow-lg"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Added to Bag</span>
              </>
            ) : product.stock === 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Info Block */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-2 bg-[#0a0a0a]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#666666]">
            {product.category}
          </div>
          <Link
            href={`/catalogue/${product.id}`}
            className="block text-sm font-bold text-white uppercase tracking-tight hover:text-[#d4ff00] transition-colors mt-0.5 line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <span className="text-xs font-mono font-bold text-white">
            {formatCurrency(Number(product.price))}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#555555]">
            {product.stock > 0 ? "IN STOCK" : "BACKORDER"}
          </span>
        </div>
      </div>
    </div>
  );
}
