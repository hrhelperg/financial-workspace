import "server-only";
import { headers } from "next/headers";
import { createTranslator, getDictionary } from "./messages";
import { defaultLocale, isLocale, localeHeaderName, pathnameHeaderName, type Locale } from "./config";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const locale = headerStore.get(localeHeaderName);
  return isLocale(locale) ? locale : defaultLocale;
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return headerStore.get(pathnameHeaderName) ?? "/";
}

export async function getI18n() {
  const locale = await getRequestLocale();

  return {
    dictionary: getDictionary(locale),
    locale,
    t: createTranslator(locale)
  };
}
