import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const emailEnv = createEnv({
  server: {
    RESEND_API_KEY:
      isProduction && !process.env.EMAIL_OUTBOX ? z.string().min(1) : z.string().optional(),
    EMAIL_FROM: isProduction
      ? z.string().min(3)
      : z.string().default("Site <onboarding@resend.dev>"),
    /** Capture mode: never deliver, always write to the outbox. */
    EMAIL_OUTBOX: z.enum(["1", "true", "0", "false"]).optional(),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_OUTBOX: process.env.EMAIL_OUTBOX,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
