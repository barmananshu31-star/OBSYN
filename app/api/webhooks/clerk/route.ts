import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/server";

/**
 * Clerk Webhook Handler
 * Listens for user.created and user.updated events and writes directly to activity_logs
 * using the Supabase service role client.
 *
 * Verifies webhook signature using Svix and CLERK_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Error: CLERK_WEBHOOK_SECRET not configured", {
      status: 500,
    });
  }

  // Get the Svix verification headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get the raw payload body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Clerk Webhook] Error verifying signature:", err);
    return new Response("Error: Invalid signature", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, created_at } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    try {
      const supabase = getServiceRoleClient();
      const { error } = await supabase.from("activity_logs").insert({
        user_id: id,
        user_email: primaryEmail || null,
        action: "user_signed_up",
        metadata: {
          first_name: first_name || null,
          last_name: last_name || null,
          provider: "google",
          clerk_created_at: created_at,
          registered_at: new Date().toISOString(),
        },
      });

      if (error) {
        console.error("[Clerk Webhook] Failed to insert signup activity log:", error);
      }
    } catch (err) {
      console.error("[Clerk Webhook] Database error logging signup:", err);
    }
  } else if (eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    try {
      const supabase = getServiceRoleClient();
      await supabase.from("activity_logs").insert({
        user_id: id,
        user_email: primaryEmail || null,
        action: "user_updated",
        metadata: {
          updated_at: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("[Clerk Webhook] Database error logging user update:", err);
    }
  }

  return new Response(JSON.stringify({ success: true, event: eventType }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
