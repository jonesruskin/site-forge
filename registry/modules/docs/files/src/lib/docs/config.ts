import { z } from "zod";

import siteConfig from "@/site.config";

const docsConfigSchema = z.object({
  title: z.string().default("Documentation"),
  description: z.string().default(""),
  /** Prefix for "Edit this page" links; the file path is appended. Empty disables them. */
  editUrl: z.string().default(""),
});

export const docsConfig = docsConfigSchema.parse((siteConfig as { docs?: unknown }).docs ?? {});
