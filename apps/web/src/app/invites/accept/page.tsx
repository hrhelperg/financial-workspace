import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { acceptInvitationAction } from "./actions";
import { localizePath } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { getInvitationForCurrentUser } from "@/server/invitations";
import { getCurrentUser } from "@/server/workspace";

type AcceptInvitePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const { locale, t } = await getI18n();
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect(localizePath("/dashboard", locale));
  }

  const user = await getCurrentUser();
  if (!user) {
    const next = localizePath(`/invites/accept?token=${token}`, locale);
    redirect(localizePath(`/login?next=${encodeURIComponent(next)}`, locale));
  }

  const invitation = await getInvitationForCurrentUser(token);

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#1f2933]">
        <section className="w-full max-w-md rounded-md border border-[#d8ded8] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-normal">{t("invite.unavailableTitle")}</h1>
          <p className="mt-2 text-sm leading-6 text-[#647067]">{t("invite.unavailableDescription")}</p>
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
        <h1 className="mt-4 text-2xl font-semibold tracking-normal">
          {t("invite.joinTitle", { workspace: invitation.workspace.name })}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#647067]">
          {t("invite.joinDescription", {
            email: invitation.invitation.email,
            role: t(`common.roles.${invitation.invitation.role}`)
          })}
        </p>
        <form action={acceptInvitationAction} className="mt-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />
          <button className="w-full rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#11181d]">
            {t("invite.accept")}
          </button>
        </form>
      </section>
    </main>
  );
}
