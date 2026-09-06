import { Hero } from "@/components/home/Hero";
import { BrandManifesto } from "@/components/home/BrandManifesto";
import { FeaturedDrop } from "@/components/home/FeaturedDrop";
import { CustomOrderCTA } from "@/components/home/CustomOrderCTA";
import { CraftPillars } from "@/components/home/CraftPillars";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";

export const revalidate = 60; // Revalidate every minute

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Home Page] Error fetching products:", error);
      return [];
    }

    return (data as Product[]) || [];
  } catch (err) {
    console.error("[Home Page] Supabase connection error:", err);
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <BrandManifesto />
      <FeaturedDrop products={products} />
      <CustomOrderCTA />
      <CraftPillars />
    </div>
  );
}
