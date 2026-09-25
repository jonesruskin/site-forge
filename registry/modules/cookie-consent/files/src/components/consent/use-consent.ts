"use client";

import { useSyncExternalStore } from "react";

import { CONSENT_EVENT, readConsentCookie, type Consent } from "@/lib/consent/consent";

function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  return () => window.removeEventListener(CONSENT_EVENT, callback);
}

let cached: { raw: string; value: Consent | null } = { raw: "", value: null };
function snapshot() {
  const raw = document.cookie;
  if (raw !== cached.raw) cached = { raw, value: readConsentCookie() };
  return cached.value;
}

/**
 * Current consent: `undefined` while unknown (server render, hydration), `null`
 * when the visitor hasn't chosen yet, otherwise their choice.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribe, snapshot, () => undefined);
}
