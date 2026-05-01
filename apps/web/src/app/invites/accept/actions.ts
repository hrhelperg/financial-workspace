"use server";

import { redirect } from "next/navigation";
import { acceptWorkspaceInvitation } from "@/server/invitations";

export async function acceptInvitationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  if (!token) {
    redirect("/dashboard");
  }

  await acceptWorkspaceInvitation(token);
  redirect("/dashboard");
}
