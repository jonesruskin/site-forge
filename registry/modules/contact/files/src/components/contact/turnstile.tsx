"use client";

import Script from "next/script";

/** Cloudflare Turnstile widget. Renders nothing unless a site key is configured. */
export function Turnstile({ siteKey }: { siteKey?: string }) {
  if (!siteKey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="auto" data-size="flexible" />
    </>
  );
}
