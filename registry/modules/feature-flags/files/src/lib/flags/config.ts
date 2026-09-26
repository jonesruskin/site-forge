import { z } from "zod";

import siteConfig from "@/site.config";

import type { FlagDefinition } from "./evaluate";

const definitionSchema = z.object({
  description: z.string().optional(),
  default: z.boolean().default(false),
  rollout: z.number().min(0).max(100).default(0),
  allow: z.array(z.string()).default([]),
}) satisfies z.ZodType<FlagDefinition, unknown>;

export const flagDefinitions: Record<string, FlagDefinition> = z
  .record(z.string().regex(/^[a-zA-Z][\w-]*$/), definitionSchema)
  .parse((siteConfig as { flags?: unknown }).flags ?? {});

/** Flag names declared in site.config.ts, so typos fail type-checking. */
export type FlagName = typeof siteConfig extends { flags: infer Flags }
  ? keyof Flags & string
  : string;

/** Cookies used by the module. */
export const VISITOR_COOKIE = "site_vid";
export const OVERRIDE_COOKIE = "site_flags";

/** /dev/flags and personal overrides: always in development, opt-in elsewhere (staging). */
export const devToolsEnabled =
  process.env.NODE_ENV === "development" || siteConfig.features.flagsDevTools === true;
