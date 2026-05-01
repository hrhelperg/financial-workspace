import "server-only";
import type { WorkspaceInvitation } from "@financial-workspace/db";

export type WorkspaceInviteEmail = {
  invitation: WorkspaceInvitation;
  workspaceName: string;
  inviteUrl: string;
};

export async function sendWorkspaceInviteEmail({ invitation, workspaceName, inviteUrl }: WorkspaceInviteEmail) {
  if (process.env.NODE_ENV !== "production") {
    console.info("[workspace-invite]", {
      email: invitation.email,
      role: invitation.role,
      workspaceName,
      inviteUrl
    });
  }

  return { queued: false };
}
