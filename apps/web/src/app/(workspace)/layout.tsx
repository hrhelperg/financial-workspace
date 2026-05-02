import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getCurrentWorkspace } from "@/server/workspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const { locale } = await getI18n();
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect(localizePath("/login", locale));
  }

  return <AppShell locale={locale}>{children}</AppShell>;
}
