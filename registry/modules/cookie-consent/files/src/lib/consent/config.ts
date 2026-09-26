import { z } from "zod";

import siteConfig from "@/site.config";

export const consentConfig = z
  .object({
    title: z.string().default("Cookies"),
    description: z.string().default(""),
    policyHref: z.string().optional(),
    categories: z
      .object({ analytics: z.string().optional(), marketing: z.string().optional() })
      .default({ analytics: "Analytics", marketing: "Marketing" }),
  })
  .parse((siteConfig as { cookieConsent?: unknown }).cookieConsent ?? {});
