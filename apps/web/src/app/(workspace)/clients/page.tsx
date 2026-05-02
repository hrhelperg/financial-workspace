import { Plus } from "lucide-react";
import { ClientsTable } from "@/components/clients-table";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { listClients } from "@/server/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { locale, t } = await getI18n();
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("clients.eyebrow")}
        title={t("clients.title")}
        description={t("clients.description")}
        actionLabel={t("clients.newClient")}
        actionIcon={Plus}
        actionHref={localizePath("/clients/new", locale)}
      />
      <ClientsTable clients={clients} locale={locale} />
    </div>
  );
}
