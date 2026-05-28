import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import {
  addressesTable,
  alcoholsTable,
  bottlesTable,
  perfumeCompoundsTable,
  shopsStaffTable,
  usersTable,
} from ".";
import { relations } from "drizzle-orm";

export const shopsTable = pgTable(
  "shops",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull().unique("shops_name_uq"),
    ownerId: integer("owner_id").notNull(),
    logo: text("logo").default(""),
    active: boolean().notNull().default(true),
    hidden: boolean().notNull().default(false),
    ...timestamps,
  },
  (shop) => [
    foreignKey({
      name: "shops_owner_id_fk",
      columns: [shop.ownerId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ],
);

export const shopsRelations = relations(shopsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [shopsTable.ownerId],
    references: [usersTable.id],
  }),
  address: one(addressesTable),
  staff: many(shopsStaffTable),

  // inventory
  alcohols: many(alcoholsTable),
  bottles: many(bottlesTable),
  perfumeCompounds: many(perfumeCompoundsTable),
}));
