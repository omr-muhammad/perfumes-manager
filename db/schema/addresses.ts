import {
  check,
  integer,
  pgTable,
  smallint,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { shops } from "./shops";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const addresses = pgTable(
  "addresses",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    country: varchar({ length: 50 }).notNull(),
    city: varchar({ length: 50 }).notNull(),
    strict: varchar({ length: 50 }).default(""),
    street: varchar({ length: 50 }).default(""),
    buildingNumber: smallint(),
    notes: text().default(""),
    shopId: integer()
      .references(() => shops.id, { onDelete: "cascade" })
      .unique(),
    userId: integer()
      .references(() => users.id, { onDelete: "cascade" })
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
