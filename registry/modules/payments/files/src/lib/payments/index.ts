import "server-only";

import { paymentsEnv } from "@/env/payments";

import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

/** True when no provider keys are configured and the local mock is in use. */
export const isMockPayments = !paymentsEnv.STRIPE_SECRET_KEY;

/**
 * The active payment provider. Add another adapter (Lemon Squeezy, Paddle,
 * Razorpay …) implementing PaymentProvider and select it here.
 */
export const payments: PaymentProvider = isMockPayments ? mockProvider : stripeProvider;

export type * from "./types";
