import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const emailEnv = createEnv({
  server: {
    RESEND_API_KEY: isProduction ? z.string().min(1) : z.string().optional(),
    EMAIL_FROM: isProduction
      ? z.string().min(3)
      : z.string().default("Site <onboarding@resend.dev>"),
  },
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
