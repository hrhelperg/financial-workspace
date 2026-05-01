import Link from "next/link";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/server/format";
import { getFiscalExportPackage } from "@/server/fiscal-export";

export const dynamic = "force-dynamic";

const directionLabels = {
  incoming: "Incoming",
  outgoing: "Outgoing"
} as const;

const directionTones = {
  incoming: "blue",
  outgoing: "rose"
} as const;

export default async function DocumentsExportPage() {
  const fiscalPackage = await getFiscalExportPackage();
  const populatedFolders = fiscalPackage.folders.filter((folder) => folder.invoiceCount > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Fiscal export"
        description="Prepare invoice folder metadata by fiscal year and money direction."
      />

      <Panel>
        <PanelHeader
          title="Folder structure"
          description="ZIP export is not enabled yet. These are the folders the export will use."
        />
        <div className="mt-5 overflow-x-auto">
          {fiscalPackage.folders.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
              No invoice folders yet. Create an invoice to prepare fiscal export metadata.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#d8ded8] text-sm">
              <thead>
                <tr className="text-left text-[#58645d]">
                  <th className="whitespace-nowrap py-3 pr-4 font-semibold">Folder</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Direction</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Invoices</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">Total</th>
                  <th className="whitespace-nowrap py-3 pl-4 text-right font-semibold">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ec]">
                {fiscalPackage.folders.map((folder) => (
                  <tr key={folder.path}>
                    <td className="whitespace-nowrap py-4 pr-4 font-semibold text-[#1f2933]">{folder.path}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusPill tone={directionTones[folder.direction]}>
                        {directionLabels[folder.direction]}
                      </StatusPill>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-[#1f2933]">{folder.invoiceCount}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-[#1f2933]">
                      {formatCurrency(folder.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 text-right">
                      <Link
                        className="font-semibold text-[#0f766e] hover:text-[#1f2933]"
                        href={`/api/export?year=${folder.fiscalYear}`}
                      >
                        Download year
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
        <PanelHeader title="Invoice metadata" description="Storage paths are saved now; PDF files come later." />
        <div className="mt-5 space-y-5">
          {populatedFolders.length === 0 ? (
            <div className="rounded-md border border-[#d8ded8] bg-[#f8faf7] p-6 text-center text-sm text-[#58645d]">
              No invoice metadata is ready yet.
            </div>
          ) : (
            populatedFolders.map((folder) => (
              <div key={`${folder.path}:invoices`}>
                <h2 className="text-sm font-semibold text-[#1f2933]">{folder.path}</h2>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#edf1ec] text-sm">
                    <thead>
                      <tr className="text-left text-[#58645d]">
                        <th className="whitespace-nowrap py-2 pr-4 font-semibold">Invoice</th>
                        <th className="whitespace-nowrap px-4 py-2 font-semibold">Issued</th>
                        <th className="whitespace-nowrap px-4 py-2 font-semibold">Storage path</th>
                        <th className="whitespace-nowrap py-2 pl-4 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf1ec]">
                      {folder.invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="whitespace-nowrap py-3 pr-4 font-semibold text-[#1f2933]">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-[#1f2933]">
                            {formatDate(invoice.issueDate)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#58645d]">
                            {invoice.storagePath ?? "Pending document path"}
                          </td>
                          <td className="whitespace-nowrap py-3 pl-4 text-right font-semibold text-[#1f2933]">
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
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
