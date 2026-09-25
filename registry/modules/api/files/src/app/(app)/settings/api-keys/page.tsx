import type { Metadata } from "next";

import { CreateKeyForm } from "@/components/api/create-key-form";
import { KeyList } from "@/components/api/key-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { apiConfig } from "@/lib/api/config";
import { listApiKeys } from "@/lib/api/keys";
import { absoluteUrl } from "@/lib/url";

export const metadata: Metadata = { title: "API keys", robots: { index: false } };

export default async function ApiKeysPage() {
  const { user } = await requireSession("/settings/api-keys");
  const keys = await listApiKeys(user.id);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a key</CardTitle>
          <CardDescription>
            Send it as <code className="font-mono text-xs">Authorization: Bearer &lt;key&gt;</code>.
            Keys act as you, limited to their scopes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateKeyForm scopes={apiConfig.scopes} endpoint={absoluteUrl("/api/v1/me")} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
          <CardDescription>Revoking a key stops it working immediately.</CardDescription>
        </CardHeader>
        <CardContent>
          <KeyList keys={keys} />
        </CardContent>
      </Card>
    </div>
  );
}
