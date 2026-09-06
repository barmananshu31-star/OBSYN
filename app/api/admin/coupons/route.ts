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
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data });
}

export async function POST(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { code, discount_type, discount_value, min_order_value, expires_at, active } = body;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value: Number(discount_value),
        min_order_value: Number(min_order_value) || 0,
        expires_at: expires_at || null,
        active: active !== undefined ? active : true,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_coupon_created",
      metadata: { coupon_id: data.id, code: data.code },
    });

    return NextResponse.json({ coupon: data });
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

    if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_coupon_updated",
      metadata: { coupon_id: id },
    });

    return NextResponse.json({ coupon: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activity_logs").insert({
    user_id: auth.user.id,
    user_email: auth.email,
    action: "admin_coupon_deleted",
    metadata: { coupon_id: id },
  });

  return NextResponse.json({ success: true });
}
