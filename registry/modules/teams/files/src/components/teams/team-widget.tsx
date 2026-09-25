import { UsersIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveTeam } from "@/lib/teams/queries";

export async function TeamWidget() {
  const team = await getActiveTeam();
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <UsersIcon aria-hidden className="size-4" /> Team
        </CardDescription>
        <CardTitle className="text-2xl">{team?.name ?? "Just you"}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {team ? (
          <Link href="/settings/team" className="font-medium underline-offset-4 hover:underline">
            {team.members.length} {team.members.length === 1 ? "member" : "members"} · Manage
          </Link>
        ) : (
          <p className="text-muted-foreground">Create a team from the switcher to invite people.</p>
        )}
      </CardContent>
    </Card>
  );
}
