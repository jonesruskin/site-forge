import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Faq } from "@/components/sections/faq";
import { HeroSplit } from "@/components/sections/hero-split";
import { NewsletterBand } from "@/components/sections/newsletter-band";
import { ProductCard } from "@/components/store/product-card";
import { getFaqs } from "@/lib/faq";
import { getProducts, storeConfig } from "@/lib/store/products";
import siteConfig from "@/site.config";

/*
 * Store home: who's behind it, what's for sale, answers to the usual doubts.
 * Products are in src/content/products.ts; files in private/downloads.
 */
export default async function HomePage() {
  const products = getProducts();
  const faqs = await getFaqs();
  const [hero] = products;

  return (
    <>
      <HeroSplit
        eyebrow={siteConfig.name}
        title={siteConfig.description}
        description="Tell buyers who makes these and why they're worth it. Specifics sell: hours saved, projects built, people helped."
        actions={[
          {
            label: hero ? `Get ${hero.name}` : "Browse the store",
            href: hero ? `/store/${hero.slug}` : "/store",
          },
          { label: "All products", href: "/store", variant: "outline" },
        ]}
        media={
          <div
            role="img"
            aria-label="Product preview"
            className="bg-muted text-display text-muted-foreground flex aspect-[4/3] items-center justify-center rounded-xl border px-8 text-center"
          >
            {hero?.name ?? storeConfig.title}
          </div>
        }
      />
      <section aria-labelledby="products-heading" className="container-page py-16">
        <h2 id="products-heading" className="text-heading mb-10">
          {storeConfig.title}
        </h2>
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>
      {faqs.length > 0 && (
        <Faq title="Before you buy" items={faqs.slice(0, 5)} layout="split" tone="muted" />
      )}
      <NewsletterBand
        title="Hear about new releases"
        description="An email when something new is out. That's it."
        form={<NewsletterForm />}
      />
    </>
  );
}
