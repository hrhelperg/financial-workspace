import Link from "next/link";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { getI18n } from "@/i18n/server";
import { formatCurrency, formatDate } from "@/server/format";
import { getFiscalExportPackage } from "@/server/fiscal-export";

export const dynamic = "force-dynamic";

const directionTones = {
  incoming: "blue",
  outgoing: "rose"
} as const;

export default async function DocumentsExportPage() {
  const { locale, t } = await getI18n();
  const fiscalPackage = await getFiscalExportPackage();
  const populatedFolders = fiscalPackage.folders.filter((folder) => folder.invoiceCount > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("documents.eyebrow")}
        title={t("documents.fiscalExport")}
        description={t("documents.exportDescription")}
      />

      <Panel>
        <PanelHeader
          title={t("documents.folderStructure")}
          description={t("documents.folderStructureDescription")}
        />
        <div className="mt-5 overflow-x-auto">
          {fiscalPackage.folders.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
              {t("documents.noFolders")}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
              <thead>
                <tr className="text-left text-[#58645d]">
                  <th className="whitespace-nowrap py-3 pr-4 font-semibold">{t("documents.folder")}</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">{t("common.labels.direction")}</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">{t("invoices.title")}</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">{t("common.labels.total")}</th>
                  <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">{t("documents.export")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ec]">
                {fiscalPackage.folders.map((folder) => (
                  <tr key={folder.path}>
                    <td className="whitespace-nowrap py-4 pr-4 font-semibold text-[#1f2933]">{folder.path}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusPill tone={directionTones[folder.direction]}>
                        {folder.direction === "incoming" ? t("invoices.incoming") : t("invoices.outgoing")}
                      </StatusPill>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-[#1f2933]">{folder.invoiceCount}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                      {formatCurrency(folder.totalAmount, "USD", locale)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 text-right">
                      <Link
                        className="font-semibold text-[#0f766e] hover:text-[#1f2933]"
                        href={`/api/export?year=${folder.fiscalYear}`}
                      >
                        {t("common.actions.downloadYear")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title={t("documents.invoiceMetadata")} description={t("documents.invoiceMetadataDescription")} />
        <div className="mt-5 space-y-5">
          {populatedFolders.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
              {t("documents.noMetadata")}
            </div>
          ) : (
            populatedFolders.map((folder) => (
              <div key={`${folder.path}:invoices`}>
                <h2 className="text-sm font-semibold text-[#1f2933]">{folder.path}</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#edf1ec] text-sm">
                    <thead>
                      <tr className="text-left text-[#58645d]">
                        <th className="whitespace-nowrap py-2 pr-4 font-semibold">{t("invoices.invoice")}</th>
                        <th className="whitespace-nowrap px-4 py-2 font-semibold">{t("documents.issued")}</th>
                        <th className="whitespace-nowrap px-4 py-2 font-semibold">{t("documents.storagePath")}</th>
                        <th className="whitespace-nowrap py-2 pl-4 text-right font-semibold">
                          {t("common.labels.total")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1ec]">
                      {folder.invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="whitespace-nowrap py-3 pr-4 font-semibold text-[#1f2933]">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#1f2933]">
                            {formatDate(invoice.issueDate, locale)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#58645d]">
                            {invoice.storagePath ?? t("documents.pendingDocumentPath")}
                          </td>
                          <td className="whitespace-nowrap py-3 pl-4 text-right font-semibold text-[#1f2933]">
                            {formatCurrency(invoice.totalAmount, invoice.currency, locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
