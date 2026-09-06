import React from "react";
import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gating: validates active Clerk session and ADMIN_EMAILS allowlist.
  // Unauthenticated or non-admin accounts receive a clean 404.
  const { email } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#040404] text-white">
      {/* Top Admin Bar */}
      <div className="border-b border-white/10 bg-[#080808] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-1.5 text-[#888888] hover:text-white transition-colors"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4ff00]" />
              <span className="text-sm font-extrabold uppercase tracking-widest text-white">
                OBSYN // CONTROL ATELIER
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#888888]">
              RESTRICTED ROUTE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#888888] hidden md:inline">
              {email}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
