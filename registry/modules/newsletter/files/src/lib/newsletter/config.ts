import { z } from "zod";

import siteConfig from "@/site.config";

export const newsletterConfig = z
  .object({
    title: z.string().default("Newsletter"),
    description: z.string().default(""),
    /** Send a confirmation link before subscribing (recommended; required in many countries). */
    doubleOptIn: z.boolean().default(true),
    checkInboxMessage: z.string().default("Check your inbox to confirm your subscription."),
    confirmedMessage: z.string().default("You're subscribed."),
  })
  .parse((siteConfig as { newsletter?: unknown }).newsletter ?? {});
