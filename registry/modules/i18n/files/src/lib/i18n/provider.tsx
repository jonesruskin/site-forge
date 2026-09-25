import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

/** Makes the request's locale and messages available to client components (useTranslations). */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
