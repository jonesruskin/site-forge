import { SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";

import { UserMenu } from "@/components/auth/user-menu";
import { DashboardShell } from "@/components/sections/dashboard-shell";
import { dashboardTopbar } from "@/generated/dashboard-topbar";
import { requireSession } from "@/lib/auth/session";
import { dashboardNav } from "@/lib/dashboard/nav";
import siteConfig from "@/site.config";

/** Every page in src/app/(app) is signed-in only and rendered inside the app shell. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const { user } = await requireSession();
  const isAdmin = (user as { role?: string | null }).role === "admin";
  const settingsHref = siteConfig.nav.settings[0]?.href;

  return (
    <DashboardShell
      brand={siteConfig.name}
      nav={dashboardNav({ isAdmin })}
      topbar={
        <>
          {dashboardTopbar.map((Item, index) => (
            <Item key={index} userId={user.id} />
          ))}
          <UserMenu
            user={user}
            links={
              settingsHref
                ? [{ label: "Settings", href: settingsHref, icon: <SettingsIcon aria-hidden /> }]
                : []
            }
          />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
