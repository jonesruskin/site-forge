import { getSession } from "@/lib/auth/session";
import { listTeams } from "@/lib/teams/queries";

import { TeamSwitcher } from "./team-switcher";

/** Server wrapper rendered in the dashboard top bar. */
export async function TeamSwitcherSlot() {
  const [teams, session] = await Promise.all([listTeams(), getSession()]);
  const activeId = (session?.session as { activeOrganizationId?: string | null } | undefined)?.activeOrganizationId ?? null;
  return <TeamSwitcher teams={teams.map((team) => ({ id: team.id, name: team.name }))} activeId={activeId} />;
}
