"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** Match the path exactly (use for index routes like /dashboard). */
  exact?: boolean;
};

export type DashboardNavGroup = {
  title?: string;
  items: DashboardNavItem[];
};

function isActive(pathname: string, item: DashboardNavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Sidebar navigation with `aria-current` on the active item. */
export function DashboardNav({
  groups,
  label = "Dashboard",
}: {
  groups: DashboardNavGroup[];
  label?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="flex flex-col gap-6">
      {groups.map((group, index) => (
        <div key={group.title ?? index} className="flex flex-col gap-1">
          {group.title && (
            <p className="text-muted-foreground px-3 pb-1 text-xs font-medium">{group.title}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
                      active && "bg-accent text-foreground",
                    )}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                    {item.badge && <span className="ml-auto">{item.badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
