/**
 * Environment Variables Validator for OBSYN
 * Fails loudly on startup if required production credentials are not provided.
 */

const requiredServerEnvVars = [
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
] as const;

const requiredClientEnvVars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export function validateEnv() {
  const isServer = typeof window === "undefined";
  const missing: string[] = [];

  const varsToCheck = isServer ? requiredServerEnvVars : requiredClientEnvVars;

  for (const envVar of varsToCheck) {
    const value = process.env[envVar];
    if (!value || value.trim() === "" || value.includes("your-project") || value.startsWith("pk_test_...") || value.startsWith("sk_test_...")) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
================================================================================
[OBSYN CONFIGURATION ERROR] Missing Required Environment Variables!
================================================================================
The following required variables are either missing or contain placeholder values in your .env.local:

${missing.map((key) => `  - ${key}`).join("\n")}

Please populate them in .env.local using .env.example as a reference.
The application operates in strict live-mode and requires valid Clerk and Supabase credentials.
================================================================================
`;
    if (process.env.NODE_ENV === "production" || isServer) {
      console.error(errorMessage);
      throw new Error(`[OBSYN] Missing required environment variables: ${missing.join(", ")}`);
    }
  }
}

export const env = {
  get clerkPublishableKey(): string {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  },
  get clerkSecretKey(): string {
    return process.env.CLERK_SECRET_KEY || "";
  },
  get clerkWebhookSecret(): string {
    return process.env.CLERK_WEBHOOK_SECRET || "";
  },
  get supabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  },
  get supabaseAnonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  },
  get supabaseServiceRoleKey(): string {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },
  get adminEmails(): string[] {
    const emails = process.env.ADMIN_EMAILS || "";
    return emails
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
  get paymentProvider(): string {
    return process.env.PAYMENT_PROVIDER || "test";
  },
  get siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  },
};
