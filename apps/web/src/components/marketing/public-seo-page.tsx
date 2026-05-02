import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { getI18n } from "@/i18n/server";
import {
  FREELANCER_TEMPLATE_INSTALL_PATH,
  publicSeoPagesByPath,
  type PublicSeoPage
} from "@/lib/public-seo-pages";

type PublicSeoPageViewProps = {
  page: PublicSeoPage;
};

export async function PublicSeoPageView({ page }: PublicSeoPageViewProps) {
  const { locale, t } = await getI18n();

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-[#1f2933]">
      <MarketingHeader locale={locale} t={t} />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-[#20241f] sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f685f]">
            {page.lead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={FREELANCER_TEMPLATE_INSTALL_PATH}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1f2933] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
            >
              {page.primaryCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d8ded8] bg-white px-5 py-3 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
            >
              Explore templates
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-[#d9ded6] bg-white p-6 shadow-[0_8px_30px_rgba(32,36,31,0.06)]">
          <h2 className="text-base font-semibold text-[#20241f]">What this template helps with</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-[#5f685f]">
            {page.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-[#176b52]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="border-y border-[#d8ded8] bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-md border border-[#edf1ec] bg-[#fbfbf8] p-6">
              <h2 className="text-lg font-semibold tracking-normal text-[#20241f]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f685f]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
              Related templates
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-[#20241f]">
              Keep exploring the workspace structure.
            </h2>
          </div>
          <Link href="/templates" className="text-sm font-semibold text-[#176b52] hover:text-[#0f4f43]">
            View all templates
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.relatedPaths.map((path) => {
            const related = publicSeoPagesByPath[path];

            return (
              <Link
                key={path}
                href={related.path}
                className="rounded-md border border-[#d9ded6] bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(32,36,31,0.08)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176b52]">
                  {related.eyebrow}
                </span>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[#20241f]">{related.h1}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f685f]">{related.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#1f2933] px-4 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#dfeee7]">Start with the live template</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">Build your finance workspace from structure.</h2>
          </div>
          <Link
            href={FREELANCER_TEMPLATE_INSTALL_PATH}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#eef2ee]"
          >
            {page.primaryCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <MarketingFooter locale={locale} t={t} />
    </main>
  );
}
