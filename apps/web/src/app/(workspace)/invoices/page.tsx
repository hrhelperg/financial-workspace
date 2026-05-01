import { Plus } from "lucide-react";
import { InvoicesTable } from "@/components/invoices-table";
import { PageHeader } from "@/components/page-header";
import { listInvoices, type InvoiceDirectionFilter } from "@/server/invoices";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams: Promise<{
    direction?: string;
  }>;
};

function parseDirectionFilter(direction?: string): InvoiceDirectionFilter {
  return direction === "incoming" || direction === "outgoing" ? direction : "all";
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const direction = parseDirectionFilter(params.direction);
  const invoices = await listInvoices({ direction });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Track sales invoices, purchase invoices, due dates, and fiscal organization."
        actionLabel="New invoice"
        actionIcon={Plus}
        actionHref="/invoices/new"
      />
      <InvoicesTable activeDirection={direction} invoices={invoices} />
    </div>
  );
}
