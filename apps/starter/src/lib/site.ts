import { z } from "zod";

const navLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  description: z.string().optional(),
  /** lucide icon name in kebab-case, used by navs that render icons (dashboard, links page). */
  icon: z.string().optional(),
  external: z.boolean().optional(),
});

const navGroupSchema = z.object({
  title: z.string().min(1),
  links: z.array(navLinkSchema),
});

const socialSchema = z.object({
  /** Known platforms get an icon; anything else renders as a text link. */
  platform: z.string().min(1),
  href: z.url(),
  label: z.string().optional(),
});

const baseSiteConfigSchema = z.object({
  name: z.string().min(1),
  /** One sentence. Used as the default meta description. */
  description: z.string().min(1),
  /** Canonical production URL, no trailing slash. */
  url: z.url().transform((url) => url.replace(/\/+$/, "")),
  locale: z.string().default("en"),
  author: z.object({
    name: z.string().min(1),
    url: z.url().optional(),
    email: z.email().optional(),
  }),
  socials: z.array(socialSchema).default([]),
  nav: z
    .object({
      header: z.array(navLinkSchema).default([]),
      footer: z.array(navGroupSchema).default([]),
      legal: z.array(navLinkSchema).default([]),
      dashboard: z.array(navLinkSchema).default([]),
      settings: z.array(navLinkSchema).default([]),
      admin: z.array(navLinkSchema).default([]),
    })
    .prefault({}),
  /** Installed modules. Kept in sync by the site CLI — see src/generated/modules.ts. */
  modules: z.array(z.string()).readonly().default([]),
  /** Static on/off switches. The feature-flags module adds rollout rules on top. */
  features: z.record(z.string(), z.boolean()).default({}),
  seo: z
    .object({
      titleTemplate: z.string().default("%s"),
      keywords: z.array(z.string()).default([]),
      /** Path or URL of the default social image. The seo module generates one if omitted. */
      ogImage: z.string().optional(),
      twitterHandle: z.string().optional(),
    })
    .prefault({}),
});

// Modules add their own top-level blocks (billing, contact, …) validated by their own schemas.
export const siteConfigSchema = baseSiteConfigSchema.loose();

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof baseSiteConfigSchema>;
export type NavLink = z.infer<typeof navLinkSchema>;
export type NavGroup = z.infer<typeof navGroupSchema>;
export type Social = z.infer<typeof socialSchema>;

/**
 * Validates site.config.ts at startup and keeps the literal types of module
 * blocks, so `siteConfig.billing.plans` stays fully typed.
 */
export function defineSite<const T extends SiteConfigInput>(
  config: T,
): SiteConfig & Omit<T, keyof SiteConfig> {
  const result = siteConfigSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid site.config.ts\n${z.prettifyError(result.error)}`);
  }
  return result.data as SiteConfig & Omit<T, keyof SiteConfig>;
}
