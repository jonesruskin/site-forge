import { notFound } from "next/navigation";

import { TagFilter } from "@/components/projects/tag-filter";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { createMetadata } from "@/lib/metadata";
import { projects, projectsConfig, projectTags, tagSlug, toCard } from "@/lib/projects/projects";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return (await projectTags()).map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const match = (await projectTags()).find((item) => item.slug === tag);
  if (!match) return {};
  return createMetadata({
    title: `${match.tag} · ${projectsConfig.title}`,
    description: `${projectsConfig.title} tagged “${match.tag}”.`,
    path: `/projects/tags/${tag}`,
  });
}

export default async function ProjectTagPage({ params }: Props) {
  const { tag } = await params;
  const tags = await projectTags();
  const match = tags.find((item) => item.slug === tag);
  if (!match) notFound();
  const tagged = (await projects.all()).filter((project) =>
    project.data.tags.some((t) => tagSlug(t) === tag),
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: projectsConfig.title, href: "/projects" }, { label: match.tag }]}
        title={match.tag}
        description={`${tagged.length} ${tagged.length === 1 ? "project" : "projects"}`}
      />
      <TagFilter tags={tags} active={tag} />
      <ProjectGrid className="pt-0 sm:pt-0" headingLevel="h2" projects={tagged.map(toCard)} />
    </>
  );
}
