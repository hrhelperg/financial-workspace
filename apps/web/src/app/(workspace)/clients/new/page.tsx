import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { ClientForm } from "./client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const { locale, t } = await getI18n();

  return (
    <div className="space-y-6">
      <Link
        href={localizePath("/clients", locale)}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d] hover:text-[#1f2933]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("common.back.clients")}
      </Link>
      <PageHeader
        eyebrow={t("clients.eyebrow")}
        title={t("clients.newClient")}
        description={t("clients.newDescription")}
        actionLabel={t("clients.workspaceAction")}
        actionIcon={BriefcaseBusiness}
      />
      <Panel>
        <PanelHeader title={t("clients.detailsTitle")} description={t("clients.detailsDescription")} />
        <div className="mt-5">
          <ClientForm />
        </div>
      </Panel>
    </div>
  );
}
