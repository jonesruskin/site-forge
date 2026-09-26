import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const storeEnv = createEnv({
  server: {
    STORE_DOWNLOAD_SECRET:
      process.env.NODE_ENV === "production" ? z.string().min(32) : z.string().min(32).optional(),
  },
  runtimeEnv: {
    STORE_DOWNLOAD_SECRET: process.env.STORE_DOWNLOAD_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
