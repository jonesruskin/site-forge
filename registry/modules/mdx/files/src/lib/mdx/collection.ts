import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

import { excerpt, extractHeadings, readingMinutes, type Heading } from "./text";

export type Entry<T> = {
  /** URL slug, e.g. "getting-started" or "guides/deploy" ("" for an index file). */
  slug: string;
  /** Path relative to /content, for "edit this page" links. */
  file: string;
  data: T;
  /** MDX without frontmatter. */
  body: string;
  excerpt: string;
  readingMinutes: number;
  headings: Heading[];
};

type CollectionOptions<S extends z.ZodType> = {
  /** Folder inside /content. */
  directory: string;
  /** Zod schema for the frontmatter. A `draft: true` entry is hidden in production. */
  schema: S;
  /** Sort order for `all()`. Defaults to file path. */
  sort?: (a: Entry<z.output<S>>, b: Entry<z.output<S>>) => number;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function toSlug(file: string) {
  const withoutExt = file
    .replace(/\.mdx?$/, "")
    .split(path.sep)
    .join("/");
  return withoutExt === "index" ? "" : withoutExt.replace(/\/index$/, "");
}

/**
 * A typed set of MDX files. Every file is parsed and validated once per
 * request/build (React cache); invalid frontmatter fails the build with the
 * file path and the Zod issue.
 */
export function defineCollection<S extends z.ZodType>({
  directory,
  schema,
  sort,
}: CollectionOptions<S>) {
  type Data = z.output<S>;
  const dir = path.join(CONTENT_ROOT, directory);

  const all = cache(async (): Promise<Entry<Data>[]> => {
    const files = (await readdir(dir, { recursive: true }).catch(() => [] as string[]))
      .filter((file) => /\.mdx?$/.test(file))
      .sort();

    const entries = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(dir, file), "utf8");
        const match = FRONTMATTER.exec(raw);
        const frontmatter = match ? parseYaml(match[1]!) : {};
        const parsed = schema.safeParse(frontmatter ?? {});
        if (!parsed.success) {
          throw new Error(
            `Invalid frontmatter in content/${directory}/${file}\n${z.prettifyError(parsed.error)}`,
          );
        }
        const body = match ? raw.slice(match[0].length) : raw;
        const data = parsed.data as Data;
        const description = (data as { description?: unknown }).description;
        return {
          slug: toSlug(file),
          file: `content/${directory}/${file.split(path.sep).join("/")}`,
          data,
          body,
          excerpt: typeof description === "string" && description ? description : excerpt(body),
          readingMinutes: readingMinutes(body),
          headings: extractHeadings(body),
        } satisfies Entry<Data>;
      }),
    );

    const visible = entries.filter(
      (entry) =>
        process.env.NODE_ENV !== "production" || !(entry.data as { draft?: boolean }).draft,
    );
    return sort ? visible.sort(sort) : visible;
  });

  return {
    all,
    get: cache(async (slug: string) => (await all()).find((entry) => entry.slug === slug) ?? null),
    /** For generateStaticParams with a single [slug] segment. */
    params: async () => (await all()).map((entry) => ({ slug: entry.slug })),
  };
}

/** Frontmatter date: accepts YAML dates or ISO strings, outputs an ISO date string. */
export const dateField = z.union([z.date(), z.string()]).transform((value, ctx) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: "custom", message: "Invalid date" });
    return z.NEVER;
  }
  return date.toISOString();
});
