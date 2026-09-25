import { LaptopIcon, SmartphoneIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revokeOtherSessionsAction, revokeSessionAction } from "@/lib/settings/actions";

type SessionRow = {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function describe(userAgent?: string | null) {
  const ua = userAgent ?? "";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "Unknown OS";
  return { label: `${browser} on ${os}`, mobile: /Mobile|iPhone|Android/.test(ua) };
}

export function SessionsList({
  sessions,
  currentToken,
}: {
  sessions: SessionRow[];
  currentToken: string;
}) {
  const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y rounded-lg border">
        {sessions.map((session) => {
          const { label, mobile } = describe(session.userAgent);
          const current = session.token === currentToken;
          const Icon = mobile ? SmartphoneIcon : LaptopIcon;
          return (
            <li key={session.token} className="flex items-center gap-4 px-4 py-3">
              <Icon aria-hidden className="text-muted-foreground size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {label}
                  {current && <Badge variant="success">This device</Badge>}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {session.ipAddress ?? "Unknown IP"} · last active{" "}
                  {format.format(new Date(session.updatedAt))}
                </p>
              </div>
              {!current && (
                <form action={revokeSessionAction}>
                  <input type="hidden" name="token" value={session.token} />
                  <Button type="submit" variant="ghost" size="sm">
                    Sign out
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
      {sessions.length > 1 && (
        <form action={revokeOtherSessionsAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out of all other devices
          </Button>
        </form>
      )}
    </div>
  );
}
