import { FileArchive } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { requireWorkspaceMember } from "@/server/workspace";

export default async function DocumentsPage() {
  const { locale, t } = await getI18n();
  await requireWorkspaceMember();
  const columns = [
    { key: "name", label: t("documents.document") },
    { key: "type", label: t("documents.type") },
    { key: "linked", label: t("documents.linkedRecord") },
    { key: "status", label: t("common.labels.status") },
    { key: "updated", label: t("common.labels.updated") }
  ];
  const rows = [
    {
      name: "acme-master-services.pdf",
      type: t("documents.types.contract"),
      linked: "Acme Ledger Co.",
      status: t("common.statuses.ready"),
      updated: t("documents.today")
    },
    {
      name: "cloudline-receipt.pdf",
      type: t("documents.types.receipt"),
      linked: "Cloudline",
      status: t("common.statuses.parsed"),
      updated: t("documents.today")
    },
    {
      name: "fw-1024.pdf",
      type: t("documents.types.invoice"),
      linked: "FW-1024",
      status: t("common.statuses.ready"),
      updated: t("documents.yesterday")
    },
    {
      name: "pine-tax-form.pdf",
      type: t("documents.types.tax"),
      linked: "Pine Labs",
      status: t("common.statuses.review"),
      updated: "Apr 26"
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("documents.eyebrow")}
        title={t("documents.title")}
        description={t("documents.description")}
        actionLabel={t("documents.fiscalExport")}
        actionIcon={FileArchive}
        actionHref={localizePath("/documents/export", locale)}
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
