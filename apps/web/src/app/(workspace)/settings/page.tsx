import Link from "next/link";
import { Languages, Settings, Users } from "lucide-react";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

const settingsSections = [
  {
    titleKey: "settings.sections.workspaceProfile",
    descriptionKey: "settings.sections.workspaceProfileDescription",
    status: "ready"
  },
  {
    titleKey: "settings.sections.paymentOperations",
    descriptionKey: "settings.sections.paymentOperationsDescription",
    status: "planned"
  },
  {
    titleKey: "settings.sections.documentStorage",
    descriptionKey: "settings.sections.documentStorageDescription",
    status: "ready"
  },
  {
    titleKey: "settings.sections.automationRules",
    descriptionKey: "settings.sections.automationRulesDescription",
    status: "planned"
  }
] as const;

export default async function SettingsPage() {
  const { locale, t } = await getI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
        actionLabel={t("common.actions.saveChanges")}
        actionIcon={Settings}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title={t("settings.teamAccess")}
            description={t("settings.teamAccessDescription")}
            action={
              <Link className="text-sm font-semibold text-[#0f5f59]" href={localizePath("/settings/team", locale)}>
                {t("common.actions.openTeam")}
              </Link>
            }
          />
          <div className="mt-5 flex items-center gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4 text-sm text-[#58645d]">
            <Users className="h-4 w-4 text-[#0f766e]" aria-hidden="true" />
            {t("settings.teamAccessNote")}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title={t("settings.languageTitle")} description={t("settings.languageDescription")} />
          <div className="mt-5 flex items-start gap-3 rounded-md border border-[#edf1ec] bg-[#fbfcfa] p-4">
            <Languages className="mt-1 h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </Panel>

        {settingsSections.map((section) => (
          <Panel key={section.titleKey}>
            <PanelHeader
              title={t(section.titleKey)}
              description={t(section.descriptionKey)}
              action={
                <StatusPill tone={section.status === "ready" ? "green" : "neutral"}>
                  {t(`common.statuses.${section.status}`)}
                </StatusPill>
              }
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
