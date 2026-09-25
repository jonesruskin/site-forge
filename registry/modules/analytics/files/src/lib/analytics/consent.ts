import { installedModules } from "@/generated/modules";
import siteConfig from "@/site.config";

import type { Provider } from "./providers";

/*
 * Consent contract shared with the cookie-consent module (read, never imported):
 * the `site_consent` cookie and the `site:consent` window event.
 */
const CONSENT_COOKIE = "site_consent";
export const CONSENT_EVENT = "site:consent";

type Policy = "always" | "cookieless-exempt" | "required";

/**
 * - "required": wait for analytics consent, whatever the provider.
 * - "cookieless-exempt" (default): cookieless providers (Plausible, Umami) run without a
 *   banner decision; PostHog and GA wait for consent.
 * - "always": never wait (only if you have another legal basis).
 */
const policy: Policy =
  (siteConfig as { analytics?: { consent?: Policy } }).analytics?.consent ?? "cookieless-exempt";

/** Whether analytics consent is currently granted in this browser. */
export function analyticsConsent() {
  const raw = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return false;
  try {
    return (JSON.parse(decodeURIComponent(raw)) as { analytics?: boolean }).analytics === true;
  } catch {
    return false;
  }
}

/** Whether the provider may load without asking. Without a consent banner installed there is nobody to ask. */
export function needsConsent(provider: Provider) {
  if (policy === "always" || !installedModules.includes("cookie-consent")) return false;
  return policy === "required" || !provider.cookieless;
}
