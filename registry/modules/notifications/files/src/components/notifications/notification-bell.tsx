import { BellIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { markAllReadAction } from "@/lib/notifications/actions";
import { listNotifications, unreadCount } from "@/lib/notifications/notify";

import { NotificationList } from "./notification-list";

/** Top-bar bell: unread badge and the latest items in a popover. */
export async function NotificationBell({ userId }: { userId: string }) {
  const [items, unread] = await Promise.all([listNotifications(userId, { limit: 6 }), unreadCount(userId)]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
          <BellIcon aria-hidden />
          {unread > 0 && (
            <span aria-hidden className="bg-primary text-primary-foreground absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] leading-4 font-semibold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <form action={markAllReadAction}>
              <Button type="submit" variant="link" size="sm" className="h-auto p-0">
                Mark all read
              </Button>
            </form>
          )}
        </div>
        {items.length ? (
          <NotificationList items={items} compact />
        ) : (
          <p className="text-muted-foreground px-4 py-8 text-center text-sm">You&apos;re all caught up.</p>
        )}
        <div className="border-t px-4 py-2 text-center">
          <Link href="/notifications" className="text-sm font-medium underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
