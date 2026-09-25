import "server-only";

import { cookies } from "next/headers";

import { CONSENT_COOKIE, parseConsent, type ConsentCategory } from "./consent";

/** Server-side check, e.g. to skip rendering a tracking script. Makes the page dynamic. */
export async function hasConsent(category: ConsentCategory) {
  const consent = parseConsent((await cookies()).get(CONSENT_COOKIE)?.value);
  return consent?.[category] ?? false;
}
