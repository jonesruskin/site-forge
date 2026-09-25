import type { Metadata } from "next";

import { EmailForm } from "@/components/settings/email-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfileSettingsPage() {
  const { user } = await requireSession("/settings");
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to others.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm name={user.name} image={user.image} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Email{" "}
            {user.emailVerified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Unverified</Badge>
            )}
          </CardTitle>
          <CardDescription>Used to sign in and for account notices.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm email={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
