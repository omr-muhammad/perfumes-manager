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
    unique("duplicate_lot").on(
      lot.bottleId,
      lot.receivedAt,
      lot.costPrice,
      lot.stock,
    ),
    check(
      "cost_price_must_be_lte_sell_price",
      sql`
        ${lot.costPrice} <= ${lot.baseSellPrice}
    `,
    ),
    check(
      "remaining_stock_must_lte_base_stock",
      sql`
            ${lot.remainingStock} <= ${lot.stock}
        `,
    ),
  ],
);
