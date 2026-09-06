import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Public routes that do NOT require authentication.
 * CRITICAL: /api/webhooks/clerk must be publicly accessible without session cookies
 * so that Clerk's server-to-server webhook events (such as user.created) are never blocked.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/catalogue(.*)",
  "/custom-order(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/coupons/validate(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default function middleware(req: any, evt: any) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  // Prevent Edge Middleware 500 crashes if Clerk keys are missing or invalid
  if (
    !publishableKey ||
    !secretKey ||
    publishableKey.includes("pk_test_...") ||
    secretKey.includes("sk_test_...")
  ) {
    return NextResponse.next();
  }

  return clerkMiddleware((auth, req) => {
    if (!isPublicRoute(req)) {
      auth().protect();
    }
  })(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
