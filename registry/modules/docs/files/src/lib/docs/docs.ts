import { z } from "zod";

import { defineCollection, type Entry } from "@/lib/mdx/collection";
import { plainText } from "@/lib/mdx/text";

export const docSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  /** Position within its group (lower first). */
  order: z.number().default(100),
  /** Shorter label for the sidebar. */
  sidebarTitle: z.string().optional(),
  draft: z.boolean().default(false),
});

export type Doc = Entry<z.output<typeof docSchema>>;

const collection = defineCollection({ directory: "docs", schema: docSchema });

/**
 * Docs are one or two levels deep (`page` or `group/page`): folders are sidebar
 * groups. Deeper files fail loudly instead of silently 404ing.
 */
export const docs = {
  ...collection,
  all: async () => {
    const all = await collection.all();
    const tooDeep = all.find((doc) => doc.slug.split("/").length > 2);
    if (tooDeep)
      throw new Error(
        `${tooDeep.file}: docs support one folder level (content/docs/<group>/<page>.mdx).`,
      );
    return all;
  },
};

/** Static params for pages at a given depth (1 = /docs/[slug], 2 = /docs/[slug]/[page]). */
export async function docParams(depth: 1 | 2) {
  const pages = (await docs.all()).filter(
    (doc) => doc.slug && doc.slug.split("/").length === depth,
  );
  if (depth === 1) {
    return pages.length ? pages.map((doc) => ({ slug: doc.slug })) : [{ slug: "index" }];
  }
  return pages.length
    ? pages.map((doc) => ({ slug: doc.slug.split("/")[0]!, page: doc.slug.split("/")[1]! }))
    : [{ slug: "index", page: "index" }];
}

export type DocsNavItem = { title: string; href: string };
export type DocsNavGroup = { title?: string; items: DocsNavItem[] };

export function docHref(doc: Doc) {
  return doc.slug ? `/docs/${doc.slug}` : "/docs";
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

const byOrder = (a: Doc, b: Doc) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

/** Sidebar groups: top-level pages first, then one group per folder. */
export async function docsNav(): Promise<DocsNavGroup[]> {
  const all = await docs.all();
  const root = all.filter((doc) => !doc.slug.includes("/"));
  const folders = new Map<string, Doc[]>();
  for (const doc of all.filter((d) => d.slug.includes("/"))) {
    const folder = doc.slug.split("/")[0]!;
    folders.set(folder, [...(folders.get(folder) ?? []), doc]);
  }
  const item = (doc: Doc) => ({
    title: doc.data.sidebarTitle ?? doc.data.title,
    href: docHref(doc),
  });

  const groups: DocsNavGroup[] = [];
  const topLevel = root.filter((doc) => !folders.has(doc.slug)).sort(byOrder);
  if (topLevel.length) groups.push({ items: topLevel.map(item) });

  const folderGroups = [...folders.entries()].map(([folder, pages]) => {
    const index = root.find((doc) => doc.slug === folder);
    const minOrder = Math.min(...pages.map((p) => p.data.order), index?.data.order ?? Infinity);
    return {
      order: index?.data.order ?? minOrder,
      group: {
        title: index?.data.title ?? titleCase(folder),
        items: [...(index ? [index] : []), ...pages.sort(byOrder)].map(item),
      },
    };
  });
  groups.push(...folderGroups.sort((a, b) => a.order - b.order).map((g) => g.group));
  return groups;
}

/** Previous and next pages in sidebar order. */
export async function docsPager(href: string) {
  const flat = (await docsNav()).flatMap((group) => group.items);
  const index = flat.findIndex((item) => item.href === href);
  return {
    previous: index > 0 ? flat[index - 1] : undefined,
    next: index >= 0 ? flat[index + 1] : undefined,
  };
}

export type SearchDocument = {
  id: string;
  title: string;
  href: string;
  section: string;
  text: string;
};

/** Everything the client-side search needs, built at build time. */
export async function searchIndex(): Promise<SearchDocument[]> {
  const nav = await docsNav();
  const sectionOf = new Map(
    nav.flatMap((group) => group.items.map((item) => [item.href, group.title ?? ""] as const)),
  );
  return (await docs.all()).map((doc) => ({
    id: doc.slug || "index",
    title: doc.data.title,
    href: docHref(doc),
    section: sectionOf.get(docHref(doc)) ?? "",
    text: `${doc.data.description ?? ""} ${doc.headings.map((h) => h.text).join(" ")} ${plainText(doc.body)}`.slice(
      0,
      6000,
    ),
  }));
}
