"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { CatalogueFilters } from "./CatalogueFilters";

interface CatalogueViewProps {
  initialProducts: Product[];
}

export function CatalogueViewClient({ initialProducts }: CatalogueViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("featured");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    initialProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort order
    if (selectedSort === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (selectedSort === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (selectedSort === "featured") {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [initialProducts, selectedCategory, selectedSort]);

  return (
    <div className="space-y-10">
      <CatalogueFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        totalCount={filteredProducts.length}
      />

      {filteredProducts.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">
            No silhouettes found for this category
          </p>
          <button
            onClick={() => setSelectedCategory("All")}
            className="text-xs uppercase tracking-widest text-[#d4ff00] underline underline-offset-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
