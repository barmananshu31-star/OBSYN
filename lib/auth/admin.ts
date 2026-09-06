import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/server";

/**
 * Checks whether an email address is authorized for administrative privileges.
 * 
 * 1. Checks ADMIN_EMAILS environment variable first (standing allowlist).
 *    Guarantees site owner instant access on first deployment before any DB rows exist.
 * 2. Fallback: Checks the Supabase 'admins' table using service role credentials.
 */
export async function isUserAdmin(userEmail?: string | null): Promise<boolean> {
  if (!userEmail) return false;

  const normalizedEmail = userEmail.trim().toLowerCase();

  // 1. Check standing environment allowlist
  const envAdminList = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envAdminList.includes(normalizedEmail)) {
    return true;
  }

  // 2. Check Supabase admins table
  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("[OBSYN Admin Check] Supabase query error:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[OBSYN Admin Check] Failed checking admins table:", err);
    return false;
  }
}

/**
 * Server-side gate for admin routes.
 * Throws a Next.js notFound() (404) if the user is unauthenticated or not an admin.
 * Returning 404 instead of 403 or redirect prevents revealing that the route exists.
 */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress || user.emailAddresses[0]?.emailAddress;

  const isAdmin = await isUserAdmin(primaryEmail);

  if (!isAdmin) {
    notFound();
  }

  return { user, email: primaryEmail };
}
