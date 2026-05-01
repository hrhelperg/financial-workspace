import { ReceiptText } from "lucide-react";
import { InvoicesMvp } from "@/components/invoices-mvp";
import { PageHeader } from "@/components/page-header";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        description="Create itemized invoices, track payment state, and keep collection work visible."
        actionLabel="Invoice workspace"
        actionIcon={ReceiptText}
      />
      <InvoicesMvp />
    </div>
  );
}
