import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth/auth";

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

/** Teams the current user belongs to. */
export const listTeams = cache(async () =>
  auth.api.listOrganizations({ headers: await headers() }),
);

/** The active team with members and invitations, or null. */
export const getActiveTeam = cache(async () => {
  try {
    return await auth.api.getFullOrganization({ headers: await headers() });
  } catch {
    return null;
  }
});

export function canManage(role: string | undefined) {
  return role === "owner" || role === "admin";
}
