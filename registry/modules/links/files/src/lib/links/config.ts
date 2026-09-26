import { z } from "zod";

import { absoluteUrl, isExternal } from "@/lib/url";
import siteConfig from "@/site.config";

export const linksConfig = z
  .object({
    /** Heading; defaults to the author's name. */
    title: z.string().optional(),
    bio: z.string().default(""),
    /** Avatar image path or URL; initials are shown without one. */
    avatar: z.string().default(""),
    /** Tag outbound links with utm_source/utm_medium so analytics can credit this page. */
    utm: z.boolean().default(true),
    items: z
      .array(
        z.object({
          label: z.string().min(1),
          href: z.string().min(1),
          description: z.string().optional(),
          /** Emphasize one or two links. */
          highlight: z.boolean().default(false),
        }),
      )
      .default([]),
  })
  .parse((siteConfig as { links?: unknown }).links ?? {});

/** Adds UTM parameters to external http(s) links (never overwriting existing ones). */
export function withUtm(href: string) {
  if (!linksConfig.utm || !/^https?:\/\//.test(href) || !isExternal(href)) return href;
  try {
    const url = new URL(href);
    if (url.origin === new URL(siteConfig.url).origin) return href;
    if (!url.searchParams.has("utm_source"))
      url.searchParams.set("utm_source", new URL(siteConfig.url).hostname);
    if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "links");
    return url.toString();
  } catch {
    return href;
  }
}

export const linksPageUrl = () => absoluteUrl("/links");
