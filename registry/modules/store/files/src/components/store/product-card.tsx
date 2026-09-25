import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/store/products";

import { Price } from "./price";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex h-full flex-col gap-4">
      <div className="bg-muted relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border">
        {product.image ? (
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <span aria-hidden className="text-display text-muted-foreground px-6 text-center">
            {product.name}
          </span>
        )}
        {product.badge && <Badge className="absolute top-3 left-3">{product.badge}</Badge>}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="font-semibold">
            <Link href={`/store/${product.slug}`} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h2>
          <p className="text-muted-foreground text-sm">{product.tagline}</p>
        </div>
        <Price product={product} className="shrink-0 text-lg font-semibold" />
      </div>
    </article>
  );
}
