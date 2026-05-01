import "server-only";
import { eq } from "drizzle-orm";
import { db, users, workspaces } from "@financial-workspace/db";

const DEFAULT_WORKSPACE_SLUG = "default";
const DEFAULT_OWNER_EMAIL = "owner@local";
const DEFAULT_OWNER_NAME = "Workspace owner";
const DEFAULT_WORKSPACE_NAME = "Default workspace";

let cachedWorkspaceId: string | undefined;

export async function getDefaultWorkspaceId(): Promise<string> {
  if (cachedWorkspaceId) {
    return cachedWorkspaceId;
  }

  const existing = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, DEFAULT_WORKSPACE_SLUG))
    .limit(1);

  if (existing[0]) {
    cachedWorkspaceId = existing[0].id;
    return existing[0].id;
  }

  const owner = await ensureDefaultOwner();
  const [created] = await db
    .insert(workspaces)
    .values({
      name: DEFAULT_WORKSPACE_NAME,
      slug: DEFAULT_WORKSPACE_SLUG,
      ownerId: owner.id
    })
    .returning({ id: workspaces.id });

  cachedWorkspaceId = created.id;
  return created.id;
}

async function ensureDefaultOwner() {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEFAULT_OWNER_EMAIL))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(users)
    .values({
      email: DEFAULT_OWNER_EMAIL,
      name: DEFAULT_OWNER_NAME
    })
    .returning({ id: users.id });

  return created;
}
