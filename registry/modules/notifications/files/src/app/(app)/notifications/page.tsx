import { BellIcon } from "lucide-react";
import type { Metadata } from "next";

import { NotificationList } from "@/components/notifications/notification-list";
import { EmptyState } from "@/components/sections/empty-state";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { markAllReadAction } from "@/lib/notifications/actions";
import { listNotifications } from "@/lib/notifications/notify";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const { user } = await requireSession("/notifications");
  const items = await listNotifications(user.id, { limit: 100 });
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        {items.some((item) => !item.readAt) && (
          <form action={markAllReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>
      {items.length ? (
        <NotificationList items={items} />
      ) : (
        <EmptyState icon={<BellIcon />} title="No notifications yet" description="Updates about your account will appear here." />
      )}
    </div>
  );
}
