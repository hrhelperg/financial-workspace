"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslator } from "@/i18n/client";
import { localeNames, locales, localizePath } from "@/i18n/config";

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const activeLocale = useLocale();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const t = useTranslator();
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          {t("language.label")}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-1">
        {locales.map((locale) => {
          const active = locale === activeLocale;
          const label = localeNames[locale];

          return (
            <Link
              aria-current={active ? "true" : undefined}
              aria-label={t("language.switchTo", { language: label })}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-1 rounded-md border px-2.5 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "border-[#1f2933] bg-[#1f2933] text-white"
                  : "border-[#d8ded8] bg-white text-[#58645d] hover:bg-[#f8faf7] hover:text-[#1f2933]"
              )}
              href={localizePath(`${pathname}${suffix}`, locale)}
              key={locale}
            >
              {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {locale.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
