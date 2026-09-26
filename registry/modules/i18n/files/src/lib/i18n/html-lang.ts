import { getLocale } from "next-intl/server";

/** Keeps <html lang> in step with the chosen language (screen readers, hyphenation, search). */
export const i18nHtmlLang = () => getLocale();
