import { ProductCard } from "@/components/store/product-card";
import { PageHeader } from "@/components/sections/page-header";
import { createMetadata } from "@/lib/metadata";
import { getProducts, storeConfig } from "@/lib/store/products";

export const metadata = createMetadata({
  title: storeConfig.title,
  description: storeConfig.description,
  path: "/store",
});

export default function StorePage() {
  const products = getProducts();
  return (
    <>
      <PageHeader title={storeConfig.title} description={storeConfig.description} />
      <ul className="container-page grid gap-x-6 gap-y-12 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}
