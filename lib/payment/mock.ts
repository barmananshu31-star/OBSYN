import { PaymentAdapter, PaymentOrderDetails, PaymentResult } from "./types";

/**
 * Mock / Test Payment Adapter
 * Instantly simulates successful transaction processing for development and testing.
 */
export class MockPaymentAdapter implements PaymentAdapter {
  providerName = "test";

  async createPaymentIntent(details: PaymentOrderDetails) {
    return {
      orderId: `test_ord_${Date.now()}`,
      clientSecret: `test_sec_${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  async processPayment(details: PaymentOrderDetails, paymentPayload?: any): Promise<PaymentResult> {
    // Simulate short network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Allow test failure trigger if customer email is "fail@obsyn.com"
    if (details.customerEmail === "fail@obsyn.com") {
      return {
        success: false,
        error: "Card declined by issuing bank (simulated test decline).",
      };
    }

    const transactionId = `txn_obs_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      rawResponse: {
        status: "captured",
        amount: details.amount,
        currency: details.currency,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async verifyPayment(payload: any): Promise<boolean> {
    return true;
  }
}
