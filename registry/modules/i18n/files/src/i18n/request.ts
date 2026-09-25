import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { i18nConfig, LOCALE_COOKIE } from "./config";
import { negotiateLocale } from "./negotiate";

/**
 * The locale for this request: the visitor's saved choice, else their browser's
 * preference, else the default. URLs stay the same in every language.
 */
export default getRequestConfig(async () => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale =
    saved && i18nConfig.locales.includes(saved)
      ? saved
      : negotiateLocale(
          (await headers()).get("accept-language"),
          i18nConfig.locales,
          i18nConfig.defaultLocale,
        );

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
