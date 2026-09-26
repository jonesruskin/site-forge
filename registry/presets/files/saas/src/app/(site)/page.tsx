import { BarChart3Icon, BellIcon, LockIcon, PlugIcon, UsersIcon, ZapIcon } from "lucide-react";

import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { FeatureRows } from "@/components/sections/feature-rows";
import { HeroCentered } from "@/components/sections/hero-centered";
import { PricingTable } from "@/components/sections/pricing-table";
import { Testimonials } from "@/components/sections/testimonials";
import { billingConfig } from "@/lib/billing/config";
import { pricingPlans } from "@/lib/billing/plans";
import { getFaqs } from "@/lib/faq";
import { getTestimonials } from "@/lib/testimonials";
import siteConfig from "@/site.config";

/*
 * SaaS home page, composed from sections. Rewrite the copy here; plans come from
 * site.config.ts → billing, questions from content/faq.json and quotes from
 * content/testimonials.json.
 */

const screenshot = (label: string) => (
  <div
    role="img"
    aria-label={label}
    className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center rounded-xl border text-sm"
  >
    {label}
  </div>
);

export default async function HomePage() {
  const [testimonials, faqs] = await Promise.all([getTestimonials(), getFaqs()]);
  const [featured, ...others] = testimonials;
  const trial = billingConfig.trialDays
    ? `${billingConfig.trialDays}-day free trial`
    : "Free to start";

  return (
    <>
      <HeroCentered
        badge={trial}
        title={siteConfig.description}
        description="Say who it's for and the outcome they get, in one or two sentences. A concrete promise beats a clever one."
        actions={[
          { label: "Get started", href: "/sign-up" },
          { label: "See pricing", href: "/pricing", variant: "outline" },
        ]}
        note="No credit card required. Cancel any time."
      />
      <FeatureGrid
        eyebrow="Why teams switch"
        title="The three to six things people buy it for"
        description="Lead with outcomes. Each card answers “what does this do for me?”"
        features={[
          {
            icon: <ZapIcon />,
            title: "Fast first win",
            description: "Describe what a new customer achieves in their first ten minutes.",
          },
          {
            icon: <UsersIcon />,
            title: "Built for teams",
            description: "Invite teammates, share workspaces and keep roles simple.",
          },
          {
            icon: <BellIcon />,
            title: "Stays out of the way",
            description: "Notifications when something needs you, silence when it doesn't.",
          },
          {
            icon: <BarChart3Icon />,
            title: "Shows the impact",
            description: "Numbers your customers can take to their own boss.",
          },
          {
            icon: <PlugIcon />,
            title: "Fits your stack",
            description: "A REST API with keys per teammate, and webhooks for everything else.",
          },
          {
            icon: <LockIcon />,
            title: "Secure by default",
            description: "Say how you protect data: encryption, regions, access controls.",
          },
        ]}
      />
      <FeatureRows
        tone="muted"
        rows={[
          {
            eyebrow: "Workflow",
            title: "Show the product doing its main job",
            description:
              "One screenshot, one sentence about the job, three bullets about why it's better than the old way.",
            bullets: [
              "A specific improvement",
              "A time or money saving",
              "Something competitors can't claim",
            ],
            media: screenshot("Product screenshot"),
          },
          {
            eyebrow: "Collaboration",
            title: "Then show how it spreads through a team",
            description:
              "Teams, roles and invitations are built in, so this story is true on day one.",
            bullets: [
              "Owner, admin and member roles",
              "Invitations by email",
              "One bill for the whole team",
            ],
            media: screenshot("Team settings screenshot"),
            actions: [{ label: "Read the blog", href: "/blog", variant: "outline" }],
          },
        ]}
      />
      {featured && (
        <Testimonials
          eyebrow="Customers"
          title="In their words"
          featured={featured}
          testimonials={others.slice(0, 4)}
        />
      )}
      <PricingTable
        eyebrow="Pricing"
        title="Simple, predictable plans"
        plans={pricingPlans()}
        locale={siteConfig.locale}
        tone="muted"
      />
      {faqs.length > 0 && <Faq title="Questions" items={faqs.slice(0, 6)} layout="split" />}
      <CtaBand
        title={`Start using ${siteConfig.name} today`}
        description="Set up in minutes. Your data stays yours."
        actions={[
          { label: "Create your account", href: "/sign-up" },
          { label: "Talk to us", href: "/contact", variant: "outline" },
        ]}
      />
    </>
  );
}
