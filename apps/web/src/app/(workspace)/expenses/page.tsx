import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";
import { getI18n } from "@/i18n/server";
import { requireWorkspaceMember } from "@/server/workspace";

export default async function ExpensesPage() {
  const { t } = await getI18n();
  await requireWorkspaceMember();
  const columns = [
    { key: "vendor", label: t("expenses.vendor") },
    { key: "category", label: t("expenses.category") },
    { key: "date", label: t("expenses.date") },
    { key: "amount", label: t("common.labels.amount"), align: "right" as const },
    { key: "status", label: t("common.labels.status") }
  ];
  const rows = [
    {
      vendor: "Cloudline",
      category: t("expenses.categories.hosting"),
      date: "May 1",
      amount: "$382",
      status: t("common.statuses.matched")
    },
    {
      vendor: "Figma",
      category: t("expenses.categories.software"),
      date: "Apr 29",
      amount: "$96",
      status: t("common.statuses.approved")
    },
    {
      vendor: "OpenAI",
      category: t("expenses.categories.aiTools"),
      date: "Apr 28",
      amount: "$240",
      status: t("common.statuses.pending")
    },
    {
      vendor: "Linear",
      category: t("expenses.categories.software"),
      date: "Apr 25",
      amount: "$80",
      status: t("common.statuses.approved")
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("expenses.eyebrow")}
        title={t("expenses.title")}
        description={t("expenses.description")}
        actionLabel={t("expenses.add")}
        actionIcon={Plus}
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
