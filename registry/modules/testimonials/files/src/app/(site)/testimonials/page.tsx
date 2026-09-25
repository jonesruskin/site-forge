import { z } from "zod";

import { PageHeader } from "@/components/sections/page-header";
import { Testimonials } from "@/components/sections/testimonials";
import { createMetadata } from "@/lib/metadata";
import { getTestimonials } from "@/lib/testimonials";
import siteConfig from "@/site.config";

const config = z
  .object({ title: z.string().default("Testimonials"), description: z.string().default("") })
  .parse((siteConfig as { testimonials?: unknown }).testimonials ?? {});

export const metadata = createMetadata({
  title: config.title,
  description: config.description,
  path: "/testimonials",
});

export default async function TestimonialsPage() {
  const [featured] = await getTestimonials({ featured: true, limit: 1 });
  const all = await getTestimonials();
  return (
    <>
      <PageHeader title={config.title} description={config.description} align="center" />
      <Testimonials
        className="pt-0 sm:pt-0"
        featured={featured}
        testimonials={all.filter((t) => t !== featured && t.quote !== featured?.quote)}
      />
    </>
  );
}
