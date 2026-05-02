import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, FileSpreadsheet, FileStack, ReceiptText } from "lucide-react";
import { localizePath, type Locale } from "@/i18n/config";
import type { MessageKey, Translator } from "@/i18n/messages";
import type { LandingTemplateCard } from "./landing-templates-data";

const ICONS = {
  freelancer: Briefcase,
  small_business: ReceiptText,
  agency: BarChart3,
  tax_export: FileStack,
  forecast: FileSpreadsheet
} as const;

type TemplateCardProps = {
  card: LandingTemplateCard;
  locale: Locale;
  t: Translator;
};

export function TemplateCard({ card, locale, t }: TemplateCardProps) {
  const Icon = ICONS[card.iconKey];
  const installHref = localizePath(`/login?next=/templates/${card.slug}/install`, locale);
  const isLive = card.state === "live";

  return (
    <article
      className={[
        "group relative flex h-full flex-col rounded-lg border bg-white p-6 transition-shadow",
        isLive
          ? "border-[#d9ded6] hover:shadow-[0_8px_24px_rgba(32,36,31,0.08)]"
          : "border-[#e6e9e2] opacity-80"
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        {!isLive ? (
          <span className="rounded-full border border-[#d8ded8] bg-[#f8faf7] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#647067]">
            {t("landing.templatesSection.comingSoon")}
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-sm font-semibold tracking-tight text-[#176b52]">
        {t(card.nameKey)}
      </h3>
      <p className="mt-2 text-xl font-semibold leading-7 tracking-tight text-[#20241f]">{t(card.headlineKey)}</p>
      <p className="mt-2 text-sm leading-6 text-[#5f685f]">{t(card.taglineKey)}</p>
      <p className="mt-3 rounded-md border border-[#e7ebe4] bg-[#fbfbf8] px-3 py-2 text-xs leading-5 text-[#5f685f]">
        {t(card.targetKey)}
      </p>

      <ul className="mt-4 space-y-1.5 text-sm text-[#5f685f]">
        {card.bulletKeys.map((key: MessageKey) => (
          <li key={key} className="flex gap-2">
            <span aria-hidden="true" className="text-[#176b52]">•</span>
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1" />

      {isLive ? (
        <Link
          href={installHref}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
        >
          {t(card.ctaKey)}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#e8ebe5] bg-[#f8faf7] px-4 py-2 text-sm font-semibold text-[#647067]">
          {t(card.ctaKey)}
        </span>
      )}
    </article>
  );
}
