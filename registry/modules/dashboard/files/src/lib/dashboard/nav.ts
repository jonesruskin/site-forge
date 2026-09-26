import { createElement } from "react";

import type { DashboardNavGroup } from "@/components/sections/dashboard-shell";
import siteConfig from "@/site.config";

import { NavIcon } from "./icons";

/** Sidebar groups from site.config: the app itself, then settings, then admin (for admins). */
export function dashboardNav({ isAdmin = false }: { isAdmin?: boolean } = {}): DashboardNavGroup[] {
  const { dashboard, settings, admin } = siteConfig.nav;
  const toItem = (link: (typeof dashboard)[number]) => ({
    label: link.label,
    href: link.href,
    icon: createElement(NavIcon, { name: link.icon }),
    exact: link.href === "/dashboard",
  });
  const groups: DashboardNavGroup[] = [{ items: dashboard.map(toItem) }];
  if (settings.length) groups.push({ title: "Settings", items: settings.map(toItem) });
  if (isAdmin && admin.length) groups.push({ title: "Admin", items: admin.map(toItem) });
  return groups;
}
