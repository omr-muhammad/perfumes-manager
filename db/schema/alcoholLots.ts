import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { lotStatusEn } from "./enums";
import { sql } from "drizzle-orm";
import { timestamps } from "../columns.helpers";
import { alcoholsTable } from ".";

export const alcoholLots = pgTable(
  "alcohol_lots",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    receivedAt: timestamp().notNull().defaultNow(),
    status: lotStatusEn("status").notNull(),
    amount: integer("amount").notNull().default(0),
    expiryDate: timestamp("expiry_date").notNull(),
    costPerLiter: numeric("cost_per_liter", {
      precision: 10,
      scale: 3,
    }).notNull(),
    baseSellPerLiter: numeric("base_sell_per_liter", {
      precision: 10,
      scale: 3,
    }).notNull(),
    baseMlSell: numeric("base_ml_sell", { precision: 5, scale: 2 })
      .generatedAlwaysAs(sql`base_sell_per_liter / 1000`)
      .notNull(),
    alcoholId: integer("alcohol_id")
      .references(() => alcoholsTable.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  (lot) => [
    unique("lot_is_already_exist").on(
      lot.amount,
      lot.receivedAt,
      lot.costPerLiter,
    ),
    check(
      "cost_price_must_be_lte_selling_price",
      sql`
    ${lot.costPerLiter} <=   ${lot.baseSellPerLiter}
  `,
    ),
  ],
);
