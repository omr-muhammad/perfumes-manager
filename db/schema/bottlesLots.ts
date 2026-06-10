import {
  check,
  foreignKey,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { bottlesTable } from "./bottles";
import { relations, sql } from "drizzle-orm";
import { lotStatusEn } from "./enums";
import { timestamps } from "../columns.helpers";

export const bottlesLotsTable = pgTable(
  "bottles_lots",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    status: lotStatusEn("status").notNull(),
    stock: integer("stock").notNull().default(0),
    remainingStock: integer("remaining_stock").notNull(),
    costPrice: numeric("buy_price", { precision: 5, scale: 2 }).notNull(),
    sellPrice: numeric("price", { precision: 5, scale: 2 }).notNull(),
    bottleId: integer("bottle_id").notNull(),
    ...timestamps,
  },
  (lot) => [
    unique("btls_lots_uq").on(
      lot.bottleId,
      lot.receivedAt,
      lot.costPrice,
      lot.stock,
    ),
    foreignKey({
      name: "btls_lots_bottle_fk",
      columns: [lot.bottleId],
      foreignColumns: [bottlesTable.id],
    }).onDelete("cascade"),
    check(
      "btl_lots_price_nneg_chk",
      sql`
        ${lot.costPrice} >= 0 AND ${lot.sellPrice} >= 0
      `,
    ),
    check(
      "btls_lots_cost_lte_sell_chk",
      sql`
        ${lot.costPrice} <= ${lot.sellPrice}
    `,
    ),
    check(
      "bottles_lots_stocks_nneg_chk",
      sql`
        ${lot.stock} >= 0 AND ${lot.remainingStock} >= 0
      `,
    ),
    check(
      "btls_lots_remaining_lte_stock_chk",
      sql`
            ${lot.remainingStock} <= ${lot.stock}
        `,
    ),
  ],
);

export const btlLotsRelations = relations(bottlesLotsTable, ({ one }) => ({
  bottle: one(bottlesTable, {
    fields: [bottlesLotsTable.bottleId],
    references: [bottlesTable.id],
  }),
}));
