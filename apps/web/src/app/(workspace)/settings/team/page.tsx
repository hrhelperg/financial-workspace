import Link from "next/link";
import { MailPlus, Users } from "lucide-react";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import type { MessageKey, Translator } from "@/i18n/messages";
import { formatDate } from "@/server/format";
import { listPendingInvitations, listTeamMembers } from "@/server/invitations";
import { requireWorkspaceMember } from "@/server/workspace";

export const dynamic = "force-dynamic";

const statusLabelKeys: Record<string, MessageKey> = {
  accepted: "common.statuses.accepted",
  active: "common.statuses.active",
  expired: "common.statuses.expired",
  invited: "common.statuses.invited",
  pending: "common.statuses.pending",
  revoked: "common.statuses.revoked",
  suspended: "common.statuses.suspended"
};

const roleLabelKeys: Record<string, MessageKey> = {
  admin: "common.roles.admin",
  member: "common.roles.member",
  owner: "common.roles.owner",
  viewer: "common.roles.viewer"
};

function statusLabel(t: Translator, status: string) {
  return statusLabelKeys[status] ? t(statusLabelKeys[status]) : status;
}

function roleLabel(t: Translator, role: string) {
  return roleLabelKeys[role] ? t(roleLabelKeys[role]) : role;
}

export default async function TeamSettingsPage() {
  const { locale, t } = await getI18n();
  const { membership, workspace } = await requireWorkspaceMember();
  const canInvite = membership.role === "owner" || membership.role === "admin";
  const [members, invitations] = await Promise.all([
    listTeamMembers(),
    canInvite ? listPendingInvitations() : Promise.resolve([])
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("settings.team.eyebrow")}
        title={t("settings.team.title")}
        description={t("settings.team.description", { workspace: workspace.name })}
        actionLabel={canInvite ? t("settings.team.invite") : undefined}
        actionIcon={MailPlus}
        actionHref={canInvite ? localizePath("/settings/team/invite", locale) : undefined}
      />

      <Panel>
        <PanelHeader title={t("settings.team.members")} description={t("settings.team.membersDescription")} />
        <div className="mt-5 divide-y divide-[#edf1ec]">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1f2933]">{member.name ?? member.email}</p>
                  <p className="mt-1 text-sm text-[#647067]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={member.status === "active" ? "green" : "neutral"}>
                  {statusLabel(t, member.status)}
                </StatusPill>
                <StatusPill tone={member.role === "owner" ? "blue" : "neutral"}>
                  {roleLabel(t, member.role)}
                </StatusPill>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {canInvite ? (
        <Panel>
          <PanelHeader
            title={t("settings.team.invitations")}
            description={t("settings.team.invitationsDescription")}
            action={
              <Link
                className="text-sm font-semibold text-[#0f5f59]"
                href={localizePath("/settings/team/invite", locale)}
              >
                {t("common.actions.newInvite")}
              </Link>
            }
          />
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {invitations.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#58645d]">{t("settings.team.emptyInvitations")}</p>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1f2933]">{invitation.email}</p>
                    <p className="mt-1 text-sm text-[#647067]">
                      {t("settings.team.expires", { date: formatDate(invitation.expiresAt, locale) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={invitation.status === "pending" ? "amber" : "neutral"}>
                      {statusLabel(t, invitation.status)}
                    </StatusPill>
                    <StatusPill tone="neutral">{roleLabel(t, invitation.role)}</StatusPill>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
