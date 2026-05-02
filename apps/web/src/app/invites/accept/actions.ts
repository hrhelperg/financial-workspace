"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { acceptWorkspaceInvitation } from "@/server/invitations";

export async function acceptInvitationAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const token = String(formData.get("token") ?? "");

  if (!token) {
    redirect(localizePath("/dashboard", locale));
  }

  await acceptWorkspaceInvitation(token);
  redirect(localizePath("/dashboard", locale));
}
