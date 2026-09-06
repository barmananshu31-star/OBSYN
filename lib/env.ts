/**
 * Environment Variables Validator for OBSYN
 * Identifies missing credentials and ensures live-mode integrity.
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

export function getMissingEnvVars(): string[] {
  const isServer = typeof window === "undefined";
  const missing: string[] = [];

  const varsToCheck = isServer ? requiredServerEnvVars : requiredClientEnvVars;

  for (const envVar of varsToCheck) {
    const value = process.env[envVar];
    if (
      !value ||
      value.trim() === "" ||
      value.includes("your-project") ||
      value.includes("placeholder") ||
      value.startsWith("pk_test_...") ||
      value.startsWith("sk_test_...")
    ) {
      missing.push(envVar);
    }
  }

  return missing;
}

export function validateEnv(): string[] {
  const missing = getMissingEnvVars();

  if (missing.length > 0) {
    const errorMessage = `
================================================================================
[OBSYN CONFIGURATION ERROR] Missing Required Environment Variables!
================================================================================
The following required variables are either missing or contain placeholder values:

${missing.map((key) => `  - ${key}`).join("\n")}

Please populate them in Vercel Project Settings > Environment Variables.
The application operates in strict live-mode and requires valid Clerk and Supabase credentials.
================================================================================
`;
    console.error(errorMessage);
  }

  return missing;
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
