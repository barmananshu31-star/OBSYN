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
  const action = searchParams.get("action");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 200);

  const supabase = getServiceRoleClient();
  let query = supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (action && action !== "all") {
    query = query.eq("action", action);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ logs: data });
}
