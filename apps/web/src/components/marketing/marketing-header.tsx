import Link from "next/link";
import { WalletCards } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localizePath, type Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/messages";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";

type MarketingHeaderProps = {
  locale: Locale;
  t: Translator;
};

export function MarketingHeader({ locale, t }: MarketingHeaderProps) {
  const installFreelancer = localizePath(`/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`, locale);
  const signIn = localizePath("/login", locale);
  const signUp = localizePath(`/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`, locale);

  return (
    <header className="border-b border-[#d8ded8] bg-white/90 px-4 py-4 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href={localizePath("/", locale)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0f766e] text-white">
            <WalletCards aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold">{t("brand.name")}</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <a
            href="#templates"
            className="px-3 py-2 text-sm font-medium text-[#58645d] transition-colors hover:text-[#1f2933]"
          >
            {t("templates.title")}
          </a>
          <a
            href="#features"
            className="px-3 py-2 text-sm font-medium text-[#58645d] transition-colors hover:text-[#1f2933]"
          >
            {t("landing.header.product")}
          </a>
          <Link
            href={signIn}
            className="ml-2 inline-flex min-h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
          >
            {t("landing.header.signIn")}
          </Link>
          <Link
            href={signUp}
            className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
          >
            {t("landing.header.getStarted")}
          </Link>
          <Link
            href={installFreelancer}
            className="ml-1 inline-flex min-h-9 items-center justify-center rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
          >
            {t("landing.header.useFreelancerTemplate")}
          </Link>
          <span className="ml-2">
            <LanguageSwitcher compact />
          </span>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href={installFreelancer}
            className="inline-flex min-h-9 items-center justify-center rounded-md bg-[#1f2933] px-3 py-2 text-xs font-semibold text-white"
          >
            {t("landing.header.useFreelancerTemplate")}
          </Link>
          <LanguageSwitcher compact />
        </div>
      </div>
    </header>
  );
}
