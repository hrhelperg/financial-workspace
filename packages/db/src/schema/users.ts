import { pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: uuid("auth_user_id"),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    imageUrl: text("image_url"),
    ...timestamps()
  },
  (table) => ({
    authUserIdx: uniqueIndex("users_auth_user_id_idx").on(table.authUserId),
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
