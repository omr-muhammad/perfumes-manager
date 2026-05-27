import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { bottlesTable } from "./bottles";
import { sql } from "drizzle-orm";
import { lotStatusEn } from "./enums";

export const bottlesLotsTable = pgTable(
  "bottles_lots",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    status: lotStatusEn("status").notNull(),
    stock: integer("stock").notNull().default(0),
    remainingStock: integer("remaining_stock").notNull(),
    costPrice: numeric("buy_price", { precision: 5, scale: 2 }).notNull(),
    baseSellPrice: numeric("price", { precision: 5, scale: 2 }).notNull(),
    bottleId: integer("bottle_id")
      .notNull()
      .references(() => bottlesTable.id, { onDelete: "cascade" }),
  },
  (lot) => [
    unique("btls_lots_uq").on(
      lot.bottleId,
      lot.receivedAt,
      lot.costPrice,
      lot.stock,
    ),
    check(
      "btl_lots_price_pos_chk",
      sql`
        ${lot.costPrice} >= 0 AND ${lot.baseSellPrice} >= 0
      `,
    ),
    check(
      "btls_lots_cost_lte_sell_chk",
      sql`
        ${lot.costPrice} <= ${lot.baseSellPrice}
    `,
    ),
    check(
      "btls_lots_remaining_lte_stock_chk",
      sql`
            ${lot.remainingStock} <= ${lot.stock}
        `,
    ),
    check(
      "bottles_lots_remaining_stock_pos_chk",
      sql`
        ${lot.remainingStock} >= 0
      `,
    ),
  ],
);
