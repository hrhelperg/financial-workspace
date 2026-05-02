import type { Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/messages";
import { LANDING_TEMPLATE_CARDS } from "./landing-templates-data";
import { TemplateCard } from "./template-card";

type TemplatesPreviewProps = {
  locale: Locale;
  t: Translator;
};

export function TemplatesPreview({ locale, t }: TemplatesPreviewProps) {
  return (
    <section id="templates" className="bg-[#f6f7f2]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            {t("templates.title")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f2933] sm:text-4xl">
            {t("landing.templatesSection.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#58645d]">
            {t("landing.templatesSection.subheading")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_TEMPLATE_CARDS.map((card) => (
            <TemplateCard key={card.slug} card={card} locale={locale} t={t} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[#647067]">
          {t("landing.templatesSection.allFree")}
        </p>
      </div>
    </section>
  );
}
