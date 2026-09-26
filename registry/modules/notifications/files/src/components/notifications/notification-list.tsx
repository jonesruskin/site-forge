import { Button } from "@/components/ui/button";
import type { Notification } from "@/db/schema/notifications";
import { openNotificationAction } from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function ago(date: Date) {
  const minutes = Math.round((date.getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

export function NotificationList({
  items,
  compact = false,
}: {
  items: Notification[];
  compact?: boolean;
}) {
  return (
    <ul className={cn("divide-y", !compact && "rounded-lg border")}>
      {items.map((item) => (
        <li key={item.id}>
          <form action={openNotificationAction}>
            <input type="hidden" name="id" value={item.id} />
            {item.href && <input type="hidden" name="href" value={item.href} />}
            <Button
              type="submit"
              variant="ghost"
              className="h-auto w-full items-start justify-start gap-3 rounded-none px-4 py-3 text-left whitespace-normal"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  item.readAt ? "bg-transparent" : "bg-primary",
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className={cn("text-sm", !item.readAt && "font-semibold")}>
                  {item.title}
                  {!item.readAt && <span className="sr-only"> (unread)</span>}
                </span>
                {item.body && (
                  <span className="text-muted-foreground line-clamp-2 text-xs font-normal">
                    {item.body}
                  </span>
                )}
                <time
                  dateTime={item.createdAt.toISOString()}
                  className="text-muted-foreground text-xs font-normal"
                >
                  {ago(item.createdAt)}
                </time>
              </span>
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
