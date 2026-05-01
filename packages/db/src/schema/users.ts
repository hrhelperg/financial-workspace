import { pgTable, text, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./enums";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    imageUrl: text("image_url"),
    ...timestamps()
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
