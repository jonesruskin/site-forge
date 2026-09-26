import { ContactForm } from "@/components/contact/contact-form";
import { contactEnv } from "@/env/contact";
import { contactConfig } from "@/lib/contact/config";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: contactConfig.title,
  description: contactConfig.description || `Contact ${siteConfig.name}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <header>
          <h1 className="text-display">{contactConfig.title}</h1>
          {contactConfig.description && (
            <p className="text-lead text-muted-foreground mt-6 max-w-md">
              {contactConfig.description}
            </p>
          )}
          {siteConfig.author.email && (
            <p className="text-muted-foreground mt-8 text-sm">
              Prefer email?{" "}
              <a
                href={`mailto:${siteConfig.author.email}`}
                className="text-foreground underline underline-offset-4"
              >
                {siteConfig.author.email}
              </a>
            </p>
          )}
        </header>
        <ContactForm turnstileSiteKey={contactEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      </div>
    </section>
  );
}
