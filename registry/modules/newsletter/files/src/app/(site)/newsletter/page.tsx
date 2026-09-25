import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { NewsletterBand } from "@/components/sections/newsletter-band";
import { newsletterConfig } from "@/lib/newsletter/config";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: newsletterConfig.title,
  description: newsletterConfig.description,
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div className="flex min-h-[60dvh] items-center">
      <NewsletterBand
        className="w-full"
        tone="default"
        layout="stacked"
        title={<span className="text-display block">{newsletterConfig.title}</span>}
        description={newsletterConfig.description}
        form={<NewsletterForm />}
      />
    </div>
  );
}
