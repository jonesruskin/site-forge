import type { Metadata } from "next";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin/guard";
import { adminStats, signupsByDay } from "@/lib/admin/stats";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");
  const [stats, signups] = await Promise.all([adminStats(), signupsByDay(14)]);
  const peak = Math.max(1, ...signups.map((day) => day.value));
  const cards = [
    { label: "Users", value: stats.users },
    { label: "New this week", value: stats.newUsers },
    { label: "Verified", value: stats.verified },
    { label: "Active sessions", value: stats.activeSessions },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{card.value.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign-ups, last 14 days</CardTitle>
        </CardHeader>
        <figure className="px-6 pb-6">
          <div
            className="flex h-40 items-end gap-1.5"
            role="img"
            aria-label={`Sign-ups per day: ${signups.map((d) => d.value).join(", ")}`}
          >
            {signups.map((day) => (
              <div
                key={day.day}
                className="flex h-full flex-1 flex-col justify-end"
                title={`${day.day}: ${day.value}`}
              >
                <div
                  className="bg-primary min-h-px rounded-t-sm"
                  style={{ height: `${(day.value / peak) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <figcaption className="text-muted-foreground mt-2 flex justify-between text-xs">
            <span>{signups[0]?.day}</span>
            <span>{signups.at(-1)?.day}</span>
          </figcaption>
        </figure>
      </Card>
    </div>
  );
}
