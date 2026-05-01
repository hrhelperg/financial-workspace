import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentWorkspace } from "@/server/workspace";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
