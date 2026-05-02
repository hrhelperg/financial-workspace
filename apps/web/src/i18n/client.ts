"use client";

import { usePathname } from "next/navigation";
import { createTranslator } from "./messages";
import { getLocaleFromPathname, localizePath, type Locale } from "./config";

export function useLocale(): Locale {
  return getLocaleFromPathname(usePathname() || "/");
}

export function useTranslator() {
  return createTranslator(useLocale());
}

export function useLocalizedPath() {
  const locale = useLocale();

  return (path: string) => localizePath(path, locale);
}
