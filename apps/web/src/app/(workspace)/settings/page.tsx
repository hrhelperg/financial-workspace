import Link from "next/link";
import { Settings, Users } from "lucide-react";
import { settingsSections } from "@financial-workspace/core";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Settings"
        description="Workspace configuration for payments, documents, automation, and financial controls."
        actionLabel="Save changes"
        actionIcon={Settings}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Team access"
            description="Manage workspace members, roles, and invitations."
            action={
              <Link className="text-sm font-semibold text-[#0f5f59]" href="/settings/team">
                Open team
              </Link>
            }
          />
          <div className="mt-5 flex items-center gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4 text-sm text-[#58645d]">
            <Users className="h-4 w-4 text-[#0f766e]" aria-hidden="true" />
            Owner and admin roles can invite teammates.
          </div>
        </Panel>

        {settingsSections.map((section) => (
          <Panel key={section.title}>
            <PanelHeader
              title={section.title}
              description={section.description}
              action={
                <StatusPill tone={section.status === "Ready" ? "green" : "neutral"}>
                  {section.status}
                </StatusPill>
              }
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
