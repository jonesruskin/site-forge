import { z } from "zod";

import siteConfig from "@/site.config";

export const i18nConfig = z
  .object({
    locales: z
      .array(z.string().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/))
      .min(1)
      .default(["en"]),
    defaultLocale: z.string().default("en"),
    /** Names shown in the switcher, in their own language. */
    labels: z.record(z.string(), z.string()).default({}),
  })
  .refine(
    (config) => config.locales.includes(config.defaultLocale),
    "defaultLocale must be one of locales",
  )
  .parse(
    (siteConfig as { i18n?: unknown }).i18n ?? {
      locales: [siteConfig.locale],
      defaultLocale: siteConfig.locale,
    },
  );

/** Same cookie name next-intl uses, so its tooling recognizes it. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
