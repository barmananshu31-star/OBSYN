import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/auth/admin";
import { getServiceRoleClient } from "@/lib/supabase/server";

async function verifyAdminAuth() {
  const user = await currentUser();
  if (!user) return null;

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress;

  const authorized = await isUserAdmin(email);
  if (!authorized) return null;

  return { user, email };
}

export async function GET() {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      price,
      category,
      images,
      fabric_options,
      size_options,
      pattern_options,
      featured,
      stock,
    } = body;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
        price: Number(price),
        category,
        images: images || [],
        fabric_options: fabric_options || [],
        size_options: size_options || [],
        pattern_options: pattern_options || [],
        featured: !!featured,
        stock: Number(stock) || 0,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Log admin action
    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_product_created",
      metadata: { product_id: data.id, name: data.name },
    });

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_product_updated",
      metadata: { product_id: id, updates: Object.keys(updates) },
    });

    return NextResponse.json({ product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activity_logs").insert({
    user_id: auth.user.id,
    user_email: auth.email,
    action: "admin_product_deleted",
    metadata: { product_id: id },
  });

  return NextResponse.json({ success: true });
}
