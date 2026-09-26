import type { Product } from "@/lib/store/products";

/**
 * Your catalogue. Prices are in major units (19 = $19); 0 makes a product free
 * (people get the download link by email). Files live in private/downloads/.
 */
export const products: Product[] = [
  {
    slug: "field-guide",
    name: "The Field Guide",
    tagline: "Everything I know about shipping small products, in 80 pages.",
    description:
      "A practical guide from idea to first paying customer.\n\nEach chapter ends with a checklist you can use the same day. Updates are free: your link always downloads the latest edition.",
    price: 19,
    currency: "usd",
    format: "PDF · 80 pages",
    features: ["Lifetime updates", "Checklists and templates", "DRM-free"],
    file: "field-guide.md",
    badge: "Bestseller",
  },
  {
    slug: "starter-kit",
    name: "Starter Kit",
    tagline: "The templates I start every project with. Free.",
    description: "Project brief, launch checklist and a pricing worksheet.",
    price: 0,
    currency: "usd",
    format: "3 documents",
    features: ["Editable templates", "No sign-up"],
    file: "starter-kit.md",
  },
];
