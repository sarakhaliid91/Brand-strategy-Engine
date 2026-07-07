import { cookies } from "next/headers";
import { dictionaries, Dict } from "./dict";

export type Locale = "en" | "ar";

export const LOCALE_COOKIE = "ui_lang";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export async function getDict(): Promise<{ t: Dict; locale: Locale; dir: "ltr" | "rtl" }> {
  const locale = await getLocale();
  return { t: dictionaries[locale], locale, dir: locale === "ar" ? "rtl" : "ltr" };
}
