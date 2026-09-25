import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

export const paymentsEnv = createEnv({
  server: {
    STRIPE_SECRET_KEY: isProduction ? z.string().startsWith("sk_") : z.string().optional(),
    STRIPE_WEBHOOK_SECRET: isProduction ? z.string().startsWith("whsec_") : z.string().optional(),
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
