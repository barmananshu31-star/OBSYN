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
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sales: data });
}

export async function POST(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { name, discount_percent, scope, starts_at, ends_at, active } = body;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("sales")
      .insert({
        name,
        discount_percent: Number(discount_percent),
        scope: scope || "all",
        starts_at: starts_at || new Date().toISOString(),
        ends_at: ends_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        active: active !== undefined ? active : true,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_sale_created",
      metadata: { sale_id: data.id, name: data.name },
    });

    return NextResponse.json({ sale: data });
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

    if (!id) return NextResponse.json({ error: "Sale ID required" }, { status: 400 });

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("sales")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_sale_updated",
      metadata: { sale_id: id },
    });

    return NextResponse.json({ sale: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Sale ID required" }, { status: 400 });

  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activity_logs").insert({
    user_id: auth.user.id,
    user_email: auth.email,
    action: "admin_sale_deleted",
    metadata: { sale_id: id },
  });

  return NextResponse.json({ success: true });
}
