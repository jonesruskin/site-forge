import { z } from "zod";

import type { RateLimitOptions } from "@/lib/rate-limit";
import siteConfig from "@/site.config";

const duration = z.string().regex(/^\d+\s*(ms|s|m|h|d)$/) as unknown as z.ZodType<
  RateLimitOptions["window"]
>;

export const apiConfig = z
  .object({
    /** Keys look like `<prefix>_<40 random characters>`; a distinctive prefix helps secret scanners. */
    keyPrefix: z
      .string()
      .regex(/^[a-z][a-z0-9]{0,11}$/)
      .default("sk"),
    /** Scope name → description shown when creating a key. */
    scopes: z.record(z.string().regex(/^[a-z][a-z0-9:_-]*$/), z.string()).default({
      read: "Read your account data",
      write: "Create and change data",
    }),
    /** Default per-key (or per-IP) limit for every apiRoute(). */
    rateLimit: z
      .object({ limit: z.number().int().positive(), window: duration })
      .default({ limit: 60, window: "1 m" }),
  })
  .parse((siteConfig as { api?: unknown }).api ?? {});

/** A scope name from site.config.ts `api.scopes`. */
export type ApiScope = string;
