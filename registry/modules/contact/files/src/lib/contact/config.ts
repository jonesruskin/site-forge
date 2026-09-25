import { z } from "zod";

import siteConfig from "@/site.config";

const contactConfigSchema = z.object({
  title: z.string().default("Get in touch"),
  description: z.string().default(""),
  successMessage: z.string().default("Thanks! Your message is on its way."),
  subjectPrefix: z.string().default("[Contact]"),
});

/** The `contact` block of site.config.ts, validated. */
export const contactConfig = contactConfigSchema.parse(
  (siteConfig as { contact?: unknown }).contact ?? {},
);
