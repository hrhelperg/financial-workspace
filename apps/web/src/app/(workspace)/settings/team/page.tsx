import Link from "next/link";
import { MailPlus, Users } from "lucide-react";
import { Panel, PanelHeader, StatusPill } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
import { listPendingInvitations, listTeamMembers } from "@/server/invitations";
import { requireWorkspaceMember } from "@/server/workspace";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const { membership, workspace } = await requireWorkspaceMember();
  const canInvite = membership.role === "owner" || membership.role === "admin";
  const [members, invitations] = await Promise.all([
    listTeamMembers(),
    canInvite ? listPendingInvitations() : Promise.resolve([])
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Team"
        description={`Manage access to ${workspace.name}. Workspace data is isolated by membership.`}
        actionLabel={canInvite ? "Invite teammate" : undefined}
        actionIcon={MailPlus}
        actionHref={canInvite ? "/settings/team/invite" : undefined}
      />

      <Panel>
        <PanelHeader title="Members" description="People with access to this workspace." />
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
                <StatusPill tone={member.status === "active" ? "green" : "neutral"}>{member.status}</StatusPill>
                <StatusPill tone={member.role === "owner" ? "blue" : "neutral"}>{member.role}</StatusPill>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {canInvite ? (
        <Panel>
          <PanelHeader
            title="Invitations"
            description="Pending and historical invitations for this workspace."
            action={
              <Link className="text-sm font-semibold text-[#0f5f59]" href="/settings/team/invite">
                New invite
              </Link>
            }
          />
          <div className="mt-5 divide-y divide-[#edf1ec]">
            {invitations.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#58645d]">No invitations yet.</p>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1f2933]">{invitation.email}</p>
                    <p className="mt-1 text-sm text-[#647067]">
                      Expires {invitation.expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={invitation.status === "pending" ? "amber" : "neutral"}>
                      {invitation.status}
                    </StatusPill>
                    <StatusPill tone="neutral">{invitation.role}</StatusPill>
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
