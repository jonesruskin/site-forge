import { z } from "zod";

import { dateField, defineCollection } from "@/lib/mdx/collection";
import siteConfig from "@/site.config";

export const legalPages = defineCollection({
  directory: "legal",
  schema: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    updated: dateField,
  }),
});

const legalConfig = z
  .object({
    companyName: z.string().default(""),
    contactEmail: z.string().default(""),
    jurisdiction: z.string().default(""),
    address: z.string().default(""),
  })
  .parse((siteConfig as { legal?: unknown }).legal ?? {});

/** Values available as `{legal.*}` inside the MDX templates. */
export const legalScope = {
  legal: {
    companyName: legalConfig.companyName || siteConfig.name,
    contactEmail:
      legalConfig.contactEmail ||
      siteConfig.author.email ||
      `hello@${new URL(siteConfig.url).hostname}`,
    jurisdiction: legalConfig.jurisdiction,
    address: legalConfig.address,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
};
