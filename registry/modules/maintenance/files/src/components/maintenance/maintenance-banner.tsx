"use client";

import { WrenchIcon, XIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { ANNOUNCE_MS, maintenanceWindow } from "@/lib/maintenance/window";

const DISMISS_KEY = "site:maintenance-dismissed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  const timer = setInterval(listener, 60_000);
  return () => {
    listeners.delete(listener);
    clearInterval(timer);
  };
}

function snapshot() {
  if (!maintenanceWindow) return false;
  const now = Date.now();
  const upcoming = maintenanceWindow.start.getTime() - now;
  if (upcoming <= 0 || upcoming > ANNOUNCE_MS) return false;
  try {
    return sessionStorage.getItem(DISMISS_KEY) !== maintenanceWindow.start.toISOString();
  } catch {
    return true;
  }
}

/** Announces a scheduled window up to 72 hours ahead, in the visitor's own time zone. */
export function MaintenanceBanner() {
  const visible = useSyncExternalStore(subscribe, snapshot, () => false);
  if (!visible || !maintenanceWindow) return null;
  const { start, end } = maintenanceWindow;

  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, start.toISOString());
    } catch {
      // Storage blocked: the banner just stays for this page view.
    }
    listeners.forEach((listener) => listener());
  };

  return (
    <div
      role="status"
      className="bg-popover text-popover-foreground fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-start gap-3 rounded-lg border p-4 text-sm shadow-lg"
    >
      <WrenchIcon aria-hidden className="text-warning mt-0.5 size-4 shrink-0" />
      <p className="flex-1">
        Scheduled maintenance on {day.format(start)}, {time.format(start)} – {time.format(end)}. The
        site will be briefly unavailable.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="hover:bg-accent -m-1 rounded-md p-1"
        aria-label="Dismiss"
      >
        <XIcon aria-hidden className="size-4" />
      </button>
    </div>
  );
}
