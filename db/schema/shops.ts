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
  shopCompsTable,
  shopsStaffTable,
  usersTable,
} from ".";
import { relations } from "drizzle-orm";
import { SH_NAME_UQ, SH_OWNER_FK } from "../../utils/errorMap";

export const shopsTable = pgTable(
  "shops",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull().unique(SH_NAME_UQ),
    ownerId: integer("owner_id").notNull(),
    logo: text("logo").default(""),
    active: boolean().notNull().default(true),
    hidden: boolean().notNull().default(false),
    ...timestamps,
  },
  (shop) => [
    foreignKey({
      name: SH_OWNER_FK,
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
  compounds: many(shopCompsTable),
}));
