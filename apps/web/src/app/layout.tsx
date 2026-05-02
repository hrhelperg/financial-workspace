import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAppUrl, getLocalizedAlternates, locales } from "@/i18n/config";
import { getI18n, getRequestPathname } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [{ locale, t }, pathname] = await Promise.all([getI18n(), getRequestPathname()]);
  const baseUrl = getAppUrl();
  const alternates = getLocalizedAlternates(pathname);

  return {
    alternates: {
      canonical: new URL(alternates[locale], baseUrl),
      languages: Object.fromEntries(
        [
          ...locales.map((nextLocale) => [nextLocale, new URL(alternates[nextLocale], baseUrl).toString()]),
          ["x-default", new URL(alternates.en, baseUrl).toString()]
        ]
      )
    },
    description: t("meta.description"),
    metadataBase: new URL(baseUrl),
    title: {
      default: t("meta.title"),
      template: `%s · ${t("meta.title")}`
    }
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale } = await getI18n();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
