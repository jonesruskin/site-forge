import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const maintenanceEnv = createEnv({
  server: {
    MAINTENANCE_MODE: z.enum(["on", "off", "true", "false", "1", "0"]).default("off"),
    MAINTENANCE_BYPASS_TOKEN: z.string().min(16).optional(),
  },
  client: {
    NEXT_PUBLIC_MAINTENANCE_WINDOW: z
      .string()
      .regex(/^[^/]+\/[^/]+$/, "Use <start ISO>/<end ISO>")
      .optional(),
  },
  runtimeEnv: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    MAINTENANCE_BYPASS_TOKEN: process.env.MAINTENANCE_BYPASS_TOKEN,
    NEXT_PUBLIC_MAINTENANCE_WINDOW: process.env.NEXT_PUBLIC_MAINTENANCE_WINDOW,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
