import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";

const columns = [
  { key: "vendor", label: "Vendor" },
  { key: "category", label: "Category" },
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", align: "right" as const },
  { key: "status", label: "Status" }
];

const rows = [
  { vendor: "Cloudline", category: "Hosting", date: "May 1", amount: "$382", status: "Matched" },
  { vendor: "Figma", category: "Software", date: "Apr 29", amount: "$96", status: "Approved" },
  { vendor: "OpenAI", category: "AI tools", date: "Apr 28", amount: "$240", status: "Pending" },
  { vendor: "Linear", category: "Software", date: "Apr 25", amount: "$80", status: "Approved" }
];

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Spend"
        title="Expenses"
        description="$12,430 logged this month across 9 vendors."
        actionLabel="Add expense"
        actionIcon={Plus}
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
