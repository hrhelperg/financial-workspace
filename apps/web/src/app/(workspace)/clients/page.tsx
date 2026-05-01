import { BriefcaseBusiness } from "lucide-react";
import { ClientsMvp } from "@/components/clients-mvp";
import { PageHeader } from "@/components/page-header";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Manage billing relationships, contacts, receivables, and client operating context."
        actionLabel="Client workspace"
        actionIcon={BriefcaseBusiness}
      />
      <ClientsMvp />
    </div>
  );
}
