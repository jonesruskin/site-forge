import { CompassIcon, MailIcon, PenToolIcon, RocketIcon, TrendingUpIcon } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { ContactSection } from "@/components/sections/contact-section";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { HeroSplit } from "@/components/sections/hero-split";
import { ProjectGrid } from "@/components/sections/project-grid";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";
import { Timeline } from "@/components/sections/timeline";
import { contactEnv } from "@/env/contact";
import { caseStudies } from "@/lib/case-studies/case-studies";
import { getTestimonials } from "@/lib/testimonials";
import siteConfig from "@/site.config";

/*
 * Agency home: what you do, proof you've done it, how you work, and a direct
 * line in. Case studies come from content/case-studies, quotes from
 * content/testimonials.json. Rewrite the services and process for your studio.
 */
export default async function HomePage() {
  const [studies, testimonials] = await Promise.all([caseStudies.all(), getTestimonials()]);
  const [featured, ...others] = testimonials;

  return (
    <>
      <HeroSplit
        eyebrow={siteConfig.name}
        title={siteConfig.description}
        description="Who you help, what changes for them, and why you're the studio to do it."
        actions={[
          { label: "Start a project", href: "#contact" },
          { label: "See our work", href: "/case-studies", variant: "outline" },
        ]}
        media={
          <div
            role="img"
            aria-label="Studio showreel still"
            className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center rounded-xl border text-sm"
          >
            Showreel or signature project
          </div>
        }
      />
      <FeatureGrid
        eyebrow="Services"
        title="What we do"
        columns={4}
        variant="cards"
        features={[
          {
            icon: <CompassIcon />,
            title: "Strategy",
            description: "Research, positioning and a plan everyone can repeat.",
          },
          {
            icon: <PenToolIcon />,
            title: "Design",
            description: "Brand, product and web design that ships.",
          },
          {
            icon: <RocketIcon />,
            title: "Build",
            description: "Fast, accessible sites and apps, handed over cleanly.",
          },
          {
            icon: <TrendingUpIcon />,
            title: "Grow",
            description: "Measure, learn and improve after launch.",
          },
        ]}
      />
      <ProjectGrid
        eyebrow="Selected work"
        title="Recent case studies"
        tone="muted"
        projects={studies.slice(0, 4).map((study) => ({
          title: study.data.title,
          href: `/case-studies/${study.slug}`,
          summary: `${study.data.client}: ${study.data.summary}`,
          image: study.data.image
            ? { src: study.data.image, alt: study.data.imageAlt ?? "" }
            : undefined,
          year: new Date(study.data.date).getUTCFullYear(),
          tags: study.data.services,
          featured: study.data.featured,
        }))}
        empty={<p className="text-muted-foreground">Add case studies in content/case-studies.</p>}
      />
      <Timeline
        eyebrow="Process"
        title="How a project runs"
        entries={[
          {
            date: "Week 1",
            title: "Discover",
            description:
              "Workshops and research to agree on the problem and what success looks like.",
          },
          {
            date: "Weeks 2–4",
            title: "Design",
            description: "Concepts, prototypes and testing with real users.",
          },
          {
            date: "Weeks 5–8",
            title: "Build",
            description: "Weekly releases you can click, not status reports.",
          },
          {
            date: "After launch",
            title: "Grow",
            description: "Measure what changed and keep improving.",
          },
        ]}
      />
      <Stats
        variant="grid"
        tone="muted"
        stats={[
          { value: "40+", label: "projects shipped" },
          { value: "12", label: "years in practice" },
          { value: "90%", label: "clients come back" },
          { value: "3", label: "awards this year" },
        ]}
      />
      {featured && (
        <Testimonials
          title="Clients on working with us"
          featured={featured}
          testimonials={others.slice(0, 4)}
        />
      )}
      <div id="contact">
        <ContactSection
          eyebrow="Contact"
          title="Tell us about your project"
          description="A few lines are enough. We reply within two working days."
          details={
            siteConfig.author.email
              ? [
                  {
                    label: "Email",
                    value: siteConfig.author.email,
                    href: `mailto:${siteConfig.author.email}`,
                    icon: <MailIcon />,
                  },
                ]
              : []
          }
          form={<ContactForm turnstileSiteKey={contactEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />}
        />
      </div>
    </>
  );
}
