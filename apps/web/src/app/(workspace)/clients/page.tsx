import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";

const columns = [
  { key: "name", label: "Client" },
  { key: "contact", label: "Contact" },
  { key: "balance", label: "Balance", align: "right" as const },
  { key: "status", label: "Status" }
];

const rows = [
  { name: "Acme Ledger Co.", contact: "maria@acme.example", balance: "$12,800", status: "Active" },
  { name: "Northstar Studio", contact: "finance@northstar.example", balance: "$2,150", status: "Active" },
  { name: "Harbor Advisory", contact: "ops@harbor.example", balance: "$0", status: "Onboarding" },
  { name: "Pine Labs", contact: "ap@pine.example", balance: "$6,400", status: "Review" }
];

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="42 accounts, 6 open balances, 3 onboarding reviews."
        actionLabel="Add client"
        actionIcon={Plus}
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
