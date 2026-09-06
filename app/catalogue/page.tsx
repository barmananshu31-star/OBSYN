import { getServiceRoleClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { CatalogueViewClient } from "@/components/catalogue/CatalogueViewClient";

export const metadata = {
  title: "Catalogue // OBSYN Archival Streetwear",
  description: "Browse the complete monolithic apparel catalogue for Drop 01.",
};

export const revalidate = 60;

async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Catalogue] Supabase products error:", error);
      return [];
    }

    return (data as Product[]) || [];
  } catch (err) {
    console.error("[Catalogue] Failed to load products:", err);
    return [];
  }
}

export default async function CataloguePage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-12">
      {/* Title section */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
          <span>CATALOGUE</span>
          <span>//</span>
          <span>GENESIS CAPSULE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-[-0.05em] text-white">
          THE COMPLETE MONOLITH.
        </h1>
        <p className="text-sm text-[#888888] font-light leading-relaxed">
          Architectural silhouettes constructed with heavyweight tactile textiles and blackened finishes. Filter by category or sort by release order.
        </p>
      </div>

      {/* Catalogue Interactive Grid */}
      <CatalogueViewClient initialProducts={products} />
    </div>
  );
}
