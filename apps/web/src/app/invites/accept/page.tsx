import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { acceptInvitationAction } from "./actions";
import { getInvitationForCurrentUser } from "@/server/invitations";
import { getCurrentUser } from "@/server/workspace";

type AcceptInvitePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/dashboard");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invites/accept?token=${token}`)}`);
  }

  const invitation = await getInvitationForCurrentUser(token);

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
        <section className="w-full max-w-md rounded-md border border-[#d8ded8] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-normal">Invitation unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-[#647067]">This workspace invitation is invalid or expired.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
      <section className="w-full max-w-md rounded-md border border-[#d8ded8] bg-white p-6 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e1f3ef] text-[#0f5f59]">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-normal">Join {invitation.workspace.name}</h1>
        <p className="mt-2 text-sm leading-6 text-[#647067]">
          Accept the invitation for {invitation.invitation.email} as {invitation.invitation.role}.
        </p>
        <form action={acceptInvitationAction} className="mt-6">
          <input type="hidden" name="token" value={token} />
          <button className="w-full rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]">
            Accept invite
          </button>
        </form>
      </section>
    </main>
  );
}
