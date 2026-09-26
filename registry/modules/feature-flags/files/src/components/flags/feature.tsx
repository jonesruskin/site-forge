import type { ReactNode } from "react";

import { isEnabled, type FlagName, type FlagUser } from "@/lib/flags";

/**
 * Renders children only when the flag is on for this visitor.
 *
 *   <Feature flag="newDashboard" user={user} fallback={<OldDashboard />}>
 *     <NewDashboard />
 *   </Feature>
 */
export async function Feature({
  flag,
  user,
  children,
  fallback = null,
}: {
  flag: FlagName;
  user?: FlagUser;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (await isEnabled(flag, user)) ? children : fallback;
}
