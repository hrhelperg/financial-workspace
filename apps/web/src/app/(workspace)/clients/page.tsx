import { Plus } from "lucide-react";
import { ClientsTable } from "@/components/clients-table";
import { PageHeader } from "@/components/page-header";
import { listClients } from "@/server/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Manage billing relationships and contacts. The starting point for any invoice."
        actionLabel="New client"
        actionIcon={Plus}
        actionHref="/clients/new"
      />
      <ClientsTable clients={clients} />
    </div>
  );
}
