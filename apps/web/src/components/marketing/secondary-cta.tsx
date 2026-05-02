import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localizePath, type Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/messages";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";

type SecondaryCtaProps = {
  locale: Locale;
  t: Translator;
};

export function SecondaryCta({ locale, t }: SecondaryCtaProps) {
  const installFreelancer = localizePath(
    `/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`,
    locale
  );

  return (
    <section className="bg-[#f6f7f2]">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-lg border border-[#d8ded8] bg-white p-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1f2933] sm:text-4xl">
            {t("landing.secondaryCta.headline")}
          </h2>
          <p className="mt-3 text-base text-[#58645d]">{t("landing.secondaryCta.subheadline")}</p>
          <Link
            href={installFreelancer}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1f2933] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
          >
            {t("landing.secondaryCta.cta")}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
