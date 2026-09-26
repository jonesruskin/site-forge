import "server-only";

import { paymentWebhookHandlers } from "@/generated/payment-webhooks";

import type { PaymentEvent } from "./types";

/** Runs every installed handler (billing, store …) for an event, in order. */
export async function dispatchPaymentEvent(event: PaymentEvent) {
  for (const handler of paymentWebhookHandlers) await handler(event);
}
