import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client initialized with the SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses RLS for administrative tasks, atomic order placement, Clerk webhook logging,
 * and user-scoped server queries.
 *
 * Guarded with 'server-only' to ensure this key is NEVER bundled into client-side JS.
 * Includes a resilient 4-second network timeout to prevent SSR streaming hangs on cold starts.
 */
export function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[OBSYN Supabase Server] SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are strictly required."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(4000), // Prevent Vercel function timeout
        });
      },
    },
  });
}
