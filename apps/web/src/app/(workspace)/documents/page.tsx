import { FileArchive } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/placeholder-table";
import { requireWorkspaceMember } from "@/server/workspace";

const columns = [
  { key: "name", label: "Document" },
  { key: "type", label: "Type" },
  { key: "linked", label: "Linked record" },
  { key: "status", label: "Status" },
  { key: "updated", label: "Updated" }
];

const rows = [
  { name: "acme-master-services.pdf", type: "Contract", linked: "Acme Ledger Co.", status: "Ready", updated: "Today" },
  { name: "cloudline-receipt.pdf", type: "Receipt", linked: "Cloudline", status: "Parsed", updated: "Today" },
  { name: "fw-1024.pdf", type: "Invoice", linked: "FW-1024", status: "Ready", updated: "Yesterday" },
  { name: "pine-tax-form.pdf", type: "Tax", linked: "Pine Labs", status: "Review", updated: "Apr 26" }
];

export default async function DocumentsPage() {
  await requireWorkspaceMember();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Documents"
        description="28 files, 4 pending review, 3 linked today."
        actionLabel="Fiscal export"
        actionIcon={FileArchive}
        actionHref="/documents/export"
      />
      <PlaceholderTable columns={columns} rows={rows} />
    </div>
  );
}
