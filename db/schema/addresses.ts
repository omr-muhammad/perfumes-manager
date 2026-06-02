import {
  check,
  foreignKey,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { relations, sql } from "drizzle-orm";
import { shopsTable, usersTable } from ".";

export const addressesTable = pgTable(
  "addresses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    country: varchar("country", { length: 50 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    district: varchar("district", { length: 50 }).default(""),
    street: varchar("street", { length: 50 }).notNull(),
    buildingNumber: varchar("building_number"),
    notes: text("notes").default(""),
    shopId: integer("shop_id").unique(),
    userId: integer("user_id").unique(),
    ...timestamps,
  },
  (address) => [
    foreignKey({
      name: "addresses_shop_id_fk",
      columns: [address.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "addresses_user_id_fk",
      columns: [address.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
    check(
      "addresses_shop_or_user_fk",
      sql`
      COALESCE(${address.userId}::BOOLEAN::INTEGER, 0) 
      +
      COALESCE(${address.shopId}::BOOLEAN::INTEGER, 0) 
      = 1
    `,
    ),
  ],
);

export const addressRelations = relations(addressesTable, ({ one }) => ({
  shop: one(shopsTable, {
    fields: [addressesTable.shopId],
    references: [shopsTable.id],
  }),
  user: one(usersTable, {
    fields: [addressesTable.userId],
    references: [usersTable.id],
  }),
}));
