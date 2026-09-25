import { CheckIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { BuyForm } from "@/components/store/buy-form";
import { Price } from "@/components/store/price";
import { PageHeader } from "@/components/sections/page-header";
import { Badge } from "@/components/ui/badge";
import { createMetadata } from "@/lib/metadata";
import { isMockPayments } from "@/lib/payments";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { formatPrice, getProduct, getProducts, storeConfig } from "@/lib/store/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return createMetadata({
    title: product.name,
    description: product.tagline,
    path: `/store/${product.slug}`,
    image: product.image?.src ?? false,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const free = product.price === 0;

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.tagline,
          image: product.image?.src,
          path: `/store/${product.slug}`,
          price: product.price,
          currency: product.currency,
        })}
      />
      <PageHeader
        breadcrumbs={[{ label: storeConfig.title, href: "/store" }, { label: product.name }]}
        title={product.name}
        description={product.tagline}
      />
      <div className="container-page grid gap-12 pb-24 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="grid content-start gap-8">
          <div className="bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border">
            {product.image ? (
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <span aria-hidden className="text-display text-muted-foreground px-8 text-center">
                {product.name}
              </span>
            )}
          </div>
          {product.description && (
            <div className="grid max-w-prose gap-4">
              {product.description.split(/\n{2,}/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-card grid gap-6 rounded-xl border p-6">
            <div className="flex items-baseline justify-between gap-4">
              <Price product={product} className="text-4xl font-semibold tracking-tight" />
              {product.badge && <Badge>{product.badge}</Badge>}
            </div>
            {product.format && (
              <p className="text-muted-foreground -mt-3 text-sm">{product.format}</p>
            )}
            {product.features && product.features.length > 0 && (
              <ul className="grid gap-2 text-sm">
                {product.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckIcon aria-hidden className="text-success mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <BuyForm
              slug={product.slug}
              free={free}
              label={free ? "Email me the download" : `Buy for ${formatPrice(product)}`}
            />
            {!free && (
              <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <LockIcon aria-hidden className="size-3.5" />
                {isMockPayments
                  ? "Test mode: no real payment is taken."
                  : "Secure checkout. Instant download after payment."}
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
