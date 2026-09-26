import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { featureFlagsEnv } from "@/env/flags";

import {
  devToolsEnabled,
  flagDefinitions,
  OVERRIDE_COOKIE,
  VISITOR_COOKIE,
  type FlagName,
} from "./config";
import { evaluateFlag, parseOverrides, type FlagResult } from "./evaluate";

export type { FlagName } from "./config";

/** Who the flag is evaluated for. Pass the signed-in user; anonymous visitors are handled for you. */
export type FlagUser = { id: string; email?: string | null } | null | undefined;

const environmentOverrides = parseOverrides(featureFlagsEnv.FLAG_OVERRIDES);

export const readPersonalOverrides = cache(async (): Promise<Record<string, boolean>> => {
  if (!devToolsEnabled) return {};
  const raw = (await cookies()).get(OVERRIDE_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === "boolean"),
    );
  } catch {
    return {};
  }
});

async function subjectFor(user: FlagUser) {
  if (user) return { key: user.id, email: user.email };
  return { key: (await cookies()).get(VISITOR_COOKIE)?.value };
}

/** Evaluates one flag with the reason it resolved that way. Reads cookies, so the page renders per request. */
export async function explainFlag(flag: FlagName, user?: FlagUser): Promise<FlagResult> {
  const definition = flagDefinitions[flag];
  if (!definition) {
    if (process.env.NODE_ENV !== "production")
      console.warn(`[flags] "${flag}" is not declared in site.config.ts`);
    return { enabled: false, reason: "default" };
  }
  return evaluateFlag(flag, definition, await subjectFor(user), {
    personal: await readPersonalOverrides(),
    environment: environmentOverrides,
  });
}

/**
 *   if (await isEnabled("newDashboard", user)) { … }
 */
export async function isEnabled(flag: FlagName, user?: FlagUser) {
  return (await explainFlag(flag, user)).enabled;
}

/** Every flag at once, e.g. to hand a plain object to client components. */
export async function getFlags(user?: FlagUser): Promise<Record<FlagName, boolean>> {
  const entries = await Promise.all(
    Object.keys(flagDefinitions).map(
      async (flag) => [flag, await isEnabled(flag as FlagName, user)] as const,
    ),
  );
  return Object.fromEntries(entries) as Record<FlagName, boolean>;
}
