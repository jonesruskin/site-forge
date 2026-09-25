"use client";

import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { i18nConfig } from "@/i18n/config";
import { setLocaleAction } from "@/lib/i18n/actions";

/** Compact language picker for the header. Hidden when only one language is configured. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const [pending, startTransition] = useTransition();
  if (i18nConfig.locales.length < 2) return null;

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t("switchLanguage")}</span>
      <LanguagesIcon
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute left-2.5 size-4"
      />
      <select
        value={locale}
        disabled={pending}
        onChange={(event) => startTransition(() => setLocaleAction(event.target.value))}
        className="hover:bg-accent focus-visible:ring-ring h-9 cursor-pointer appearance-none rounded-md bg-transparent pr-2.5 pl-8 text-sm outline-none field-sizing-content focus-visible:ring-2 disabled:opacity-50"
      >
        {i18nConfig.locales.map((code) => (
          <option key={code} value={code} lang={code}>
            {i18nConfig.labels[code] ?? code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
