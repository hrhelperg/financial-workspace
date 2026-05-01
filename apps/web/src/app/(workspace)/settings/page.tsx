import { Settings } from "lucide-react";
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
