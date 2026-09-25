import type { MetadataRoute } from "next";
import { z } from "zod";

import { products } from "@/content/products";
import { absoluteUrl } from "@/lib/url";
import siteConfig from "@/site.config";

export type Product = {
  /** URL slug. Not "thanks" or "download" (reserved routes). */
  slug: string;
  name: string;
  tagline: string;
  /** Plain text; blank lines separate paragraphs. */
  description?: string;
  /** Major units: 19 = $19. 0 = free (delivered by email, no checkout). */
  price: number;
  /** ISO currency code, e.g. "usd", "eur". */
  currency: string;
  image?: { src: string; alt: string };
  /** e.g. "PDF · 80 pages". */
  format?: string;
  features?: string[];
  badge?: string;
  /** File name inside private/downloads/. */
  file?: string;
  /** Or an external URL to redirect to (a hosted file, a Notion template …). */
  url?: string;
};

const RESERVED = new Set(["thanks", "download"]);

export const storeConfig = z
  .object({
    title: z.string().default("Store"),
    description: z.string().default(""),
    downloadExpiresInDays: z.number().int().min(1).max(365).default(7),
  })
  .parse((siteConfig as { store?: unknown }).store ?? {});

export function getProducts() {
  for (const product of products) {
    if (RESERVED.has(product.slug)) throw new Error(`Product slug "${product.slug}" is reserved.`);
    if (!product.file && !product.url)
      throw new Error(`Product "${product.slug}" needs a file or url.`);
  }
  return products;
}

export function getProduct(slug: string) {
  return getProducts().find((product) => product.slug === slug) ?? null;
}

export function formatPrice(product: Pick<Product, "price" | "currency">) {
  if (product.price === 0) return "Free";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: product.currency.toUpperCase(),
    minimumFractionDigits: Number.isInteger(product.price) ? 0 : 2,
  }).format(product.price);
}

export async function storeSitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: absoluteUrl("/store"), changeFrequency: "weekly", priority: 0.8 },
    ...getProducts().map((product) => ({
      url: absoluteUrl(`/store/${product.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
