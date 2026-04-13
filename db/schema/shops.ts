import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { usersTable } from ".";

export const shops = pgTable("shops", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  logo: text("logo").default(""),
  active: boolean().notNull().default(true),
  ...timestamps,
});
