import "server-only";
import { cache } from "react";
import { and, asc, eq, sql } from "drizzle-orm";
import {
  db,
  setRequestIdentity,
  users,
  workspaceMembers,
  workspaces,
  type User,
  type Workspace,
  type WorkspaceMember
} from "@financial-workspace/db";
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "./supabase";

export const workspaceRoles = ["owner", "admin", "member", "viewer"] as const;
export type WorkspaceRole = (typeof workspaceRoles)[number];

const roleRank: Record<WorkspaceRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3
};

const DEFAULT_OWNER_EMAIL = "owner@local";
const DEFAULT_OWNER_NAME = "Workspace owner";
const DEFAULT_WORKSPACE_NAME = "Default workspace";
const DEFAULT_WORKSPACE_SLUG = "default";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthenticationRequiredError";
  }
}

export class WorkspaceMembershipRequiredError extends Error {
  constructor() {
    super("Workspace membership is required.");
    this.name = "WorkspaceMembershipRequiredError";
  }
}

export class WorkspaceRoleRequiredError extends Error {
  constructor(requiredRoles: readonly WorkspaceRole[]) {
    super(`Workspace role required: ${requiredRoles.join(", ")}.`);
    this.name = "WorkspaceRoleRequiredError";
  }
}

export type WorkspaceContext = {
  user: User;
  workspace: Workspace;
  membership: WorkspaceMember;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isLocalAuthBypassEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.AUTH_LOCAL_DEV_BYPASS !== "false";
}

async function ensureLocalUser(input: { authUserId?: string | null; email: string; name?: string | null }) {
  const email = normalizeEmail(input.email);
  const name = input.name ?? email;

  if (!input.authUserId) {
    const result = await db.execute<{
      id: string;
      email: string;
      name: string | null;
      imageUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(sql`
      insert into "users" ("email", "name")
      values (${email}, ${name})
      on conflict ("email") do update set "name" = excluded."name"
      returning
        "id",
        "email",
        "name",
        "image_url" as "imageUrl",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt"
    `);

    const created = result.rows[0];
    return { ...created, authUserId: null } satisfies User;
  }

  const [created] = await db
    .insert(users)
    .values({ authUserId: input.authUserId, email, name })
    .onConflictDoUpdate({
      target: users.email,
      set: { authUserId: input.authUserId, name }
    })
    .returning();

  return created;
}

async function ensureLocalDevelopmentUser() {
  return ensureLocalUser({
    email: DEFAULT_OWNER_EMAIL,
    name: DEFAULT_OWNER_NAME
  });
}

async function ensureDefaultWorkspaceForUser(user: User) {
  const slug = user.email === DEFAULT_OWNER_EMAIL ? DEFAULT_WORKSPACE_SLUG : `workspace-${user.id.slice(0, 8)}`;
  const name = user.email === DEFAULT_OWNER_EMAIL ? DEFAULT_WORKSPACE_NAME : `${user.name ?? "My"} workspace`;

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name,
      slug,
      ownerId: user.id
    })
    .onConflictDoUpdate({
      target: workspaces.slug,
      set: {
        name
      }
    })
    .returning();

  const [membership] = await db
    .insert(workspaceMembers)
    .values({
      workspaceId: workspace.id,
      userId: user.id,
      role: "owner",
      status: "active"
    })
    .onConflictDoUpdate({
      target: [workspaceMembers.workspaceId, workspaceMembers.userId],
      set: {
        role: "owner",
        status: "active"
      }
    })
    .returning();

  return { workspace, membership };
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const resolved = await resolveCurrentUser();

  if (resolved) {
    setRequestIdentity(resolved.id);
  }

  return resolved;
});

async function resolveCurrentUser(): Promise<User | null> {
  if (!hasSupabaseAuthConfig()) {
    return isLocalAuthBypassEnabled() ? ensureLocalDevelopmentUser() : null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  return ensureLocalUser({
    authUserId: user.id,
    email: user.email,
    name: user.user_metadata.name ?? user.email
  });
}

export const getCurrentWorkspace = cache(async (): Promise<WorkspaceContext | null> => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [firstMembership] = await db
    .select({
      workspace: workspaces,
      membership: workspaceMembers
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.status, "active")))
    .orderBy(asc(workspaces.createdAt))
    .limit(1);

  if (firstMembership) {
    return { user, workspace: firstMembership.workspace, membership: firstMembership.membership };
  }

  const created = await ensureDefaultWorkspaceForUser(user);
  return { user, ...created };
});

export async function requireWorkspaceMember(): Promise<WorkspaceContext> {
  const context = await getCurrentWorkspace();

  if (!context) {
    throw new AuthenticationRequiredError();
  }

  if (context.membership.status !== "active") {
    throw new WorkspaceMembershipRequiredError();
  }

  return context;
}

export async function requireWorkspaceRole(requiredRoles: readonly WorkspaceRole[]): Promise<WorkspaceContext> {
  const context = await requireWorkspaceMember();
  const userRole = context.membership.role as WorkspaceRole;
  const hasRole = requiredRoles.some((role) => roleRank[userRole] >= roleRank[role]);

  if (!hasRole) {
    throw new WorkspaceRoleRequiredError(requiredRoles);
  }

  return context;
}

export function isAuthenticationError(error: unknown) {
  return error instanceof AuthenticationRequiredError || error instanceof WorkspaceMembershipRequiredError;
}

export function isAuthorizationError(error: unknown) {
  return error instanceof WorkspaceRoleRequiredError;
}
