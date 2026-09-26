import { TagFilter } from "@/components/projects/tag-filter";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectGrid } from "@/components/sections/project-grid";
import { createMetadata } from "@/lib/metadata";
import { projects, projectsConfig, projectTags, toCard } from "@/lib/projects/projects";

export const metadata = createMetadata({
  title: projectsConfig.title,
  description: projectsConfig.description,
  path: "/projects",
});

export default async function ProjectsPage() {
  const [all, tags] = await Promise.all([projects.all(), projectTags()]);
  return (
    <>
      <PageHeader title={projectsConfig.title} description={projectsConfig.description} />
      <TagFilter tags={tags} />
      <ProjectGrid
        className="pt-0 sm:pt-0"
        headingLevel="h2"
        projects={all.map(toCard)}
        empty={<p className="text-muted-foreground">No projects yet.</p>}
      />
    </>
  );
}
