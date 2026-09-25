import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const adminEnv = createEnv({
  server: {
    ADMIN_EMAILS: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? "")
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
      ),
  },
  runtimeEnv: {
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
