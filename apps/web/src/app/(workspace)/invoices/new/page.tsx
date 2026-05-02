import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { listClients } from "@/server/clients";
import { InvoiceForm } from "./invoice-form";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const { locale, t } = await getI18n();
  const clients = await listClients();
  const clientOptions = clients.map((client) => ({ id: client.id, name: client.name }));

  return (
    <div className="space-y-6">
      <Link
        href={localizePath("/invoices", locale)}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d] hover:text-[#1f2933]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("common.back.invoices")}
      </Link>
      <PageHeader
        eyebrow={t("invoices.eyebrow")}
        title={t("invoices.newInvoice")}
        description={t("invoices.newDescription")}
        actionLabel={t("invoices.workspaceAction")}
        actionIcon={ReceiptText}
      />
      <Panel>
        <PanelHeader
          title={t("invoices.detailsTitle")}
          description={
            clientOptions.length === 0
              ? t("invoices.detailsDescriptionNoClients")
              : t("invoices.detailsDescriptionReady")
          }
        />
        <div className="mt-5">
          {clientOptions.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-5 text-sm text-[#58645d]">
              <p className="mb-3">{t("invoices.needsClient")}</p>
              <Link
                href={localizePath("/clients/new", locale)}
                className="inline-flex items-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]"
              >
                {t("invoices.createClient")}
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
