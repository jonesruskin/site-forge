import type { Metadata } from "next";

import { DashboardShell } from "@/components/sections/dashboard-shell";
import { EmptyState } from "@/components/sections/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardNav, stats } from "@/demo/content";

export const metadata: Metadata = { title: "Dashboard shell", robots: { index: false } };

export default function DashboardDemo() {
  return (
    <DashboardShell
      brand="Tidewater"
      brandHref="/demo/dashboard"
      nav={dashboardNav}
      title="Overview"
      sidebarFooter={
        <div className="flex items-center justify-between px-3 text-sm">
          <span className="font-medium">Harbor Physio</span>
          <Badge>Clinic</Badge>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={String(stat.label)}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <EmptyState title="No appointments today" description="Share your booking page to fill the calendar." actions={[{ label: "Copy booking link", href: "#" }]} />
      </div>
    </DashboardShell>
  );
}
