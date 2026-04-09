import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { perfumes } from "./perfumes";
import { companies } from "./companies";
import { shops } from "./shops";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";

export const perfumesCompounds = pgTable(
  "perfumes_compounds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    perfumeName: varchar("perfume_name", { length: 100 }).notNull(),
    companyName: varchar("company_name", { length: 100 }).notNull(),
    oilAmountInMl: integer("oil_amount_in_ml").notNull().default(0),
    sprayAmountInMl: integer("spray_amount_in_ml").notNull().default(0),
    concentration: smallint("concentration"),
    kiloBuyPrice: numeric("kilo_buy_price", {
      precision: 15,
      scale: 4,
    }).notNull(),
    kiloSellPrice: numeric("kilo_sell_price", {
      precision: 15,
      scale: 4,
    }).notNull(),
    mlPrice: numeric("ml_price", { precision: 10, scale: 4 }).notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    perfumeId: integer("perfume_id")
      .notNull()
      .references(() => perfumes.id, { onDelete: "restrict" }),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique("duplicate_compound").on(
      table.perfumeId,
      table.companyId,
      table.shopId,
      table.code,
    ),
    check(
      "ml_price_cannot_be_negative",
      sql`
        ${table.mlPrice} > 0
      `,
    ),
    check(
      "kilo_prices_cannot_be_negative",
      sql`
        ${table.kiloBuyPrice} > 0 AND ${table.kiloSellPrice} > 0
      `,
    ),
    check(
      "oil_amount_cannot_be_negative",
      sql`
      ${table.oilAmountInMl} >= 0
    `,
    ),
    check(
      "oil_or_spray_amount_must_be_provided",
      sql`
        ${table.oilAmountInMl} + ${table.sprayAmountInMl} > 1
      `,
    ),
    check(
      "spray_amount_cannot_be_negative",
      sql`
      ${table.sprayAmountInMl} >= 0
    `,
    ),
    check(
      "concentration_required_for_spray",
      sql`
        ${table.sprayAmountInMl} = 0
        OR (
          ${table.concentration} > 0
          AND
          ${table.concentration} < 100
        )
      `,
    ),
  ],
);
