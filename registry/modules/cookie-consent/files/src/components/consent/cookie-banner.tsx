"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { consentConfig } from "@/lib/consent/config";
import { CONSENT_OPEN_EVENT, readConsentCookie, writeConsentCookie } from "@/lib/consent/consent";

import { useConsent } from "./use-consent";

type BannerLabels = {
  acceptAll: string;
  rejectAll: string;
  customize: string;
  save: string;
  necessary: string;
  policy: string;
};

const defaultLabels: BannerLabels = {
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  customize: "Customize",
  save: "Save choices",
  necessary: "Essential: always on",
  policy: "Cookie policy",
};

/**
 * Accept and reject have equal weight, nothing optional is pre-ticked, and
 * choices can be changed later: the patterns regulators ask for.
 */
export function CookieBanner({ labels = {} }: { labels?: Partial<BannerLabels> }) {
  const text = { ...defaultLabels, ...labels };
  const consent = useConsent();
  // Opened explicitly via #cookie-settings or the site:consent:open event.
  const [reopened, setReopened] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const titleId = useId();

  useEffect(() => {
    const reopen = () => {
      const current = readConsentCookie();
      if (current) setChoice({ analytics: current.analytics, marketing: current.marketing });
      setCustomize(true);
      setReopened(true);
    };
    const onHash = () => {
      if (location.hash !== "#cookie-settings") return;
      history.replaceState(null, "", location.pathname + location.search);
      reopen();
    };
    const initial = setTimeout(onHash, 0);
    window.addEventListener("hashchange", onHash);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    };
  }, []);

  // Unknown until hydrated; shown when no choice exists yet or when reopened.
  if (consent === undefined || (consent !== null && !reopened)) return null;

  const save = (next: { analytics: boolean; marketing: boolean }) => {
    writeConsentCookie(next);
    setChoice(next);
    setReopened(false);
    setCustomize(false);
  };

  const categories = Object.entries(consentConfig.categories).filter(([, label]) => label) as [
    "analytics" | "marketing",
    string,
  ][];

  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className="bg-popover text-popover-foreground fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border p-5 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4"
    >
      <h2 id={titleId} className="font-semibold">
        {consentConfig.title}
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {consentConfig.description}{" "}
        {consentConfig.policyHref && (
          <Link
            href={consentConfig.policyHref}
            className="text-foreground underline underline-offset-4"
          >
            {text.policy}
          </Link>
        )}
      </p>

      {customize && (
        <fieldset className="mt-4 flex flex-col gap-3 border-t pt-4">
          <legend className="sr-only">{consentConfig.title}</legend>
          <p className="text-muted-foreground text-sm">{text.necessary}</p>
          {categories.map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4 text-sm">
              <span>{label}</span>
              <Switch
                checked={choice[key]}
                onCheckedChange={(checked) => setChoice((c) => ({ ...c, [key]: checked }))}
              />
            </label>
          ))}
        </fieldset>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {customize ? (
          <Button size="sm" onClick={() => save(choice)}>
            {text.save}
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setCustomize(true)}>
            {text.customize}
          </Button>
        )}
        <div className="flex flex-1 justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => save({ analytics: false, marketing: false })}
          >
            {text.rejectAll}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => save({ analytics: true, marketing: true })}
          >
            {text.acceptAll}
          </Button>
        </div>
      </div>
    </section>
  );
}
