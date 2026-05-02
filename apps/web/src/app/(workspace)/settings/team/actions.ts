"use server";

import { redirect } from "next/navigation";
import { defaultLocale, isLocale, localizePath } from "@/i18n/config";
import { createTranslator } from "@/i18n/messages";
import { createWorkspaceInvitation } from "@/server/invitations";
import type { WorkspaceRole } from "@/server/workspace";

const inviteRoles = ["admin", "member", "viewer"] as const satisfies readonly WorkspaceRole[];

export async function createTeamInvitationAction(formData: FormData) {
  const rawLocale = String(formData.get("locale") ?? "");
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = createTranslator(locale);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") as WorkspaceRole;

  if (!email || !inviteRoles.includes(role as (typeof inviteRoles)[number])) {
    redirect(localizePath(`/settings/team/invite?error=${encodeURIComponent(t("settings.invite.invalid"))}`, locale));
  }

  try {
    const { inviteUrl } = await createWorkspaceInvitation({ email, role });
    const params = new URLSearchParams({
      inviteUrl
    });

    redirect(localizePath(`/settings/team/invite?${params.toString()}`, locale));
  } catch (error) {
    const message = error instanceof Error ? error.message : t("settings.invite.failed");
    const params = new URLSearchParams({
      error: message
    });

    redirect(localizePath(`/settings/team/invite?${params.toString()}`, locale));
  }
}
