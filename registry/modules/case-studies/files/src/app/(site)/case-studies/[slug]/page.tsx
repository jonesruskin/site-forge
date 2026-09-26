import Image from "next/image";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/sections/page-header";
import { Stats } from "@/components/sections/stats";
import { Prose } from "@/components/ui/prose";
import { caseStudies, caseStudiesConfig } from "@/lib/case-studies/case-studies";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { articleJsonLd, JsonLd } from "@/lib/seo/json-ld";

export const generateStaticParams = caseStudies.params;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const study = await caseStudies.get((await params).slug);
  if (!study) return {};
  const path = `/case-studies/${study.slug}`;
  return createMetadata({
    title: study.data.title,
    description: study.data.summary,
    path,
    type: "article",
    image: study.data.image ?? false,
  });
}

export default async function CaseStudyPage({ params }: Props) {
  const study = await caseStudies.get((await params).slug);
  if (!study) notFound();
  const path = `/case-studies/${study.slug}`;

  return (
    <article>
      <JsonLd
        data={articleJsonLd({
          title: study.data.title,
          description: study.data.summary,
          path,
          publishedAt: study.data.date,
          image: study.data.image,
        })}
      />
      <PageHeader
        breadcrumbs={[
          { label: caseStudiesConfig.title, href: "/case-studies" },
          { label: study.data.client },
        ]}
        eyebrow={study.data.client}
        title={study.data.title}
        description={study.data.summary}
      >
        <dl className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {study.data.industry && (
            <div className="flex gap-2">
              <dt>Industry</dt>
              <dd className="text-foreground">{study.data.industry}</dd>
            </div>
          )}
          {study.data.services.length > 0 && (
            <div className="flex gap-2">
              <dt>Services</dt>
              <dd className="text-foreground">{study.data.services.join(", ")}</dd>
            </div>
          )}
        </dl>
      </PageHeader>
      {study.data.image && (
        <div className="container-page">
          <div className="bg-muted relative aspect-[21/9] overflow-hidden rounded-xl border">
            <Image
              src={study.data.image}
              alt={study.data.imageAlt ?? ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
      {study.data.results.length > 0 && <Stats stats={study.data.results} variant="grid" />}
      <div className="container-page pb-24">
        <Prose className="mx-auto">
          <Mdx source={study.body} />
        </Prose>
      </div>
    </article>
  );
}
