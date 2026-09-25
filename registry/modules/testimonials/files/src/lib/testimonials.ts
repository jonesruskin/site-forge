import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";
import { z } from "zod";

import type { Testimonial } from "@/components/sections/testimonials";

const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
  /** Path in /public or absolute URL (allow remote hosts in next.config). */
  avatar: z.string().optional(),
  url: z.url().optional(),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const load = cache(async () => {
  const file = path.join(process.cwd(), "content", "testimonials.json");
  const parsed = z.array(testimonialSchema).safeParse(JSON.parse(await readFile(file, "utf8")));
  if (!parsed.success)
    throw new Error(`Invalid content/testimonials.json\n${z.prettifyError(parsed.error)}`);
  return parsed.data;
});

/** Testimonials shaped for the testimonials section. */
export async function getTestimonials(
  filter: { featured?: boolean; tag?: string; limit?: number } = {},
): Promise<Testimonial[]> {
  let items = await load();
  if (filter.featured !== undefined) items = items.filter((t) => t.featured === filter.featured);
  if (filter.tag) items = items.filter((t) => t.tags.includes(filter.tag!));
  return items.slice(0, filter.limit ?? items.length).map((t) => ({
    quote: t.quote,
    name: t.name,
    role: t.role,
    href: t.url,
    avatar: t.avatar ? { src: t.avatar, alt: t.name } : undefined,
  }));
}
