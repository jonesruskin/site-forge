import { provider, type AnalyticsWindow, type EventProps } from "./providers";

type Pending = { event: string; props?: EventProps };
const pending: Pending[] = [];
let ready = false;

/** Called by <Analytics /> once the provider script is allowed and loaded. */
export function flushAnalytics() {
  ready = true;
  for (const item of pending.splice(0)) send(item.event, item.props);
}

function send(event: string, props?: EventProps) {
  provider?.track(window as AnalyticsWindow, event, props);
}

/**
 * Records a custom event with the configured provider. Safe to call anywhere on
 * the client: events wait for consent and the script, and are dropped if
 * consent is never given. Without a provider, development logs them instead.
 *
 *   track("signup", { plan: "pro" });
 */
export function track(event: string, props?: EventProps) {
  if (typeof window === "undefined") return;
  if (!provider) {
    if (process.env.NODE_ENV === "development") {
      console.info("%c[analytics]", "font-weight:bold", event, props ?? "");
    }
    return;
  }
  if (ready) send(event, props);
  else if (pending.length < 100) pending.push({ event, props });
}
