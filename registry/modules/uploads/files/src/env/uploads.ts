import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const required = isProduction ? z.string().min(1) : z.string().optional();

export const uploadsEnv = createEnv({
  server: {
    S3_ENDPOINT: isProduction ? z.url() : z.url().optional(),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: required,
    S3_ACCESS_KEY_ID: required,
    S3_SECRET_ACCESS_KEY: required,
  },
  runtimeEnv: {
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
