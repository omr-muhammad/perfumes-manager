import {
  check,
  integer,
  pgTable,
  smallint,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";
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
    shopId: integer("shop_id")
      .references(() => shopsTable.id, { onDelete: "cascade" })
      .unique(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .unique(),
    ...timestamps,
  },
  (table) => [
    check(
      "address_must_refer_to_shop_or_user",
      sql`
      COALESCE(${table.userId}::BOOLEAN::INTEGER, 0) 
      +
      COALESCE(${table.shopId}::BOOLEAN::INTEGER, 0) 
      = 1
    `,
    ),
  ],
);
