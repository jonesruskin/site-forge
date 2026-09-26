import "server-only";

import { PurchaseEmail } from "@/emails/store/purchase";
import { sendEmail } from "@/lib/email/send";
import { absoluteUrl } from "@/lib/url";

import { storeConfig, type Product } from "./products";
import { createDownloadToken } from "./tokens";

/** Site-relative download path, for links on your own pages. */
export function downloadPath(product: Product, order: string) {
  return `/store/download/${createDownloadToken(product.slug, order)}`;
}

/** Absolute download URL, for emails. */
export function downloadUrl(product: Product, order: string) {
  return absoluteUrl(downloadPath(product, order));
}

/** Emails the download link. Safe to call twice for the same order (idempotency key). */
export async function deliver(product: Product, order: string, email: string) {
  await sendEmail({
    to: email,
    subject:
      product.price === 0 ? `Your copy of ${product.name}` : `Thanks for buying ${product.name}`,
    react: PurchaseEmail({
      productName: product.name,
      downloadUrl: downloadUrl(product, order),
      expiresInDays: storeConfig.downloadExpiresInDays,
      free: product.price === 0,
    }),
    idempotencyKey: `store:${order}`,
    tags: [{ name: "category", value: "store" }],
  });
}
