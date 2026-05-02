"use server";

import { redirect } from "next/navigation";
import { createTranslator } from "@/i18n/messages";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/server/supabase";

function getRedirectPath(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function getActionLocale(formData: FormData) {
  const locale = String(formData.get("locale") ?? "");
  return isLocale(locale) ? locale : defaultLocale;
}

function redirectWithError(message: string, next: string, locale = defaultLocale) {
  const params = new URLSearchParams({
    error: message,
    next
  });

  redirect(localizePath(`/login?${params.toString()}`, locale));
}

export async function signInWithPasswordAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const t = createTranslator(locale);
  const next = getRedirectPath(formData);

  if (!hasSupabaseAuthConfig()) {
    redirectWithError(t("auth.authNotConfigured"), next, locale);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError(t("auth.missingCredentials"), next, locale);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError(error.message, next, locale);
  }

  redirect(next);
}

export async function signUpWithPasswordAction(formData: FormData) {
  const locale = getActionLocale(formData);
  const t = createTranslator(locale);
  const next = getRedirectPath(formData);

  if (!hasSupabaseAuthConfig()) {
    redirectWithError(t("auth.authNotConfigured"), next, locale);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError(t("auth.missingCredentials"), next, locale);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${next}`
    }
  });

  if (error) {
    redirectWithError(error.message, next, locale);
  }

  if (data.session) {
    redirect(next);
  }

  const params = new URLSearchParams({
    message: t("auth.confirmEmail"),
    next
  });

  redirect(localizePath(`/login?${params.toString()}`, locale));
}
