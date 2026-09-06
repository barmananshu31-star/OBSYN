import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/catalogue/ProductCard";

export function FeaturedDrop({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const displayItems = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <section className="py-28 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
            <span>LIMITED RUN</span>
            <span>//</span>
            <span>DROP 01 HIGHLIGHTS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight-headline text-white">
            ARCHIVAL SILHOUETTES
          </h2>
        </div>

        <Link
          href="/catalogue"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#888888] hover:text-white transition-colors"
        >
          <span>View All Products</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
