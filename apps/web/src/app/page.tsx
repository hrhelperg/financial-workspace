import Link from "next/link";
import { BarChart3, BriefcaseBusiness, FolderOpen, ReceiptText, WalletCards, Zap } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

export default async function HomePage() {
  const { locale, t } = await getI18n();
  const features = [
    { icon: BriefcaseBusiness, text: t("landing.clients") },
    { icon: ReceiptText, text: t("landing.invoices") },
    { icon: BarChart3, text: t("landing.cashflow") },
    { icon: FolderOpen, text: t("landing.documents") }
  ];

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#1f2933]">
      <header className="border-b border-[#d8ded8] bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex items-center gap-3" href={localizePath("/", locale)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f766e] text-white">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">{t("brand.name")}</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">{t("landing.eyebrow")}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-[#1f2933] sm:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#58645d]">{t("landing.description")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1f2933] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
              href={localizePath("/dashboard", locale)}
            >
              {t("landing.primaryCta")}
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8ded8] bg-white px-5 py-3 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
              href={localizePath("/login", locale)}
            >
              {t("landing.secondaryCta")}
            </Link>
          </div>
        </div>

        <section className="rounded-md border border-[#d8ded8] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold tracking-normal">{t("landing.cardsTitle")}</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {features.map(({ icon: Icon, text }) => (
              <div className="flex gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4" key={text}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
                <p className="text-sm leading-6 text-[#58645d]">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
