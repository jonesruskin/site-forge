"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { i18nConfig, LOCALE_COOKIE } from "@/i18n/config";

export async function setLocaleAction(locale: string) {
  if (!i18nConfig.locales.includes(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
