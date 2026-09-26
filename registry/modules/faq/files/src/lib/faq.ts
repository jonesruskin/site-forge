import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1),
  /** Plain text; blank lines separate paragraphs. */
  answer: z.string().min(1),
  category: z.string().default("General"),
  tags: z.array(z.string()).default([]),
});

export type FaqEntry = z.output<typeof faqSchema>;

const load = cache(async () => {
  const file = path.join(process.cwd(), "content", "faq.json");
  const parsed = z.array(faqSchema).safeParse(JSON.parse(await readFile(file, "utf8")));
  if (!parsed.success)
    throw new Error(`Invalid content/faq.json\n${z.prettifyError(parsed.error)}`);
  return parsed.data;
});

export async function getFaqs(filter: { category?: string; tag?: string } = {}) {
  let items = await load();
  if (filter.category) items = items.filter((f) => f.category === filter.category);
  if (filter.tag) items = items.filter((f) => f.tags.includes(filter.tag!));
  return items;
}

/** Questions grouped by category, preserving file order. */
export async function getFaqGroups() {
  const groups = new Map<string, FaqEntry[]>();
  for (const item of await load())
    groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}
