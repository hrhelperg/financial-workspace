import { index, integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { documentStatusEnum, documentTypeEnum, emptyJson, relatedEntityTypeEnum, timestamps } from "./enums";
import { invoices } from "./invoices";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    relatedEntityType: relatedEntityTypeEnum("related_entity_type"),
    relatedEntityId: uuid("related_entity_id"),
    documentType: documentTypeEnum("document_type").default("other").notNull(),
    status: documentStatusEnum("status").default("uploaded").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileType: varchar("file_type", { length: 120 }).notNull(),
    storageKey: text("storage_key").notNull(),
    sizeBytes: integer("size_bytes"),
    checksum: varchar("checksum", { length: 255 }),
    parsedMetadata: emptyJson<Record<string, unknown>>("parsed_metadata"),
    metadata: emptyJson<Record<string, unknown>>("metadata"),
    ...timestamps()
  },
  (table) => ({
    clientIdx: index("documents_client_id_idx").on(table.clientId),
    invoiceIdx: index("documents_invoice_id_idx").on(table.invoiceId),
    relatedEntityIdx: index("documents_related_entity_idx").on(table.relatedEntityType, table.relatedEntityId),
    statusIdx: index("documents_status_idx").on(table.status),
    storageKeyIdx: index("documents_storage_key_idx").on(table.storageKey),
    typeIdx: index("documents_document_type_idx").on(table.documentType),
    uploadedByIdx: index("documents_uploaded_by_id_idx").on(table.uploadedById),
    workspaceIdx: index("documents_workspace_id_idx").on(table.workspaceId)
  })
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
