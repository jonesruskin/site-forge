import type { Metadata } from "next";
import { headers } from "next/headers";

import { EmptyState } from "@/components/sections/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";
import { respondToInvitationAction } from "@/lib/teams/actions";

export const metadata: Metadata = { title: "Team invitation", robots: { index: false } };

export default async function InvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireSession(`/invite/${id}`);
  const invitation = await auth.api.getInvitation({ query: { id }, headers: await headers() }).catch(() => null);

  if (!invitation || invitation.status !== "pending") {
    return (
      <EmptyState
        title="This invitation isn't available"
        description={`It may have expired, been revoked, or been sent to a different address than ${user.email}.`}
        actions={[{ label: "Go to dashboard", href: "/dashboard" }]}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle>Join {invitation.organizationName}</CardTitle>
          <CardDescription>
            {invitation.inviterEmail} invited you as {invitation.role}.
          </CardDescription>
        </CardHeader>
        <CardFooter className="gap-2">
          <form action={respondToInvitationAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="response" value="accept" />
            <Button type="submit">Accept</Button>
          </form>
          <form action={respondToInvitationAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="response" value="decline" />
            <Button type="submit" variant="ghost">
              Decline
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
