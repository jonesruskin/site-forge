import { z } from "zod";

import siteConfig from "@/site.config";

const blogConfigSchema = z.object({
  title: z.string().default("Blog"),
  description: z.string().default(""),
  postsPerPage: z.number().int().positive().default(12),
});

export const blogConfig = blogConfigSchema.parse((siteConfig as { blog?: unknown }).blog ?? {});
