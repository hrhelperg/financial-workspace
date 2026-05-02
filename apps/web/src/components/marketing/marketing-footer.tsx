import Link from "next/link";
import { resolveBrandingDomain } from "@financial-workspace/core";
import { FREELANCER_TEMPLATE_SLUG } from "@financial-workspace/core/templates";
import { localizePath, type Locale } from "@/i18n/config";
import type { Translator } from "@/i18n/messages";

type MarketingFooterProps = {
  locale: Locale;
  t: Translator;
};

export function MarketingFooter({ locale, t }: MarketingFooterProps) {
  const year = new Date().getUTCFullYear();
  const domain = resolveBrandingDomain();

  const productLinks: Array<{ href: string; label: string }> = [
    { href: localizePath("/dashboard", locale), label: t("landing.footer.links.dashboard") },
    { href: localizePath("/invoices", locale), label: t("landing.footer.links.invoices") },
    { href: localizePath("/expenses", locale), label: t("landing.footer.links.expenses") },
    { href: localizePath("/cashflow/forecast", locale), label: t("landing.footer.links.forecast") }
  ];

  const templateLinks: Array<{ href: string; label: string; live?: boolean }> = [
    {
      href: localizePath(`/login?next=/templates/${FREELANCER_TEMPLATE_SLUG}/install`, locale),
      label: t("templates.cards.freelancer.name"),
      live: true
    },
    { href: "#templates", label: t("templates.cards.smallBusiness.name") },
    { href: "#templates", label: t("templates.cards.agency.name") },
    { href: "#templates", label: t("templates.cards.taxExport.name") },
    { href: "#templates", label: t("templates.cards.forecast.name") }
  ];

  return (
    <footer className="border-t border-[#d8ded8] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f2933]">
              {t("landing.footer.product")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link className="text-[#58645d] hover:text-[#1f2933]" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f2933]">
              {t("landing.footer.templates")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {templateLinks.map((link) => (
                <li key={link.label}>
                  {link.live ? (
                    <Link className="text-[#58645d] hover:text-[#1f2933]" href={link.href}>
                      {link.label}
                    </Link>
                  ) : (
                    <a className="text-[#647067]" href={link.href}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f2933]">
              {t("landing.footer.company")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#58645d]">
              <li>{t("landing.footer.links.about")}</li>
              <li>{t("landing.footer.links.contact")}</li>
              <li>{t("landing.footer.links.privacy")}</li>
              <li>{t("landing.footer.links.terms")}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f2933]">
              {t("landing.footer.resources")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#58645d]">
              <li>{t("landing.footer.links.changelog")}</li>
              <li>{t("landing.footer.links.status")}</li>
              <li>{t("landing.footer.links.roadmap")}</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-[#edf1ec] pt-6 text-center text-xs text-[#647067]">
          {t("landing.footer.copyright", { year, domain })}
        </p>
      </div>
    </footer>
  );
}
