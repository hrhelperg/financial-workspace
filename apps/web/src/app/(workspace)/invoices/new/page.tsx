import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { listClients } from "@/server/clients";
import { InvoiceForm } from "./invoice-form";

export const dynamic = "force-dynamic";

type NewInvoicePageProps = {
  searchParams: Promise<{
    guided?: string;
  }>;
};

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const clients = await listClients();
  const clientOptions = clients.map((client) => ({ id: client.id, name: client.name }));
  const isGuided = params.guided === "invoice";

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
            <InvoiceForm
              clients={clientOptions}
              guidedStep={isGuided ? "invoice" : undefined}
              defaultValues={
                isGuided
                  ? {
                      clientId: clientOptions[0].id,
                      direction: "incoming",
                      status: "draft",
                      terms: "Net 14",
                      notes: "First invoice drafted from the Cash Workspace onboarding checklist.",
                      items: [
                        {
                          description: "Freelance project deposit",
                          quantity: 1,
                          unitPrice: 1500,
                          taxRate: 0
                        }
                      ]
                    }
                  : undefined
              }
            />
          )}
        </div>
      </Panel>
    </div>
  );
}
