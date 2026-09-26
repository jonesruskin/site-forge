import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { invitation } from "@/db/schema/teams";

/** Checklist item for the onboarding module (ignored when it isn't installed). */
export const teamsOnboardingTask = {
  id: "invite-teammate",
  title: "Invite a teammate",
  description: "Work together in a shared team.",
  href: "/settings/team",
  done: async (userId: string) =>
    !!(await db.query.invitation.findFirst({
      where: eq(invitation.inviterId, userId),
      columns: { id: true },
    })),
};
