import { PaymentAdapter, PaymentOrderDetails, PaymentResult } from "./types";

/**
 * Stripe Payment Adapter
 * Modular adapter scaffolded for seamless integration with Stripe SDK.
 * Set PAYMENT_PROVIDER=stripe and define PAYMENT_SECRET_KEY=sk_live_...
 */
export class StripePaymentAdapter implements PaymentAdapter {
  providerName = "stripe";

  async createPaymentIntent(details: PaymentOrderDetails) {
    const secretKey = process.env.PAYMENT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe secret key missing from PAYMENT_SECRET_KEY");
    }

    // TODO: When connecting live Stripe:
    // const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(details.amount * 100),
    //   currency: details.currency.toLowerCase(),
    //   metadata: { orderNumber: details.orderNumber, email: details.customerEmail }
    // });
    // return { clientSecret: paymentIntent.client_secret, orderId: paymentIntent.id };

    return {
      clientSecret: `pi_mock_stripe_${Date.now()}_secret`,
      orderId: `pi_mock_stripe_${Date.now()}`,
    };
  }

  async processPayment(details: PaymentOrderDetails, paymentPayload?: any): Promise<PaymentResult> {
    // TODO: Confirm PaymentIntent with token/card payload or handle webhook confirmation
    return {
      success: true,
      transactionId: `ch_stripe_${Date.now()}`,
      rawResponse: { provider: "stripe", mode: "scaffolded" },
    };
  }

  async verifyPayment(payload: any): Promise<boolean> {
    // TODO: Verify Stripe Webhook Signature via stripe.webhooks.constructEvent
    return true;
  }
}
