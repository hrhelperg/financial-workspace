import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { listClients } from "@/server/clients";
import { InvoiceForm } from "./invoice-form";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const clients = await listClients();
  const clientOptions = clients.map((client) => ({ id: client.id, name: client.name }));

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d] hover:text-[#1f2933]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to invoices
      </Link>
      <PageHeader
        eyebrow="Billing"
        title="New invoice"
        description="Build an itemized invoice and choose a status."
        actionLabel="Invoice workspace"
        actionIcon={ReceiptText}
      />
      <Panel>
        <PanelHeader
          title="Invoice details"
          description={
            clientOptions.length === 0
              ? "Add a client first to start invoicing."
              : "Pick a client, add line items, and set the status."
          }
        />
        <div className="mt-5">
          {clientOptions.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-5 text-sm text-[#58645d]">
              <p className="mb-3">You need at least one client before creating an invoice.</p>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
              >
                Create a client
              </Link>
            </div>
          ) : (
            <InvoiceForm clients={clientOptions} />
          )}
        </div>
      </Panel>
    </div>
  );
}
