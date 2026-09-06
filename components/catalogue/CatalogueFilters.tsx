"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

interface FilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  totalCount: number;
}

export function CatalogueFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  totalCount,
}: FilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-white text-black font-bold"
                  : "bg-[#0f0f0f] text-[#888888] hover:text-white border border-white/5 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Sort & Count */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 text-xs uppercase tracking-widest text-[#888888]">
        <span className="font-mono text-[11px] text-[#555555]">
          {totalCount} {totalCount === 1 ? "SILHOUETTE" : "SILHOUETTES"}
        </span>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#666666]" />
          <select
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className="bg-[#0e0e0e] text-white border border-white/10 rounded px-3 py-1.5 text-xs uppercase tracking-wider focus:outline-none focus:border-white transition-colors cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Releases</option>
          </select>
        </div>
      </div>
    </div>
  );
}
