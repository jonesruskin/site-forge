"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { analyticsConsent, CONSENT_EVENT, needsConsent } from "@/lib/analytics/consent";
import { provider } from "@/lib/analytics/providers";
import { flushAnalytics } from "@/lib/analytics/track";

/** Loads the configured analytics script once it's allowed to run. Renders nothing visible. */
export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!provider) return;
    const update = () => setAllowed(!needsConsent(provider!) || analyticsConsent());
    const frame = requestAnimationFrame(update);
    window.addEventListener(CONSENT_EVENT, update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(CONSENT_EVENT, update);
    };
  }, []);

  if (!provider || !allowed) return null;
  const { script } = provider;
  return (
    <>
      {script.inline && (
        <Script id={`analytics-${provider.id}-init`} strategy="afterInteractive">
          {script.inline}
        </Script>
      )}
      <Script
        src={script.src}
        strategy="afterInteractive"
        onReady={flushAnalytics}
        {...script.attributes}
      />
    </>
  );
}
