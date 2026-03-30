import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  timestamp,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { timestamps } from "../columns.helpers";
import { shops } from "./shops";

export const alcohols = pgTable(
  "alcohols",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 100 }).notNull(),
    type: varchar({ length: 50 }).notNull(),
    amountInMl: integer().notNull().default(0),
    ltBuyPrice: numeric({ scale: 4, precision: 4 }).notNull(),
    ltSellPrice: numeric({ scale: 4, precision: 4 }).notNull(),
    unitSellPrice: numeric({ scale: 2, precision: 2 }).notNull(),
    unit: varchar({ length: 2 }).notNull().default("ml"),
    concentration: smallint().default(96),
    madeDate: timestamp().notNull(),
    expiryDate: timestamp().notNull(),
    shopId: integer()
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique().on(
      table.name,
      table.type,
      table.ltBuyPrice,
      table.concentration,
      table.shopId,
      table.madeDate,
    ),
    check("amount_cannot_be_negative", sql`${table.amountInMl} >= 0`),
    check("buying_price_must_be_more_than_zero", sql`${table.ltBuyPrice} > 0`),
    check(
      "selling_price_must_be_more_than_zero",
      sql`${table.ltSellPrice} > 0`,
    ),
    check("unit_price_must_be_more_than_zero", sql`${table.unitSellPrice} > 0`),
    check(
      "concentration_must_be_between_1_and_100",
      sql`${table.concentration} > 0 AND ${table.concentration} <= 100`,
    ),
    check(
      "expiry_date_must_be_greater_than_made_date",
      sql`${table.madeDate} < ${table.expiryDate}`,
    ),
  ],
);
