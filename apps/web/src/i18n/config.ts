export const locales = ["en", "fr", "es", "de", "pt", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeHeaderName = "x-financial-locale";
export const pathnameHeaderName = "x-financial-pathname";
export const localeCookieName = "fw_locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский"
};

const localeSet = new Set<string>(locales);

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && localeSet.has(value));
}

function splitPathAndSuffix(path: string) {
  const queryIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  const suffixIndex =
    queryIndex === -1 ? hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);

  if (suffixIndex === -1) {
    return { pathname: path, suffix: "" };
  }

  return { pathname: path.slice(0, suffixIndex), suffix: path.slice(suffixIndex) };
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : defaultLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);

  if (isLocale(parts[0])) {
    const stripped = `/${parts.slice(1).join("/")}`;
    return stripped === "/" ? "/" : stripped.replace(/\/$/, "") || "/";
  }

  return pathname || "/";
}

export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("/api")) {
    return path;
  }

  const { pathname, suffix } = splitPathAndSuffix(path);
  const stripped = stripLocaleFromPathname(pathname);

  if (locale === defaultLocale) {
    return `${stripped}${suffix}`;
  }

  return `${stripped === "/" ? `/${locale}` : `/${locale}${stripped}`}${suffix}`;
}

export function getLocalizedAlternates(pathname: string) {
  const stripped = stripLocaleFromPathname(pathname);
  return Object.fromEntries(locales.map((locale) => [locale, localizePath(stripped, locale)])) as Record<Locale, string>;
}

export function getAppUrl() {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim();
  if (domain) {
    return domain.startsWith("http://") || domain.startsWith("https://") ? domain : `https://${domain}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "https://financial-workspace-web.vercel.app";
}
