import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { ClientForm } from "./client-form";

export const dynamic = "force-dynamic";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#58645d] hover:text-[#1f2933]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to clients
      </Link>
      <PageHeader
        eyebrow="Relationships"
        title="New client"
        description="Create a billing relationship before issuing an invoice."
        actionLabel="Client workspace"
        actionIcon={BriefcaseBusiness}
      />
      <Panel>
        <PanelHeader title="Client details" description="Only the name is required to get started." />
        <div className="mt-5">
          <ClientForm />
        </div>
      </Panel>
    </div>
  );
}
