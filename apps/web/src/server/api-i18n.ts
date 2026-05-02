import "server-only";
import { defaultLocale, isLocale, localeCookieName, localeHeaderName, type Locale } from "@/i18n/config";
import { createTranslator } from "@/i18n/messages";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

export function getApiLocale(request: Request): Locale {
  const headerLocale = request.headers.get(localeHeaderName);
  if (isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieLocale = getCookieValue(request.headers.get("cookie"), localeCookieName);
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

export function getApiTranslator(request: Request) {
  return createTranslator(getApiLocale(request));
}
