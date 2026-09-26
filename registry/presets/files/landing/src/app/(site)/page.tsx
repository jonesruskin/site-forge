import {
  GaugeIcon,
  HeartHandshakeIcon,
  LeafIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { BentoGrid } from "@/components/sections/bento-grid";
import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { FeatureRows } from "@/components/sections/feature-rows";
import { HeroSplit } from "@/components/sections/hero-split";
import { NewsletterBand } from "@/components/sections/newsletter-band";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";
import { getFaqs } from "@/lib/faq";
import { getTestimonials } from "@/lib/testimonials";
import siteConfig from "@/site.config";

/*
 * A one-page site. Order follows how people decide: what is it → why care →
 * proof → doubts answered → act. Rewrite the copy; keep the order.
 */

const visual = (label: string, className = "aspect-[4/3]") => (
  <div
    role="img"
    aria-label={label}
    className={`bg-muted text-muted-foreground flex items-center justify-center rounded-xl border text-sm ${className}`}
  >
    {label}
  </div>
);

export default async function HomePage() {
  const [testimonials, faqs] = await Promise.all([getTestimonials(), getFaqs()]);
  const [featured, ...others] = testimonials;

  return (
    <>
      <HeroSplit
        eyebrow={siteConfig.name}
        title={siteConfig.description}
        description="The one sentence a friend would use to recommend you. Put the most important benefit first."
        actions={[
          { label: "Get in touch", href: "/contact" },
          { label: "How it works", href: "#how-it-works", variant: "outline" },
        ]}
        media={visual("Hero image or product shot")}
      />
      <BentoGrid
        eyebrow="Benefits"
        title="Why people choose us"
        items={[
          {
            size: "lg",
            title: "Your biggest benefit",
            description: "Give it the most space and a real image.",
            media: visual("Feature visual", "absolute inset-0 rounded-none border-0"),
          },
          { title: "Fast", description: "How quickly it works for them.", icon: <GaugeIcon /> },
          { title: "Kind", description: "How it feels to use.", icon: <HeartHandshakeIcon /> },
          {
            size: "wide",
            inverted: true,
            title: "The thing only you do",
            description: "Your unfair advantage, stated plainly.",
            icon: <SparklesIcon />,
          },
          {
            title: "Trustworthy",
            description: "Guarantees, certifications, policies.",
            icon: <ShieldCheckIcon />,
          },
          { title: "Sustainable", description: "Values your customers share.", icon: <LeafIcon /> },
        ]}
      />
      <div id="how-it-works">
        <FeatureRows
          tone="muted"
          rows={[
            {
              eyebrow: "Step 1",
              title: "Start with the first step",
              description: "What someone does first, and how little effort it takes.",
              media: visual("Step one"),
            },
            {
              eyebrow: "Step 2",
              title: "Then what happens",
              description: "The moment they see results. Be specific about time and outcome.",
              media: visual("Step two"),
            },
          ]}
        />
      </div>
      <Stats
        variant="row"
        stats={[
          { value: "10k+", label: "people served" },
          { value: "4.9/5", label: "average rating" },
          { value: "24h", label: "response time" },
        ]}
      />
      {featured && (
        <Testimonials
          title="What people say"
          featured={featured}
          testimonials={others.slice(0, 4)}
        />
      )}
      {faqs.length > 0 && <Faq title="Questions" items={faqs.slice(0, 6)} tone="muted" />}
      <NewsletterBand
        title="Get the occasional update"
        description="News and launches, a few times a year. No spam."
        form={<NewsletterForm />}
      />
      <CtaBand
        title="Ready when you are"
        description="Tell us what you need; we'll reply within a day."
        actions={[{ label: "Contact us", href: "/contact" }]}
      />
    </>
  );
}
