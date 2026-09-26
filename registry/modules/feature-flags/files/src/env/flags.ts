import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const featureFlagsEnv = createEnv({
  server: {
    FLAG_OVERRIDES: z
      .string()
      .regex(
        /^(\s*[\w-]+\s*=\s*(on|off|true|false|1|0)\s*)(,\s*[\w-]+\s*=\s*(on|off|true|false|1|0)\s*)*$/i,
        {
          message: 'Use "flagA=on,flagB=off".',
        },
      )
      .optional(),
  },
  runtimeEnv: {
    FLAG_OVERRIDES: process.env.FLAG_OVERRIDES,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
