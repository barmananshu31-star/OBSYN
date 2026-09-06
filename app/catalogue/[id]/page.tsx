import { notFound } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductDetailClient } from "@/components/catalogue/ProductDetailClient";

export const revalidate = 60;

async function getProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const supabase = getServiceRoleClient();

    // Check by id or slug
    let query = supabase.from("products").select("*");

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (isUuid) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Product;
  } catch (err) {
    console.error("[Product Detail] Error fetching product:", err);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
