import { z } from "zod";

import siteConfig from "@/site.config";

const planSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/),
  name: z.string(),
  description: z.string().optional(),
  /** Display prices in major units. `monthly: null` = custom pricing ("contact us"). */
  price: z.object({ monthly: z.number().nullable(), yearly: z.number().nullable().optional() }),
  /** Provider price lookup keys. Default: `<id>_monthly` / `<id>_yearly`. */
  lookupKeys: z
    .object({ monthly: z.string().optional(), yearly: z.string().optional() })
    .default({}),
  features: z.array(z.string()).default([]),
  /** Numeric entitlements, e.g. { projects: 10, members: 5 }. */
  limits: z.record(z.string(), z.number()).default({}),
  highlighted: z.boolean().default(false),
  badge: z.string().optional(),
  ctaLabel: z.string().optional(),
  /** For custom plans: where "Contact us" goes. */
  contactHref: z.string().optional(),
});

export type Plan = z.output<typeof planSchema>;

export const billingConfig = z
  .object({
    currency: z.string().length(3).default("usd"),
    /** Free trial for first-time subscribers (0 = none). */
    trialDays: z.number().int().min(0).default(0),
    plans: z.array(planSchema).min(1),
  })
  .parse((siteConfig as { billing?: unknown }).billing);
