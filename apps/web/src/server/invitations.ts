import "server-only";
import { randomBytes } from "node:crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import {
  db,
  users,
  workspaceInvitations,
  workspaceMembers,
  workspaces,
  type WorkspaceInvitation
} from "@financial-workspace/db";
import {
  AuthenticationRequiredError,
  getCurrentUser,
  requireWorkspaceMember,
  requireWorkspaceRole,
  type WorkspaceRole
} from "./auth";
import { sendWorkspaceInviteEmail } from "./invite-email";

const INVITATION_TTL_DAYS = 7;
const assignableInvitationRoles: readonly WorkspaceRole[] = ["admin", "member", "viewer"];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createInvitationToken() {
  return randomBytes(32).toString("hex");
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type TeamMemberListItem = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: Date;
};

export type InvitationListItem = Pick<
  WorkspaceInvitation,
  "id" | "email" | "role" | "status" | "expiresAt" | "createdAt"
>;

export async function listTeamMembers(): Promise<TeamMemberListItem[]> {
  const { workspace } = await requireWorkspaceMember();

  return db
    .select({
      id: workspaceMembers.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: workspaceMembers.role,
      status: workspaceMembers.status,
      createdAt: workspaceMembers.createdAt
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspace.id))
    .orderBy(desc(workspaceMembers.createdAt));
}

export async function listPendingInvitations(): Promise<InvitationListItem[]> {
  const { workspace } = await requireWorkspaceRole(["admin"]);

  return db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      status: workspaceInvitations.status,
      expiresAt: workspaceInvitations.expiresAt,
      createdAt: workspaceInvitations.createdAt
    })
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.workspaceId, workspace.id))
    .orderBy(desc(workspaceInvitations.createdAt));
}

export type CreateInvitationInput = {
  email: string;
  role: WorkspaceRole;
};

export async function createWorkspaceInvitation(input: CreateInvitationInput) {
  const { user, workspace } = await requireWorkspaceRole(["admin"]);
  const email = normalizeEmail(input.email);

  if (!assignableInvitationRoles.includes(input.role)) {
    throw new Error("This role cannot be assigned by invitation.");
  }

  const token = createInvitationToken();
  const expiresAt = new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(workspaceInvitations)
    .values({
      workspaceId: workspace.id,
      email,
      role: input.role,
      token,
      invitedById: user.id,
      expiresAt
    })
    .returning();

  const inviteUrl = `${getAppUrl()}/invites/accept?token=${token}`;
  await sendWorkspaceInviteEmail({ invitation, workspaceName: workspace.name, inviteUrl });

  return { invitation, inviteUrl };
}

export async function getInvitationForCurrentUser(token: string) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const now = new Date();
  const [invitation] = await db
    .select({
      invitation: workspaceInvitations,
      workspace: workspaces
    })
    .from(workspaceInvitations)
    .innerJoin(workspaces, eq(workspaces.id, workspaceInvitations.workspaceId))
    .where(
      and(
        eq(workspaceInvitations.token, token),
        eq(workspaceInvitations.email, normalizeEmail(user.email)),
        eq(workspaceInvitations.status, "pending"),
        gt(workspaceInvitations.expiresAt, now)
      )
    )
    .limit(1);

  return invitation;
}

export async function acceptWorkspaceInvitation(token: string) {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationRequiredError();
  }

  const now = new Date();
  const email = normalizeEmail(user.email);

  const [invitationRow] = await db
    .select()
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.token, token),
        eq(workspaceInvitations.email, email),
        eq(workspaceInvitations.status, "pending"),
        gt(workspaceInvitations.expiresAt, now)
      )
    )
    .limit(1);

  if (!invitationRow) {
    throw new Error("This invitation is invalid or expired.");
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(workspaceMembers)
      .values({
        workspaceId: invitationRow.workspaceId,
        userId: user.id,
        role: invitationRow.role,
        status: "active",
        invitedById: invitationRow.invitedById
      })
      .onConflictDoUpdate({
        target: [workspaceMembers.workspaceId, workspaceMembers.userId],
        set: {
          role: invitationRow.role,
          status: "active",
          invitedById: invitationRow.invitedById
        }
      });

    await tx
      .update(workspaceInvitations)
      .set({
        status: "accepted",
        acceptedById: user.id,
        acceptedAt: now,
        updatedAt: now
      })
      .where(
        and(
          eq(workspaceInvitations.id, invitationRow.id),
          eq(workspaceInvitations.workspaceId, invitationRow.workspaceId),
          eq(workspaceInvitations.email, email),
          eq(workspaceInvitations.status, "pending")
        )
      );
  });

  return invitationRow;
}
