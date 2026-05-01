import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";

const columns = [
  { key: "number", label: "Invoice" },
  { key: "client", label: "Client" },
  { key: "due", label: "Due" },
  { key: "amount", label: "Amount", align: "right" as const },
  { key: "status", label: "Status" }
];

const rows = [
  { number: "FW-1024", client: "Acme Ledger Co.", due: "May 12", amount: "$4,800", status: "Sent" },
  { number: "FW-1023", client: "Pine Labs", due: "May 16", amount: "$6,400", status: "Draft" },
  { number: "FW-1022", client: "Northstar Studio", due: "Apr 28", amount: "$2,150", status: "Paid" },
  { number: "FW-1021", client: "Acme Ledger Co.", due: "Apr 24", amount: "$8,000", status: "Overdue" }
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="18 open invoices, 7 due this month, 2 overdue."
        actionLabel="Create invoice"
        actionIcon={Plus}
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
