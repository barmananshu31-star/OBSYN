import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/server";

/**
 * Server-side Coupon Code Validator
 * Protects the coupons table from public browser reads (enforcing RLS),
 * verifying expiration, active status, and minimum order requirements.
 */
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Please enter a promotional code." },
        { status: 400 }
      );
    }

    const orderSubtotal = Number(subtotal) || 0;
    const normalizedCode = code.trim().toUpperCase();

    const supabase = getServiceRoleClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .eq("active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid or inactive promotional code." },
        { status: 404 }
      );
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This promotional code has expired." },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (coupon.min_order_value && orderSubtotal < Number(coupon.min_order_value)) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order of $${Number(coupon.min_order_value).toFixed(2)} required for this code.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === "percent") {
      discountAmount = (orderSubtotal * Number(coupon.discount_value)) / 100;
    } else {
      discountAmount = Math.min(orderSubtotal, Number(coupon.discount_value));
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      calculatedDiscount: discountAmount,
      message: `Code ${coupon.code} applied successfully.`,
    });
  } catch (err: any) {
    console.error("[Coupon Validate Error]:", err);
    return NextResponse.json(
      { valid: false, error: "An unexpected error occurred while validating code." },
      { status: 500 }
    );
  }
}
