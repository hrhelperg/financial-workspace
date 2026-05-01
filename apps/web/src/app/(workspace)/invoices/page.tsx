import { Plus } from "lucide-react";
import { InvoicesTable } from "@/components/invoices-table";
import { PageHeader } from "@/components/page-header";
import { listInvoices } from "@/server/invoices";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await listInvoices();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Track invoice status, due dates, and outstanding balance."
        actionLabel="New invoice"
        actionIcon={Plus}
        actionHref="/invoices/new"
      />
      <InvoicesTable invoices={invoices} />
    </div>
  );
}
