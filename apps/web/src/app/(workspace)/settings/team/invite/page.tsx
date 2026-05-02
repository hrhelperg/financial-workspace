import { MailPlus } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { inputClassName, primaryButtonClassName } from "@/components/form-styles";
import { PageHeader } from "@/components/page-header";
import { getI18n } from "@/i18n/server";
import { createTeamInvitationAction } from "../actions";
import { requireWorkspaceRole } from "@/server/workspace";

type InvitePageProps = {
  searchParams: Promise<{
    error?: string;
    inviteUrl?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function InviteTeamMemberPage({ searchParams }: InvitePageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  await requireWorkspaceRole(["admin"]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.team.eyebrow")}
        title={t("settings.invite.title")}
        description={t("settings.invite.description")}
        actionIcon={MailPlus}
      />

      <Panel>
        <PanelHeader title={t("settings.invite.panelTitle")} description={t("settings.invite.panelDescription")} />

        {params.error ? (
          <div className="mt-5 rounded-md border border-[#ffd6de] bg-[#fff5f7] p-4 text-sm text-[#9f1239]">
            {params.error}
          </div>
        ) : null}

        {params.inviteUrl ? (
          <div className="mt-5 rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
            <p className="text-sm font-semibold text-[#1f2933]">{t("settings.invite.created")}</p>
            <p className="mt-2 break-all text-sm leading-6 text-[#58645d]">{params.inviteUrl}</p>
          </div>
        ) : null}

        <form action={createTeamInvitationAction} className="mt-6 grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">{t("common.labels.email")}</span>
            <input
              required
              name="email"
              type="email"
              className={inputClassName}
              placeholder={t("settings.invite.placeholder")}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">{t("common.labels.role")}</span>
            <select
              name="role"
              defaultValue="member"
              className={inputClassName}
            >
              <option value="admin">{t("common.roles.admin")}</option>
              <option value="member">{t("common.roles.member")}</option>
              <option value="viewer">{t("common.roles.viewer")}</option>
            </select>
          </label>
          <button className={primaryButtonClassName}>
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            {t("settings.invite.create")}
          </button>
        </form>
      </Panel>
    </div>
  );
}
