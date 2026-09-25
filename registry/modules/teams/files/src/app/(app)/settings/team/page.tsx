import { UsersIcon } from "lucide-react";
import type { Metadata } from "next";

import { InviteForm } from "@/components/teams/invite-form";
import { TeamForm } from "@/components/teams/team-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { cancelInvitationAction, leaveTeamAction, removeMemberAction, updateRoleAction } from "@/lib/teams/actions";
import { canManage, getActiveTeam, ROLES } from "@/lib/teams/queries";

export const metadata: Metadata = { title: "Team", robots: { index: false } };

export default async function TeamSettingsPage() {
  const { user } = await requireSession("/settings/team");
  const team = await getActiveTeam();

  if (!team) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon aria-hidden className="size-5" /> No team selected
          </CardTitle>
          <CardDescription>Create a team or switch to one from the menu in the top bar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const me = team.members.find((member) => member.userId === user.id);
  const manage = canManage(me?.role);
  const pending = team.invitations.filter((invitation) => invitation.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>Your role: {me?.role ?? "member"}</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamForm organizationId={team.id} name={team.name} disabled={!manage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {team.members.length} {team.members.length === 1 ? "person" : "people"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <ul className="divide-y rounded-lg border">
            {team.members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.name} {member.userId === user.id && <span className="text-muted-foreground">(you)</span>}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{member.user.email}</p>
                </div>
                {manage && member.role !== "owner" && member.userId !== user.id ? (
                  <div className="flex items-center gap-2">
                    <form action={updateRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="organizationId" value={team.id} />
                      <label className="sr-only" htmlFor={`role-${member.id}`}>
                        Role for {member.user.name}
                      </label>
                      <select
                        id={`role-${member.id}`}
                        name="role"
                        defaultValue={member.role}
                        className="border-input bg-background h-8 rounded-md border px-2 text-sm"
                      >
                        {ROLES.filter((role) => role !== "owner").map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="outline">
                        Update
                      </Button>
                    </form>
                    <form action={removeMemberAction}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="organizationId" value={team.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Remove
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Badge variant={member.role === "owner" ? "default" : "outline"} className="capitalize">
                    {member.role}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          {manage && <InviteForm organizationId={team.id} />}
          {pending.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Pending invitations</h3>
              <ul className="divide-y rounded-lg border">
                {pending.map((invitation) => (
                  <li key={invitation.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate">{invitation.email}</span>
                    <Badge variant="outline" className="capitalize">
                      {invitation.role ?? "member"}
                    </Badge>
                    {manage && (
                      <form action={cancelInvitationAction}>
                        <input type="hidden" name="invitationId" value={invitation.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Revoke
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {me?.role !== "owner" && (
        <Card>
          <CardHeader>
            <CardTitle>Leave team</CardTitle>
            <CardDescription>You&apos;ll lose access to {team.name} until someone invites you again.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={leaveTeamAction}>
              <input type="hidden" name="organizationId" value={team.id} />
              <Button type="submit" variant="destructive">
                Leave {team.name}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
