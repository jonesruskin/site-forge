import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { BentoGrid } from "@/components/sections/bento-grid";
import { BlogList } from "@/components/sections/blog-list";
import { ContactSection } from "@/components/sections/contact-section";
import { CtaBand } from "@/components/sections/cta-band";
import { EmptyState } from "@/components/sections/empty-state";
import { Faq } from "@/components/sections/faq";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { FeatureRows } from "@/components/sections/feature-rows";
import { FooterColumns } from "@/components/sections/footer-columns";
import { FooterMinimal } from "@/components/sections/footer-minimal";
import { HeroCentered } from "@/components/sections/hero-centered";
import { HeroMedia } from "@/components/sections/hero-media";
import { HeroSplit } from "@/components/sections/hero-split";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { NavbarCentered } from "@/components/sections/navbar-centered";
import { NavbarFloating } from "@/components/sections/navbar-floating";
import { NavbarSimple } from "@/components/sections/navbar-simple";
import { NewsletterBand } from "@/components/sections/newsletter-band";
import { PageHeader } from "@/components/sections/page-header";
import { PricingTable } from "@/components/sections/pricing-table";
import { ProjectGrid } from "@/components/sections/project-grid";
import { Stats } from "@/components/sections/stats";
import { Team } from "@/components/sections/team";
import { Testimonials } from "@/components/sections/testimonials";
import { Timeline } from "@/components/sections/timeline";
import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  art,
  bento,
  contactDetails,
  faqs,
  features,
  logos,
  plans,
  posts,
  projects,
  rows,
  stats,
  team,
  testimonials,
  timeline,
} from "@/demo/content";

export const metadata: Metadata = { title: "Sections" };

