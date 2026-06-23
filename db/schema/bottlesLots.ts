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
import {
  BTL_BOTTLE_FK,
  BTL_COST_LTE_SELL_CHK,
  BTL_PRICE_NNEG_CHK,
  BTL_REMAINING_LTE_STOCK_CHK,
  BTL_STOCKS_NNEG_CHK,
  BTL_UQ,
} from "../../utils/errorMap";

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
    unique(BTL_UQ).on(lot.bottleId, lot.receivedAt, lot.costPrice, lot.stock),
    foreignKey({
      name: BTL_BOTTLE_FK,
      columns: [lot.bottleId],
      foreignColumns: [bottlesTable.id],
    }).onDelete("cascade"),
    check(
      BTL_PRICE_NNEG_CHK,
      sql`
        ${lot.costPrice} >= 0 AND ${lot.sellPrice} >= 0
      `,
    ),
    check(
      BTL_COST_LTE_SELL_CHK,
      sql`
        ${lot.costPrice} <= ${lot.sellPrice}
    `,
    ),
    check(
      BTL_STOCKS_NNEG_CHK,
      sql`
        ${lot.stock} >= 0 AND ${lot.remainingStock} >= 0
      `,
    ),
    check(
      BTL_REMAINING_LTE_STOCK_CHK,
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
