import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const newsletterEnv = createEnv({
  server: {
    NEWSLETTER_PROVIDER: isProduction
      ? z.enum(["resend", "buttondown", "kit"])
      : z.enum(["resend", "buttondown", "kit", "log"]).default("log"),
    NEWSLETTER_SECRET: isProduction
      ? z.string().min(32)
      : z.string().default("development-only-newsletter-secret"),
    RESEND_SEGMENT_ID: z.string().optional(),
    BUTTONDOWN_API_KEY: z.string().optional(),
    KIT_API_KEY: z.string().optional(),
    KIT_FORM_ID: z.string().optional(),
  },
  runtimeEnv: {
    NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
    NEWSLETTER_SECRET: process.env.NEWSLETTER_SECRET,
    RESEND_SEGMENT_ID: process.env.RESEND_SEGMENT_ID,
    BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
    KIT_API_KEY: process.env.KIT_API_KEY,
    KIT_FORM_ID: process.env.KIT_FORM_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
