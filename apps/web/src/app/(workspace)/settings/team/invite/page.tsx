import { MailPlus } from "lucide-react";
import { Panel, PanelHeader } from "@financial-workspace/ui";
import { PageHeader } from "@/components/page-header";
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
  const params = await searchParams;
  await requireWorkspaceRole(["admin"]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Invite teammate"
        description="Add an owner, operator, or advisor to the current workspace."
        actionIcon={MailPlus}
      />

      <Panel>
        <PanelHeader title="Invitation" description="The teammate will receive workspace access after accepting." />

        {params.error ? (
          <div className="mt-5 rounded-md border border-[#ffd6de] bg-[#fff5f7] p-4 text-sm text-[#9f1239]">
            {params.error}
          </div>
        ) : null}

        {params.inviteUrl ? (
          <div className="mt-5 rounded-md border border-[#d8ded8] bg-[#f8faf7] p-4">
            <p className="text-sm font-semibold text-[#1f2933]">Invite created</p>
            <p className="mt-2 break-all text-sm leading-6 text-[#58645d]">{params.inviteUrl}</p>
          </div>
        ) : null}

        <form action={createTeamInvitationAction} className="mt-6 grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">Email</span>
            <input
              required
              name="email"
              type="email"
              className="mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
              placeholder="teammate@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#58645d]">Role</span>
            <select
              name="role"
              defaultValue="member"
              className="mt-2 w-full rounded-md border border-[#d8ded8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]">
            <MailPlus className="h-4 w-4" aria-hidden="true" />
            Create invite
          </button>
        </form>
      </Panel>
    </div>
  );
}
