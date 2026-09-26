/**
 * The consent contract. Other modules (analytics, marketing pixels) read the
 * `site_consent` cookie or listen for the `site:consent` event: they never
 * import this module, so it stays optional.
 *
 *   cookie  site_consent = {"v":1,"analytics":true,"marketing":false,"at":"2026-…"}
 *   event   window "site:consent" → CustomEvent<Consent>
 *   reopen  any link to #cookie-settings, or window "site:consent:open"
 */
export const CONSENT_COOKIE = "site_consent";
export const CONSENT_EVENT = "site:consent";
export const CONSENT_OPEN_EVENT = "site:consent:open";
export const CONSENT_VERSION = 1;

export type ConsentCategory = "analytics" | "marketing";
export type Consent = { v: number; analytics: boolean; marketing: boolean; at: string };

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<Consent>;
    if (value.v !== CONSENT_VERSION) return null;
    return {
      v: CONSENT_VERSION,
      analytics: !!value.analytics,
      marketing: !!value.marketing,
      at: String(value.at ?? ""),
    };
  } catch {
    return null;
  }
}

export function readConsentCookie(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match?.slice(CONSENT_COOKIE.length + 1));
}

export function writeConsentCookie(choice: Pick<Consent, "analytics" | "marketing">) {
  const consent: Consent = { v: CONSENT_VERSION, ...choice, at: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
  return consent;
}
