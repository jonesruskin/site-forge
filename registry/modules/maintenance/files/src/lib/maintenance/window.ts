/** A scheduled window from "2026-10-01T02:00:00Z/2026-10-01T03:00:00Z", or null. */
export function parseWindow(value: string | undefined) {
  if (!value) return null;
  const [start, end] = value.split("/").map((part) => new Date(part.trim()));
  if (
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  )
    return null;
  return { start, end };
}

export const maintenanceWindow = parseWindow(process.env.NEXT_PUBLIC_MAINTENANCE_WINDOW);

/** Announce this long before the window starts. */
export const ANNOUNCE_MS = 72 * 3_600_000;
