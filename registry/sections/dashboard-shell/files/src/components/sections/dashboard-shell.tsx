import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DashboardNav, type DashboardNavGroup } from "./dashboard-nav";

export type { DashboardNavGroup, DashboardNavItem } from "./dashboard-nav";

export type DashboardShellProps = {
  brand: ReactNode;
  brandHref?: string;
  nav: DashboardNavGroup[];
  /** Pinned to the bottom of the sidebar: user menu, plan badge, help link. */
  sidebarFooter?: ReactNode;
  /** Right side of the top bar: search, notifications, actions. */
  topbar?: ReactNode;
  /** Left side of the top bar: page title or breadcrumbs. */
  title?: ReactNode;
  children: ReactNode;
  labels?: { menu?: string; close?: string; nav?: string };
  className?: string;
};

/**
 * App layout: fixed sidebar from `lg`, and a native popover drawer below it
 * (Esc, light-dismiss and focus handling come from the browser).
 */
export function DashboardShell({
  brand,
  brandHref = "/dashboard",
  nav,
  sidebarFooter,
  topbar,
  title,
  children,
  labels = {},
  className,
}: DashboardShellProps) {
  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        href={brandHref}
        className="font-display flex h-9 items-center gap-2 px-3 font-semibold tracking-tight"
      >
        {brand}
      </Link>
      <div className="flex-1 overflow-y-auto">
        <DashboardNav groups={nav} label={labels.nav} />
      </div>
      {sidebarFooter && <div className="border-t pt-4">{sidebarFooter}</div>}
    </div>
  );

  return (
    <div className={cn("bg-muted/40 min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]", className)}>
      <aside className="bg-background sticky top-0 hidden h-dvh border-r lg:block">{sidebar}</aside>

      <div
        id="dashboard-drawer"
        popover="auto"
        className="bg-background inset-y-0 left-0 m-0 h-dvh w-72 max-w-[85vw] border-r p-0 shadow-lg backdrop:bg-foreground/40"
      >
        <button
          type="button"
          popoverTarget="dashboard-drawer"
          popoverTargetAction="hide"
          className="hover:bg-accent absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md"
        >
          <XIcon aria-hidden className="size-4" />
          <span className="sr-only">{labels.close ?? "Close menu"}</span>
        </button>
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-col">
        <header className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            popoverTarget="dashboard-drawer"
            className="hover:bg-accent -ml-1 inline-flex size-9 items-center justify-center rounded-md lg:hidden"
          >
            <MenuIcon aria-hidden className="size-5" />
            <span className="sr-only">{labels.menu ?? "Open menu"}</span>
          </button>
          <div className="min-w-0 flex-1 truncate text-sm font-medium">{title}</div>
          {topbar && <div className="flex items-center gap-2">{topbar}</div>}
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
