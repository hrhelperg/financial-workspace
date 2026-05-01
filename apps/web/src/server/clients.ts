import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { clients, db, type Client } from "@financial-workspace/db";
import { getDefaultWorkspaceId } from "./workspace";

export type ClientListItem = Pick<
  Client,
  "id" | "name" | "companyName" | "email" | "phone" | "status" | "createdAt"
>;

export async function listClients(): Promise<ClientListItem[]> {
  const workspaceId = await getDefaultWorkspaceId();

  return db
    .select({
      id: clients.id,
      name: clients.name,
      companyName: clients.companyName,
      email: clients.email,
      phone: clients.phone,
      status: clients.status,
      createdAt: clients.createdAt
    })
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(desc(clients.createdAt));
}

export type CreateClientInput = {
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export async function createClient(input: CreateClientInput): Promise<Client> {
  const workspaceId = await getDefaultWorkspaceId();

  const [created] = await db
    .insert(clients)
    .values({
      workspaceId,
      name: input.name,
      companyName: input.companyName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      notes: input.notes ?? null
    })
    .returning();

  return created;
}

export async function getClientById(id: string): Promise<Client | undefined> {
  const workspaceId = await getDefaultWorkspaceId();
  const [row] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.workspaceId, workspaceId), eq(clients.id, id)))
    .limit(1);

  return row;
}
