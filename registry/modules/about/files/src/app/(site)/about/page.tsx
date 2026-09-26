import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumeSections } from "@/components/about/resume-sections";
import { PageHeader } from "@/components/sections/page-header";
import { Prose } from "@/components/ui/prose";
import { resume } from "@/content/resume";
import { aboutPages as pages } from "@/lib/about/page";
import { aboutConfig } from "@/lib/about/resume";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { JsonLd, personJsonLd } from "@/lib/seo/json-ld";
import siteConfig from "@/site.config";

export async function generateMetadata() {
  const page = await pages.get("");
  return createMetadata({
    title: page?.data.title ?? aboutConfig.title,
    description: page?.excerpt ?? resume.summary,
    path: "/about",
  });
}

export default async function AboutPage() {
  const page = await pages.get("");
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={personJsonLd({
          name: siteConfig.author.name,
          url: siteConfig.author.url ?? siteConfig.url,
          jobTitle: resume.label,
          image: aboutConfig.portrait || undefined,
        })}
      />
      <PageHeader
        eyebrow={resume.label}
        title={page.data.title}
        description={page.data.description}
      />
      <div className="container-page grid gap-12 pb-16 lg:grid-cols-[1fr_18rem] lg:gap-16">
        <Prose>
          <Mdx source={page.body} />
        </Prose>
        {aboutConfig.portrait && (
          <div className="bg-muted relative order-first aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl border lg:order-last">
            <Image
              src={aboutConfig.portrait}
              alt={aboutConfig.portraitAlt}
              fill
              priority
              sizes="18rem"
              className="object-cover"
            />
          </div>
        )}
      </div>
      <section aria-labelledby="resume-heading" className="container-page border-t py-16">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="resume-heading" className="text-heading">
            Résumé
          </h2>
          <Link
            href="/resume"
            className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Printable version <ArrowRightIcon aria-hidden className="size-3.5" />
          </Link>
        </div>
        <ResumeSections resume={resume} />
      </section>
    </>
  );
}
