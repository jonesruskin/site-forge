import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/sections/page-header";
import { Badge } from "@/components/ui/badge";
import { Prose } from "@/components/ui/prose";
import { Mdx } from "@/lib/mdx/render";
import { createMetadata } from "@/lib/metadata";
import { neighbours, projects, projectsConfig, tagSlug } from "@/lib/projects/projects";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/url";

export const generateStaticParams = projects.params;

type Props = { params: Promise<{ slug: string }> };

const STATUS: Record<string, string> = {
  shipped: "Shipped",
  maintained: "Maintained",
  "in-progress": "In progress",
  archived: "Archived",
};

export async function generateMetadata({ params }: Props) {
  const project = await projects.get((await params).slug);
  if (!project) return {};
  return createMetadata({
    title: project.data.title,
    description: project.data.summary,
    path: `/projects/${project.slug}`,
    image: project.data.cover?.src ?? false,
  });
}

export default async function ProjectPage({ params }: Props) {
  const project = await projects.get((await params).slug);
  if (!project) notFound();
  const { data } = project;
  const { previous, next } = await neighbours(project.slug);

  const facts = [
    { label: "Year", value: String(data.year) },
    data.role && { label: "Role", value: data.role },
    data.client && { label: "Client", value: data.client },
    data.stack.length > 0 && { label: "Stack", value: data.stack.join(", ") },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  const links = [
    data.links.live && { label: "Visit site", href: data.links.live },
    data.links.source && { label: "Source", href: data.links.source },
    data.links.writeup && { label: "Write-up", href: data.links.writeup },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <article>
      <JsonLd
        data={{
          "@type": "CreativeWork",
          name: data.title,
          description: data.summary,
          dateCreated: String(data.year),
          url: absoluteUrl(`/projects/${project.slug}`),
          ...(data.cover && { image: absoluteUrl(data.cover.src) }),
          keywords: [...data.tags, ...data.stack].join(", "),
        }}
      />
      <PageHeader
        breadcrumbs={[{ label: projectsConfig.title, href: "/projects" }, { label: data.title }]}
        title={data.title}
        description={data.summary}
      >
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:flex sm:flex-wrap">
            {facts.map((fact) => (
              <div key={fact.label} className="grid gap-0.5">
                <dt className="text-muted-foreground text-xs">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            {data.status && (
              <div className="grid gap-0.5">
                <dt className="text-muted-foreground text-xs">Status</dt>
                <dd>
                  <Badge variant={data.status === "archived" ? "outline" : "secondary"}>
                    {STATUS[data.status]}
                  </Badge>
                </dd>
              </div>
            )}
          </dl>
          {(links.length > 0 || data.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("/") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                >
                  {link.label}
                  <ArrowUpRightIcon aria-hidden className="size-3.5" />
                </a>
              ))}
              {data.tags.map((tag) => (
                <Link key={tag} href={`/projects/tags/${tagSlug(tag)}`}>
                  <Badge variant="outline" className="hover:bg-accent">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageHeader>

      {data.cover && (
        <div className="container-page">
          <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-xl border">
            <Image
              src={data.cover.src}
              alt={data.cover.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-page py-16">
        <Prose className="mx-auto">
          <Mdx source={project.body} />
        </Prose>
      </div>

      {data.gallery.length > 0 && (
        <section aria-label="Gallery" className="container-page pb-16">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {data.gallery.map((image) => (
              <li key={image.src} className="w-[80%] shrink-0 snap-start sm:w-[45%]">
                <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg border">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 45vw, 80vw"
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(previous || next) && (
        <nav
          aria-label="More projects"
          className="container-page grid gap-4 border-t py-10 sm:grid-cols-2"
        >
          {previous && (
            <Link
              href={`/projects/${previous.slug}`}
              className="group hover:bg-accent flex flex-col gap-1 rounded-lg p-4"
            >
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <ArrowLeftIcon
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />{" "}
                Previous
              </span>
              <span className="font-medium">{previous.data.title}</span>
            </Link>
          )}
          {next && (
            <Link
              href={`/projects/${next.slug}`}
              className="group hover:bg-accent flex flex-col items-end gap-1 rounded-lg p-4 text-right sm:col-start-2"
            >
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                Next{" "}
                <ArrowRightIcon
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
              <span className="font-medium">{next.data.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
