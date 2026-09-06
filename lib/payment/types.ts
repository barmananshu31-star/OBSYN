export interface PaymentOrderDetails {
  amount: number; // In main currency units, e.g. 185.00
  currency: string; // e.g. 'USD'
  orderNumber: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  rawResponse?: any;
}

export interface PaymentAdapter {
  providerName: string;
  createPaymentIntent(details: PaymentOrderDetails): Promise<{ clientSecret?: string; orderId?: string }>;
  processPayment(details: PaymentOrderDetails, paymentPayload?: any): Promise<PaymentResult>;
  verifyPayment(payload: any): Promise<boolean>;
}
