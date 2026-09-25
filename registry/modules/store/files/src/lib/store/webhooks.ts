import "server-only";

import type { PaymentEvent } from "@/lib/payments";

import { deliver } from "./delivery";
import { getProduct } from "./products";

/** Sends the download link when a store checkout is paid. Ignores everything else. */
export async function storeWebhookHandler(event: PaymentEvent) {
  if (event.type !== "checkout.completed") return;
  const { checkout } = event;
  if (checkout.metadata.kind !== "store" || !checkout.paid) return;
  const product = getProduct(checkout.metadata.product ?? "");
  if (!product) {
    console.error(
      `[store] paid checkout ${checkout.id} for unknown product "${checkout.metadata.product}"`,
    );
    return;
  }
  if (!checkout.customerEmail) {
    console.error(
      `[store] paid checkout ${checkout.id} has no email; the thank-you page still offers the download`,
    );
    return;
  }
  await deliver(product, checkout.id, checkout.customerEmail);
}
