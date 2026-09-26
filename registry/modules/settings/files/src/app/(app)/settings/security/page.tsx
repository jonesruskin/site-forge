import type { Metadata } from "next";
import { headers } from "next/headers";

import { PasswordForm } from "@/components/settings/password-form";
import { SessionsList } from "@/components/settings/sessions-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Security", robots: { index: false } };

export default async function SecuritySettingsPage() {
  const { session } = await requireSession("/settings/security");
  const requestHeaders = await headers();
  const [sessions, accounts] = await Promise.all([
    auth.api.listSessions({ headers: requestHeaders }),
    auth.api.listUserAccounts({ headers: requestHeaders }),
  ]);
  const hasPassword = accounts.some((account) => account.providerId === "credential");

  return (
    <div className="flex flex-col gap-6">
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Use a long, unique password.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList sessions={sessions} currentToken={session.token} />
        </CardContent>
      </Card>
    </div>
  );
}
