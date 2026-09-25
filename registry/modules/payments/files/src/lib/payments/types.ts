/**
 * The provider contract. Billing and the store only talk to this interface, so
 * adding Lemon Squeezy, Paddle or Razorpay means writing one adapter file.
 */

export type LineItemDisplay = {
  /** Shown on mock checkout pages; real providers use their own product data. */
  name: string;
  /** Major units, e.g. 19 = $19. */
  amount: number;
  currency: string;
};

export type CreateCheckoutInput = {
  mode: "subscription" | "payment";
  /** A price reference. For Stripe this is a price lookup key (stable across test and live). */
  price: string;
  quantity?: number;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  /** Echoed back in webhook events (e.g. userId, productId). */
  metadata?: Record<string, string>;
  trialDays?: number;
  allowPromotionCodes?: boolean;
  display?: LineItemDisplay;
};

export type Checkout = {
  id: string;
  status: "open" | "complete" | "expired";
  paid: boolean;
  mode: "subscription" | "payment";
  customerId?: string;
  customerEmail?: string;
  subscriptionId?: string;
  amountTotal?: number;
  currency?: string;
  metadata: Record<string, string>;
};

export type SubscriptionStatus =
  "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete" | "paused";

export type Subscription = {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  /** The price reference used at checkout (lookup key for Stripe). */
  price: string;
  interval: "month" | "year" | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  metadata: Record<string, string>;
};

/** Normalized events. Handlers must be idempotent: providers retry deliveries. */
export type PaymentEvent =
  | { type: "checkout.completed"; id: string; checkout: Checkout }
  | { type: "subscription.updated"; id: string; subscription: Subscription }
  | { type: "subscription.deleted"; id: string; subscription: Subscription }
  | { type: "invoice.payment_failed"; id: string; customerId: string; subscriptionId?: string };

export interface PaymentProvider {
  readonly id: string;
  createCustomer(input: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string }>;
  createCheckout(input: CreateCheckoutInput): Promise<{ id: string; url: string }>;
  createPortal(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;
  getCheckout(id: string): Promise<Checkout | null>;
  /** Verifies the signature and returns a normalized event, or null for events we ignore. */
  parseWebhook(request: Request): Promise<PaymentEvent | null>;
}
