import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { users } from "./users";

export const shops = pgTable("shops", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  logo: text("logo").default(""),
  ...timestamps,
});
