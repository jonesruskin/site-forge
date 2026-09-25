import type { Metadata } from "next";

import { DeleteAccount } from "@/components/settings/delete-account";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountSettingsPage() {
  const { user } = await requireSession("/settings/account");
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently delete {user.email} and everything associated with it. If you have a paid
          subscription, cancel it first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DeleteAccount />
      </CardContent>
    </Card>
  );
}
