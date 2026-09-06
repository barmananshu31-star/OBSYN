import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/server";
import { getPaymentAdapter } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const clerkUser = await currentUser();

    const body = await req.json();
    const {
      items,
      subtotal,
      discount,
      total,
      couponCode,
      shippingAddress,
      paymentPayload,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your shopping bag is empty." },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      return NextResponse.json(
        { error: "Valid shipping address information is required." },
        { status: 400 }
      );
    }

    const customerEmail =
      clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ||
      clerkUser?.emailAddresses?.[0]?.emailAddress ||
      shippingAddress.email ||
      "customer@obsyn.com";

    const customerId = userId || `guest_${Date.now()}`;
    const orderNumber = `OBS-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 1. Process payment via the abstracted payment adapter
    const paymentAdapter = getPaymentAdapter();

    // -----------------------------------------------------------------------------------------
    // TODO: When a real gateway (Stripe/Razorpay/PayPal) replaces the mock adapter:
    // 1. Add a soft pre-check of product stock availability BEFORE charging the customer.
    // 2. Wrap place_order() in a try-catch so that if place_order() fails (e.g. ERR_INSUFFICIENT_STOCK
    //    due to a race condition), it triggers an automated refund / void call on the payment adapter
    //    rather than leaving the customer charged with no completed order row.
    // -----------------------------------------------------------------------------------------

    const paymentResult = await paymentAdapter.processPayment(
      {
        amount: Number(total),
        currency: "USD",
        orderNumber,
        customerEmail,
        customerName: shippingAddress.fullName,
      },
      paymentPayload
    );

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || "Payment transaction declined." },
        { status: 402 }
      );
    }

    // 2. Atomically check stock, decrement inventory, and insert order record in one Postgres transaction
    const supabase = getServiceRoleClient();

    const { data: orderData, error: rpcError } = await supabase.rpc("place_order", {
      p_user_id: customerId,
      p_user_email: customerEmail,
      p_items: items,
      p_subtotal: Number(subtotal),
      p_discount: Number(discount) || 0,
      p_total: Number(total),
      p_coupon_code: couponCode || null,
      p_shipping_address: shippingAddress,
    });

    if (rpcError) {
      console.error("[Checkout place_order RPC Error]:", rpcError);

      // Inspect if error is stock-related
      if (rpcError.message && rpcError.message.includes("ERR_INSUFFICIENT_STOCK")) {
        return NextResponse.json(
          { error: rpcError.message.replace("ERR_INSUFFICIENT_STOCK: ", "") },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to finalize order record. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderData,
      transactionId: paymentResult.transactionId,
    });
  } catch (err: any) {
    console.error("[Checkout Route Exception]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during checkout." },
      { status: 500 }
    );
  }
}
