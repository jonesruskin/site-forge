import { CodeIcon } from "lucide-react";
import type { Metadata } from "next";

import { EmptyState } from "@/components/sections/empty-state";
import { dashboardWidgets } from "@/generated/dashboard-widgets";
import { requireSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  const { user } = await requireSession("/dashboard");
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening in your account.
        </p>
      </header>
      {dashboardWidgets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardWidgets.map((Widget, index) => (
            <Widget key={index} userId={user.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CodeIcon />}
          title="Your app starts here"
          description="Edit src/app/(app)/dashboard/page.tsx, or add modules like billing and teams to fill this overview."
        />
      )}
    </div>
  );
}
