"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/server/supabase";

function getRedirectPath(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function redirectWithError(message: string, next: string) {
  const params = new URLSearchParams({
    error: message,
    next
  });

  redirect(`/login?${params.toString()}`);
}

export async function signInWithPasswordAction(formData: FormData) {
  const next = getRedirectPath(formData);

  if (!hasSupabaseAuthConfig()) {
    redirectWithError("Supabase Auth is not configured for this environment.", next);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError("Email and password are required.", next);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError(error.message, next);
  }

  redirect(next);
}

export async function signUpWithPasswordAction(formData: FormData) {
  const next = getRedirectPath(formData);

  if (!hasSupabaseAuthConfig()) {
    redirectWithError("Supabase Auth is not configured for this environment.", next);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithError("Email and password are required.", next);
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
    redirectWithError(error.message, next);
  }

  if (data.session) {
    redirect(next);
  }

  const params = new URLSearchParams({
    message: "Check your email to confirm your account.",
    next
  });

  redirect(`/login?${params.toString()}`);
}
