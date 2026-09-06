import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/server";

/**
 * Server route for uploading and saving custom garment configurations.
 * Gated by Clerk authentication server-side; performs Supabase storage upload
 * and DB insert with the service role client.
 */
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to save your custom design." },
        { status: 401 }
      );
    }

    const primaryEmail =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      "";

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fabric = formData.get("fabric") as string;
    const size = formData.get("size") as string;
    const pattern = formData.get("pattern") as string;

    if (!fabric || !size || !pattern) {
      return NextResponse.json(
        { error: "Missing required specifications (fabric, size, pattern)." },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    let imageUrl = "";

    if (file && file.size > 0) {
      // Generate clean unique filename
      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("custom-designs")
        .upload(filePath, buffer, {
          contentType: file.type || "image/png",
          upsert: true,
        });

      if (uploadError) {
        console.error("[Custom Design Upload Error]:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload design artwork to storage." },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from("custom-designs")
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    // Insert into custom_designs table
    const { data: designRecord, error: dbError } = await supabase
      .from("custom_designs")
      .insert({
        user_id: userId,
        user_email: primaryEmail,
        fabric,
        size,
        pattern,
        image_url: imageUrl,
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("[Custom Design DB Error]:", dbError);
      return NextResponse.json(
        { error: "Failed to save design record." },
        { status: 500 }
      );
    }

    // Append to activity logs
    await supabase.from("activity_logs").insert({
      user_id: userId,
      user_email: primaryEmail,
      action: "custom_design_created",
      metadata: {
        design_id: designRecord.id,
        fabric,
        size,
        pattern,
        has_artwork: !!imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      customDesign: designRecord,
      imageUrl,
    });
  } catch (err: any) {
    console.error("[Custom Design Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process custom design." },
      { status: 500 }
    );
  }
}