const navLinks = [
  { label: "Product", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Customers", href: "#" },
  { label: "Blog", href: "#" },
];

function Demo({ name, title, children }: { name: string; title: string; children: ReactNode }) {
  return (
    <section id={name} aria-label={title} className="scroll-mt-20 border-b">
      <div className="bg-muted/60 border-b">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
          <span className="font-medium">{title}</span>
          <code className="text-muted-foreground font-mono">pnpm site add section:{name}</code>
        </div>
      </div>
      <div className="isolate [transform:translateZ(0)]">{children}</div>
    </section>
  );
}

const DemoNewsletterForm = (
  <form className="flex flex-col gap-2 sm:flex-row" action="#">
    <label htmlFor="demo-newsletter" className="sr-only">
      Email
    </label>
    <Input id="demo-newsletter" type="email" placeholder="you@example.com" className="sm:flex-1" />
    <Button type="submit">Subscribe</Button>
  </form>
);

const index = [
  ["navbar-simple", "Navbar: simple"],
  ["navbar-centered", "Navbar: centered"],
  ["navbar-floating", "Navbar: floating"],
  ["hero-centered", "Hero: centered"],
  ["hero-split", "Hero: split"],
  ["hero-media", "Hero: full-bleed media"],
  ["page-header", "Page header"],
  ["logo-cloud", "Logo cloud"],
  ["feature-grid", "Feature grid"],
  ["feature-rows", "Feature rows"],
  ["bento-grid", "Bento grid"],
  ["stats", "Stats"],
  ["testimonials", "Testimonials"],
  ["pricing-table", "Pricing table"],
  ["faq", "FAQ"],
  ["team", "Team"],
  ["timeline", "Timeline"],
  ["blog-list", "Blog list"],
  ["project-grid", "Project grid"],
  ["contact-section", "Contact section"],
  ["newsletter-band", "Newsletter band"],
  ["cta-band", "CTA band"],
  ["empty-state", "Empty state"],
  ["footer-columns", "Footer: columns"],
  ["footer-minimal", "Footer: minimal"],
] as const;

export default function SectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Registry"
        title="Sections"
        description="Every section with demo props. Content comes only from props and styling only from tokens. Try another theme in the lab and come back."
        actions={[
          { label: "Theme lab", href: "/lab" },
          { label: "Dashboard shell", href: "/demo/dashboard", variant: "outline" },
          { label: "Auth screen", href: "/demo/auth", variant: "outline" },
        ]}
        bordered
      >
        <nav aria-label="Sections index">
          <ul className="flex flex-wrap gap-2 pt-2">
            {index.map(([id, label]) => (
              <li key={id}>
                <Link href={`#${id}`} className="bg-muted hover:bg-accent rounded-full px-3 py-1 text-xs transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Demo name="navbar-simple" title="Navbar: simple">
        <NavbarSimple logo="Tidewater" links={navLinks} actions={[{ label: "Sign in", href: "#", variant: "ghost" }, { label: "Start free", href: "#" }]} sticky={false} />
      </Demo>
      <Demo name="navbar-centered" title="Navbar: centered">
        <NavbarCentered logo="Tidewater" links={navLinks} actions={[{ label: "Book a demo", href: "#" }]} sticky={false} />
      </Demo>
      <Demo name="navbar-floating" title="Navbar: floating">
        <div className="py-6">
          <NavbarFloating logo="Tidewater" links={navLinks} actions={[{ label: "Start free", href: "#" }]} className="relative top-0" />
        </div>
      </Demo>
      <Demo name="hero-centered" title="Hero: centered">
        <HeroCentered badge="New · Rooms and equipment" title="Scheduling that keeps small clinics full" description="Book the gaps, remind the forgetful, and get out of the way." actions={[{ label: "Start free trial", href: "#" }, { label: "Watch the tour", href: "#" }]} note="30 days free. No card." />
      </Demo>
      <Demo name="hero-split" title="Hero: split">
        <HeroSplit eyebrow="For clinics" title="Your calendar, minus the phone calls" description="Patients book, reschedule and fill out intake forms without calling the front desk." actions={[{ label: "Get started", href: "#" }]} image={art(2, "Booking screen")} />
      </Demo>
      <Demo name="hero-media" title="Hero: full-bleed media">
        <HeroMedia eyebrow="Field notes" title="A year of quieter Mondays" description="What 1,200 clinics taught us about empty chairs." actions={[{ label: "Read the report", href: "#" }]} image={{ src: "/demo/wide.svg", alt: "" }} />
      </Demo>
      <Demo name="page-header" title="Page header">
        <PageHeader breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "#" }, { label: "Reminders" }]} eyebrow="Research" title="Why reminders sent at 6pm work better" description="We looked at two million reminders. Timing mattered more than wording." />
      </Demo>
      <Demo name="logo-cloud" title="Logo cloud">
        <LogoCloud title="Trusted by clinics that hate empty chairs" logos={logos} />
      </Demo>
      <Demo name="feature-grid" title="Feature grid">
        <FeatureGrid eyebrow="Features" title="Everything the front desk needs" features={features} variant="cards" />
      </Demo>
      <Demo name="feature-rows" title="Feature rows">
        <FeatureRows rows={rows} />
      </Demo>
      <Demo name="bento-grid" title="Bento grid">
        <BentoGrid eyebrow="Product" title="Built for the busiest desk in the building" items={bento} />
      </Demo>
      <Demo name="stats" title="Stats">
        <Stats title="Numbers we're proud of" stats={stats} />
      </Demo>
      <Demo name="testimonials" title="Testimonials">
        <Testimonials title="Quieter Mondays" testimonials={testimonials} />
      </Demo>
      <Demo name="pricing-table" title="Pricing table">
        <PricingTable title="Simple plans" plans={plans} labels={{ yearlyHint: "2 months free" }} />
      </Demo>
      <Demo name="faq" title="FAQ">
        <Faq title="Questions" items={faqs} />
      </Demo>
      <Demo name="team" title="Team">
        <Team eyebrow="Team" title="Twelve people, one calendar" members={team} />
      </Demo>
      <Demo name="timeline" title="Timeline">
        <Timeline title="How we got here" entries={timeline} />
      </Demo>
      <Demo name="blog-list" title="Blog list">
        <BlogList title="From the blog" posts={posts} />
        <BlogList posts={posts} layout="list" />
      </Demo>
      <Demo name="project-grid" title="Project grid">
        <ProjectGrid title="Selected work" projects={projects} />
      </Demo>
      <Demo name="contact-section" title="Contact section">
        <ContactSection eyebrow="Contact" title="Talk to a human" description="We reply within one working day." details={contactDetails} form={<ContactForm />} />
      </Demo>
      <Demo name="newsletter-band" title="Newsletter band">
        <NewsletterBand title="The Tidewater letter" description="One email a month about running a calmer clinic." form={DemoNewsletterForm} note="No spam. Unsubscribe in one click." />
      </Demo>
      <Demo name="cta-band" title="CTA band">
        <CtaBand title="Try Tidewater free for 30 days" description="Import your calendar in minutes." actions={[{ label: "Start free trial", href: "#" }]} />
        <CtaBand variant="plain" align="start" title="Still deciding?" description="Book a 15-minute call." actions={[{ label: "Book a call", href: "#" }]} />
      </Demo>
      <Demo name="empty-state" title="Empty state">
        <div className="container-page py-12">
          <EmptyState title="No patients yet" description="Import a CSV or share your booking page to get the first ones in." actions={[{ label: "Import patients", href: "#" }, { label: "Copy booking link", href: "#" }]} />
        </div>
      </Demo>
      <Demo name="footer-columns" title="Footer: columns">
        <FooterColumns
          logo="Tidewater"
          tagline="Scheduling for small clinics. Made in Bristol."
          groups={[
            { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
            { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Contact", href: "#" }] },
            { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Status", href: "#" }] },
          ]}
          legal={[{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }]}
          socials={[{ platform: "github", href: "https://github.com" }]}
          copyright="© 2026 Tidewater Ltd."
        />
      </Demo>
      <Demo name="footer-minimal" title="Footer: minimal">
        <FooterMinimal copyright="© 2026 Tidewater" links={[{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }]} />
      </Demo>
    </>
  );
}
