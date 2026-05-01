"use server";

import { redirect } from "next/navigation";
import { createWorkspaceInvitation } from "@/server/invitations";
import type { WorkspaceRole } from "@/server/workspace";

const inviteRoles = ["admin", "member", "viewer"] as const satisfies readonly WorkspaceRole[];

export async function createTeamInvitationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") as WorkspaceRole;

  if (!email || !inviteRoles.includes(role as (typeof inviteRoles)[number])) {
    redirect("/settings/team/invite?error=Enter%20a%20valid%20email%20and%20role.");
  }

  try {
    const { inviteUrl } = await createWorkspaceInvitation({ email, role });
    const params = new URLSearchParams({
      inviteUrl
    });

    redirect(`/settings/team/invite?${params.toString()}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create invitation.";
    const params = new URLSearchParams({
      error: message
    });

    redirect(`/settings/team/invite?${params.toString()}`);
  }
}
