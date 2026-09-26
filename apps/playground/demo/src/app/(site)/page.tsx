import { ArrowRightIcon } from "lucide-react";

import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { FeatureRows } from "@/components/sections/feature-rows";
import { HeroCentered } from "@/components/sections/hero-centered";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { PricingTable } from "@/components/sections/pricing-table";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";
import { art, faqs, features, logos, plans, rows, stats, testimonials } from "@/demo/content";

/** A complete landing page composed only from registry sections and demo props. */
export default function PlaygroundHome() {
  return (
    <>
      <HeroCentered
        badge={
          <>
            Playground · every module and section <ArrowRightIcon aria-hidden className="size-3" />
          </>
        }
        badgeHref="/sections"
        title="Scheduling that keeps small clinics full"
        description="Tidewater books the gaps, reminds the forgetful and gets out of your way. This page is built only from site-forge sections."
        actions={[
          { label: "Browse all sections", href: "/sections" },
          { label: "Open the theme lab", href: "/lab" },
        ]}
        note="Demo content. Swap the theme in /lab and watch everything follow."
        image={art(1, "Tidewater calendar screenshot")}
      />
      <LogoCloud title="Trusted by clinics that hate empty chairs" logos={logos} />
      <FeatureGrid eyebrow="Features" title="Everything the front desk needs" description="And nothing it doesn't." features={features} />
      <FeatureRows rows={rows} tone="muted" />
      <Stats stats={stats} variant="grid" />
      <Testimonials eyebrow="Customers" title="Quieter Mondays" featured={testimonials[0]} testimonials={testimonials.slice(1)} />
      <PricingTable
        eyebrow="Pricing"
        title="Simple plans, no per-seat math"
        plans={plans}
        labels={{ yearlyHint: "2 months free" }}
        tone="muted"
      />
      <Faq title="Questions" items={faqs} layout="split" description="Can't find an answer? Write to us any time." />
      <CtaBand
        title="Try Tidewater free for 30 days"
        description="No card needed. Import your calendar in minutes."
        actions={[{ label: "Start free trial", href: "#" }, { label: "Book a demo", href: "/contact", variant: "outline" }]}
      />
    </>
  );
}
