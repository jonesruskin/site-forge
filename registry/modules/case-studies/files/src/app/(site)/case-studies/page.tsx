import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { caseStudies, caseStudiesConfig } from "@/lib/case-studies/case-studies";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: caseStudiesConfig.title,
  description: caseStudiesConfig.description,
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const studies = await caseStudies.all();
  return (
    <>
      <PageHeader title={caseStudiesConfig.title} description={caseStudiesConfig.description} />
      <ProjectGrid
        className="pt-0 sm:pt-0"
        headingLevel="h2"
        projects={studies.map((study) => ({
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
        empty={<p className="text-muted-foreground">No case studies yet.</p>}
      />
    </>
  );
}
