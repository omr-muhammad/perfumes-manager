import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import {
  alcoholsTable,
  bottlesTable,
  compoundLotsTable,
  perfumeCompoundsTable,
  usersTable,
} from ".";
import { relations } from "drizzle-orm";

export const shopsTable = pgTable("shops", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  logo: text("logo").default(""),
  active: boolean().notNull().default(true),
  hidden: boolean().notNull().default(false),
  ...timestamps,
});

export const shopsRelations = relations(shopsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [shopsTable.ownerId],
    references: [usersTable.id],
  }),
  alcohols: many(alcoholsTable),
  bottles: many(bottlesTable),
  perfumeCompounds: many(perfumeCompoundsTable),
}));
