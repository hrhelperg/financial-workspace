import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND_NAME } from "@financial-workspace/core";
import { getAppUrl, getLocalizedAlternates, locales } from "@/i18n/config";
import { getI18n, getRequestPathname } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [{ locale, t }, pathname] = await Promise.all([getI18n(), getRequestPathname()]);
  const baseUrl = getAppUrl();
  const alternates = getLocalizedAlternates(pathname);
  const canonicalUrl = new URL(alternates[locale], baseUrl);
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        [
          ...locales.map((nextLocale) => [nextLocale, new URL(alternates[nextLocale], baseUrl).toString()]),
          ["x-default", new URL(alternates.en, baseUrl).toString()]
        ]
      )
    },
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      description,
      locale,
      siteName: BRAND_NAME,
      title,
      type: "website",
      url: canonicalUrl
    },
    title: {
      default: title,
      template: `%s · ${BRAND_NAME}`
    },
    twitter: {
      card: "summary_large_image",
      description,
      title
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
