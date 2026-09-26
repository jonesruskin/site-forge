import { caseStudies, caseStudiesConfig } from "@/lib/case-studies/case-studies";
import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = caseStudies.params;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const study = await caseStudies.get((await params).slug);
  return renderOgImage({
    eyebrow: study ? `${caseStudiesConfig.title} · ${study.data.client}` : caseStudiesConfig.title,
    title: study?.data.title ?? caseStudiesConfig.title,
    description: study?.data.summary,
  });
}
