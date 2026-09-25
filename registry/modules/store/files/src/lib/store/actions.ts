"use server";

import { randomUUID } from "node:crypto";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { payments } from "@/lib/payments";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/url";

import { deliver } from "./delivery";
import { getProduct } from "./products";

/**
 * Where checkout returns to: the canonical site URL when configured, else the
 * origin this request came in on (previews, local ports).
 */
async function returnUrl(path: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return absoluteUrl(path);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return absoluteUrl(path);
  const protocol =
    h.get("x-forwarded-proto") ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  return `${protocol}://${host}${path}`;
}

export type BuyState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

export async function buyAction(_: BuyState, formData: FormData): Promise<BuyState> {
  const parsed = z
    .object({ slug: z.string().min(1), email: z.email("Enter a valid email address.") })
    .safeParse({
      slug: formData.get("slug"),
      email: String(formData.get("email") ?? "")
        .trim()
        .toLowerCase(),
    });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]!.message };

  const { success } = await rateLimit(`store:${await clientIp()}`, { limit: 10, window: "10 m" });
  if (!success)
    return { status: "error", message: "Too many attempts. Try again in a few minutes." };

  const product = getProduct(parsed.data.slug);
  if (!product) return { status: "error", message: "That product isn't available." };

  if (product.price === 0) {
    // Emailing the link doubles as proof the address is real.
    await deliver(product, `free-${randomUUID()}`, parsed.data.email);
    return { status: "sent", email: parsed.data.email };
  }

  const checkout = await payments.createCheckout({
    mode: "payment",
    inlinePrice: {
      name: product.name,
      amount: product.price,
      currency: product.currency,
      description: product.tagline,
    },
    customerEmail: parsed.data.email,
    successUrl: await returnUrl("/store/thanks?session={CHECKOUT_SESSION_ID}"),
    cancelUrl: await returnUrl(`/store/${product.slug}`),
    metadata: { kind: "store", product: product.slug },
    allowPromotionCodes: true,
  });
  redirect(checkout.url);
}
