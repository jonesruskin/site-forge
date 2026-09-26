import { z } from "zod";

import siteConfig from "@/site.config";

export const waitlistConfig = z
  .object({
    title: z.string().default("Join the waitlist"),
    description: z.string().default(""),
    shareText: z.string().default("I just joined the waitlist:"),
  })
  .parse((siteConfig as { waitlist?: unknown }).waitlist ?? {});
