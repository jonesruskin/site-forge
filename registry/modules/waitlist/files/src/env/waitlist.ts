import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const waitlistEnv = createEnv({
  server: {
    WAITLIST_ADMIN_TOKEN: z.string().min(16).optional(),
  },
  runtimeEnv: {
    WAITLIST_ADMIN_TOKEN: process.env.WAITLIST_ADMIN_TOKEN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
