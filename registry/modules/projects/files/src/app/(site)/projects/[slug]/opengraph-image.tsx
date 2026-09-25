import { projects, projectsConfig } from "@/lib/projects/projects";
import { ogSize, renderOgImage } from "@/lib/seo/og-image";

export const size = ogSize;
export const contentType = "image/png";
export const generateStaticParams = projects.params;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = await projects.get((await params).slug);
  return renderOgImage({
    eyebrow: project ? `${projectsConfig.title} · ${project.data.year}` : projectsConfig.title,
    title: project?.data.title ?? projectsConfig.title,
    description: project?.data.summary,
  });
}
