import { PaymentAdapter, PaymentOrderDetails, PaymentResult } from "./types";

/**
 * Razorpay Payment Adapter
 * Modular adapter scaffolded for integration with Razorpay Orders & Checkout SDK.
 * Set PAYMENT_PROVIDER=razorpay and define PAYMENT_PUBLIC_KEY & PAYMENT_SECRET_KEY
 */
export class RazorpayPaymentAdapter implements PaymentAdapter {
  providerName = "razorpay";

  async createPaymentIntent(details: PaymentOrderDetails) {
    const keyId = process.env.PAYMENT_PUBLIC_KEY;
    const keySecret = process.env.PAYMENT_SECRET_KEY;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials missing from environment variables");
    }

    // TODO: When connecting live Razorpay:
    // const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    // const order = await instance.orders.create({
    //   amount: Math.round(details.amount * 100),
    //   currency: details.currency,
    //   receipt: details.orderNumber,
    // });
    // return { orderId: order.id };

    return {
      orderId: `order_rzp_${Date.now()}`,
    };
  }

  async processPayment(details: PaymentOrderDetails, paymentPayload?: any): Promise<PaymentResult> {
    // TODO: Verify razorpay_order_id, razorpay_payment_id, razorpay_signature
    return {
      success: true,
      transactionId: paymentPayload?.razorpay_payment_id || `pay_rzp_${Date.now()}`,
      rawResponse: { provider: "razorpay", mode: "scaffolded" },
    };
  }

  async verifyPayment(payload: any): Promise<boolean> {
    // TODO: Verify HMAC SHA256 signature using keySecret
    return true;
  }
}
