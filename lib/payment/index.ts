import { PaymentAdapter } from "./types";
import { MockPaymentAdapter } from "./mock";
import { StripePaymentAdapter } from "./stripe";
import { RazorpayPaymentAdapter } from "./razorpay";

export * from "./types";

/**
 * Returns the configured payment adapter instance based on PAYMENT_PROVIDER env var.
 * Defaults to MockPaymentAdapter if 'test' or unspecified.
 */
export function getPaymentAdapter(): PaymentAdapter {
  const provider = (process.env.PAYMENT_PROVIDER || "test").toLowerCase();

  switch (provider) {
    case "stripe":
      return new StripePaymentAdapter();
    case "razorpay":
      return new RazorpayPaymentAdapter();
    case "test":
    default:
      return new MockPaymentAdapter();
  }
}
