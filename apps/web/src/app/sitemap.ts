import type { MetadataRoute } from "next";
import { getAppUrl, locales, localizePath } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  return locales.map((locale) => ({
    alternates: {
      languages: Object.fromEntries([
        ...locales.map((nextLocale) => [nextLocale, `${baseUrl}${localizePath("/", nextLocale)}`]),
        ["x-default", `${baseUrl}${localizePath("/", "en")}`]
      ])
    },
    changeFrequency: "weekly",
    lastModified: new Date(),
    priority: locale === "en" ? 1 : 0.9,
    url: `${baseUrl}${localizePath("/", locale)}`
  }));
}
