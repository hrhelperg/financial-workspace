import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { signInWithPasswordAction, signUpWithPasswordAction } from "./actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SupabaseAuthInitializer } from "@/components/supabase-auth-initializer";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/server/workspace";
import { hasSupabaseAuthConfig } from "@/server/supabase";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const fallbackNext = localizePath("/dashboard", locale);
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : fallbackNext;
  const isAuthConfigured = hasSupabaseAuthConfig();
  const user = isAuthConfigured ? await getCurrentUser() : null;

  if (user) {
    redirect(next);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
      <SupabaseAuthInitializer />
      <section className="w-full max-w-md rounded-md border border-[#d8ded8] bg-white p-6 shadow-sm">
        <div className="mb-5 flex justify-end">
          <LanguageSwitcher compact />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">{t("brand.name")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">{t("auth.title")}</h1>
          <p className="mt-2 text-sm leading-6 text-[#647067]">
            {t("auth.description")}
          </p>
        </div>

        {!isAuthConfigured ? (
          <div className="mt-5 rounded-md border border-[#fff0cc] bg-[#fffaf0] p-4 text-sm leading-6 text-[#6f4b00]">
            {t("auth.notConfigured")}
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-5 rounded-md border border-[#ffd6de] bg-[#fff5f7] p-4 text-sm text-[#9f1239]">
            {params.error}
          </div>
        ) : null}

        {params.message ? (
          <div className="mt-5 rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4 text-sm text-[#0f5f59]">
            {params.message}
          </div>
        ) : null}

        <form className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">{t("common.labels.email")}</span>
            <input
              required
              name="email"
              type="email"
              className="mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
              placeholder={t("auth.emailPlaceholder")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">{t("common.labels.password")}</span>
            <input
              required
              name="password"
              type="password"
              className="mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              formAction={signInWithPasswordAction}
              className="rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
            >
              {t("auth.signIn")}
            </button>
            <button
              formAction={signUpWithPasswordAction}
              className="rounded-md border border-[#d8ded8] bg-white px-4 py-2 text-sm font-semibold text-[#1f2933] transition-colors hover:bg-[#f8faf7]"
            >
              {t("auth.signUp")}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
