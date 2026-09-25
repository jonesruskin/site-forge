import { EyeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { stopImpersonatingAction } from "@/lib/admin/actions";
import { getSession } from "@/lib/auth/session";

/** Shown in the top bar while an admin is signed in as someone else. */
export async function ImpersonationBanner() {
  const current = await getSession();
  const impersonatedBy = (current?.session as { impersonatedBy?: string | null } | undefined)
    ?.impersonatedBy;
  if (!current || !impersonatedBy) return null;
  return (
    <form
      action={stopImpersonatingAction}
      className="border-warning/50 bg-warning/15 flex items-center gap-2 rounded-md border py-1 pr-1 pl-3 text-sm"
    >
      <EyeIcon aria-hidden className="size-4" />
      <span className="hidden sm:inline">Viewing as {current.user.email}</span>
      <Button type="submit" size="sm" variant="outline">
        Stop
      </Button>
    </form>
  );
}
