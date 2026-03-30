import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { users } from "./users";

export const shops = pgTable("shops", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
  ownerId: integer().references(() => users.id),
  logo: text().default(""),
  ...timestamps,
});
