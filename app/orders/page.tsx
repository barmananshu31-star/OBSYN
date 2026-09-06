import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { Order } from "@/lib/types";
import { OrderListClient } from "@/components/orders/OrderListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Orders // OBSYN Archival Streetwear",
  description: "View and track your archival silhouette orders.",
};

export default async function OrdersPage() {
  const user = await currentUser();

  // If user is not authenticated with Clerk
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-28 text-center space-y-6 text-white">
        <div className="text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
          AUTHENTICATION REQUIRED
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          SIGN IN TO ACCESS ARCHIVAL ORDERS
        </h1>
        <p className="text-sm text-[#888888] max-w-md mx-auto">
          Please authenticate with your Google account to access your personalized atelier order ledger and live dispatch statuses.
        </p>
        <div>
          <SignInButton mode="modal">
            <button className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded hover:bg-[#d4ff00] transition-colors">
              Sign In with Google
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Extract user's primary email
  const userEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "";

  // Query Supabase using service role key (enforcing server-side user filtering)
  let orders: Order[] = [];
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Orders Page] Supabase fetch error:", error);
    } else {
      orders = (data as Order[]) || [];
    }
  } catch (err) {
    console.error("[Orders Page] Error fetching customer orders:", err);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10 text-white">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
          <span>CLIENT ATELIER</span>
          <span>//</span>
          <span>{userEmail}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          ORDER ARCHIVE & DISPATCH.
        </h1>
        <p className="text-sm text-[#888888] font-light">
          Review past acquisition records, bespoke tailoring statuses, and tracking timelines.
        </p>
      </div>

      {/* Orders List */}
      <OrderListClient orders={orders} />
    </div>
  );
}
