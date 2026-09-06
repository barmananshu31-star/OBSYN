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

export async function GET(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe") || "all";

  const supabase = getServiceRoleClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

  const now = Date.now();
  let cutoffDate: string | null = null;

  if (timeframe === "12h") {
    cutoffDate = new Date(now - 12 * 60 * 60 * 1000).toISOString();
  } else if (timeframe === "24h") {
    cutoffDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  } else if (timeframe === "1w") {
    cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (timeframe === "1m") {
    cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  if (cutoffDate) {
    query = query.gte("created_at", cutoffDate);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ orders: data, timeframe });
}

export async function PUT(req: Request) {
  const auth = await verifyAdminAuth();
  if (!auth) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { id, status, payment_status } = body;

    if (!id) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_logs").insert({
      user_id: auth.user.id,
      user_email: auth.email,
      action: "admin_order_status_updated",
      metadata: { order_id: id, updates },
    });

    return NextResponse.json({ order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
