import { z } from "zod";

import { defineCollection } from "@/lib/mdx/collection";

/** content/about/index.mdx (more pages in that folder are possible, e.g. /about/uses). */
export const aboutPages = defineCollection({
  directory: "about",
  schema: z.object({ title: z.string().min(1), description: z.string().optional() }),
});
