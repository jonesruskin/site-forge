"use client";

import { FlagIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const COOKIE = "site_flags";

function readCount() {
  const raw = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return 0;
  try {
    return Object.keys(JSON.parse(decodeURIComponent(raw)) as object).length;
  } catch {
    return 0;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  // Overrides change through server actions, which don't emit events; poll cheaply in development.
  const timer = process.env.NODE_ENV === "development" ? setInterval(onChange, 1000) : undefined;
  return () => {
    window.removeEventListener("focus", onChange);
    clearInterval(timer);
  };
}

/** A reminder, pinned to the corner, that this browser is forcing flags. Hidden when there are none. */
export function FlagOverridesPill() {
  // Re-read on navigation: overrides change through /dev/flags.
  usePathname();
  const count = useSyncExternalStore(subscribe, readCount, () => 0);
  if (count === 0) return null;
  return (
    <Link
      href="/dev/flags"
      className="bg-popover text-popover-foreground hover:bg-accent fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md transition-colors"
    >
      <FlagIcon aria-hidden className="text-warning size-3.5" />
      {count} flag {count === 1 ? "override" : "overrides"}
    </Link>
  );
}
