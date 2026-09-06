import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
