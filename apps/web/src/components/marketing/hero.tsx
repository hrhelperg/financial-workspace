import Link from "next/link";
import { ArrowRight, BarChart3, FolderOpen, ReceiptText, WalletCards } from "lucide-react";
import { localizePath, type Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/messages";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";

type HeroProps = {
  locale: Locale;
  t: Translator;
};

export function Hero({ locale, t }: HeroProps) {
  const installFreelancer = localizePath(
    `/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`,
    locale
  );

  const previewItems = [
    { icon: WalletCards, label: t("nav.invoices"), value: "$12,840" },
    { icon: ReceiptText, label: t("nav.expenses"), value: "$3,210" },
    { icon: BarChart3, label: t("nav.cashflow"), value: "+$9,630" },
    { icon: FolderOpen, label: t("nav.documents"), value: t("landing.hero.previewFiles") }
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          {t("landing.hero.eyebrow")}
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-[#20241f] sm:text-6xl">
          {t("landing.hero.title")}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f685f]">
          {t("landing.hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={installFreelancer}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1f2933] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
          >
            {t("landing.hero.primaryCta")}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <a
            href="#templates"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8ded8] bg-white px-5 py-3 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
          >
            {t("landing.hero.secondaryCta")}
          </a>
        </div>
      </div>

      <section
        aria-hidden="true"
        className="mt-12 rounded-lg border border-[#d9ded6] bg-white p-4 shadow-[0_8px_30px_rgba(32,36,31,0.06)] sm:p-6"
      >
        <div className="flex flex-col gap-3 border-b border-[#edf1ec] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
              {t("landing.hero.previewTitle")}
            </span>
            <p className="mt-1 text-sm text-[#5f685f]">{t("landing.hero.previewSubtitle")}</p>
          </div>
          <span className="w-fit rounded-full border border-[#d9ded6] bg-[#fbfbf8] px-3 py-1 text-xs font-medium text-[#5f685f]">
            2026
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {previewItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-md border border-[#edf1ec] bg-[#fbfbf8] p-4"
            >
              <div className="flex items-center gap-2">
                <Icon aria-hidden="true" className="h-4 w-4 text-[#0f766e]" />
                <span className="text-xs font-medium text-[#647067]">{label}</span>
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-[#1f2933]">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {[t("landing.hero.previewFolderIncoming"), t("landing.hero.previewFolderOutgoing")].map((folder) => (
            <div key={folder} className="rounded-md border border-[#edf1ec] bg-white px-4 py-3 font-mono text-xs text-[#5f685f]">
              {folder}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
