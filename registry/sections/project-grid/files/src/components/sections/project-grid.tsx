import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionImage, SectionTone } from "@/components/sections/kit/types";
import { cn } from "@/lib/utils";

export type ProjectCard = {
  title: string;
  href: string;
  summary?: string;
  image?: SectionImage;
  year?: string | number;
  tags?: string[];
  /** Span two columns on large screens. */
  featured?: boolean;
};

export type ProjectGridProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  projects: ProjectCard[];
  headingLevel?: "h2" | "h3";
  empty?: ReactNode;
  tone?: SectionTone;
  className?: string;
};

export function ProjectGrid({
  eyebrow,
  title,
  description,
  projects,
  headingLevel = "h3",
  empty,
  tone,
  className,
}: ProjectGridProps) {
  const Heading = headingLevel;
  return (
    <Section tone={tone} className={className}>
      <SectionHeader eyebrow={eyebrow} title={title} description={description} className="mb-12" />
      {projects.length === 0 && empty}
      <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2">
        {projects.map((project) => (
          <li key={project.href} className={cn(project.featured && "md:col-span-2")}>
            <article className="group relative flex flex-col gap-4">
              <div
                className={cn(
                  "bg-muted relative overflow-hidden rounded-xl border",
                  project.featured ? "aspect-[21/9]" : "aspect-[4/3]",
                )}
              >
                {project.image && (
                  <Image
                    src={project.image.src}
                    alt={project.image.alt}
                    fill
                    sizes={project.featured ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                    className="object-cover transition-transform duration-(--motion-slow) group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <Heading className="text-lg font-semibold">
                  <Link href={project.href} className="after:absolute after:inset-0">
                    {project.title}
                  </Link>
                </Heading>
                {project.year && (
                  <span className="text-muted-foreground font-mono text-xs">{project.year}</span>
                )}
              </div>
              {project.summary && (
                <p className="text-muted-foreground -mt-2 text-sm leading-relaxed">
                  {project.summary}
                </p>
              )}
              {project.tags && project.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li
                      key={tag}
                      className="text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
