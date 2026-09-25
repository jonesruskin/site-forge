import { formatPrice, type Product } from "@/lib/store/products";
import { cn } from "@/lib/utils";

export function Price({
  product,
  className,
}: {
  product: Pick<Product, "price" | "currency">;
  className?: string;
}) {
  return (
    <span className={cn("font-display tabular-nums", className)}>
      {formatPrice(product)}
      {product.price > 0 && <span className="sr-only"> {product.currency.toUpperCase()}</span>}
    </span>
  );
}
