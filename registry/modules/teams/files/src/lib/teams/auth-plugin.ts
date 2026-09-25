import { organization } from "better-auth/plugins";
import { z } from "zod";

import { TeamInviteEmail } from "@/emails/team-invite";
import { sendEmail } from "@/lib/email/send";
import siteConfig from "@/site.config";

const teamsConfig = z
  .object({ membershipLimit: z.number().int().positive().default(50), invitationExpiresInDays: z.number().positive().default(7) })
  .parse((siteConfig as { teams?: unknown }).teams ?? {});

/** Better Auth organization plugin, added to auth through the auth-plugins slot. */
export const teamsPlugin = organization({
  allowUserToCreateOrganization: true,
  creatorRole: "owner",
  membershipLimit: teamsConfig.membershipLimit,
  invitationExpiresIn: teamsConfig.invitationExpiresInDays * 24 * 60 * 60,
  sendInvitationEmail: async ({ id, email, role, organization: team, inviter }) => {
    const origin = process.env.BETTER_AUTH_URL ?? siteConfig.url;
    await sendEmail({
      to: email,
      subject: `${inviter.user.name} invited you to ${team.name}`,
      react: TeamInviteEmail({ teamName: team.name, inviterName: inviter.user.name, role, url: `${origin}/invite/${id}` }),
    });
  },
});
