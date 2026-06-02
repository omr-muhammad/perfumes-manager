import {
  check,
  foreignKey,
  integer,
  numeric,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { amountTypeEn } from "./enums";
import { timestamps } from "../columns.helpers";
import { orderBottlesTable } from ".";

export const orderBottleIngredientsTable = pgTable(
  "order_bottle_ingredients",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderBottleId: integer("order_bottle_id").notNull(),
    perfumeCompoundName: text("perfume_compound_name").notNull(),
    shopCompoundCode: varchar("shop_compound_code", { length: 50 }).notNull(),
    discountAmount: numeric("discount_amount", {
      precision: 5,
      scale: 2,
    }).default("0"),
    amount: numeric("amount", { precision: 7, scale: 3 }).notNull(),
    amountType: amountTypeEn("amount_type").notNull(),
    oilUnitPrice: numeric("oil_unit_price", {
      precision: 5,
      scale: 2,
    }).notNull(),
    subtotal: numeric("subtotal", { precision: 8, scale: 2 }).notNull(),
    total: numeric("total", { precision: 8, scale: 2 }).notNull(),
    ...timestamps,
  },
  (t) => [
    // ─── foreign keys ────────────────────────────────────────────────────
    foreignKey({
      name: "order_bottle_ingredients_order_bottle_id_fk",
      columns: [t.orderBottleId],
      foreignColumns: [orderBottlesTable.id],
    }),

    // ─── non-negative / positive ─────────────────────────────────────────
    check(
      "order_bottle_ingredients_discount_nneg_chk",
      sql`${t.discountAmount} >= 0`,
    ),
    check(
      "order_bottle_ingredients_oil_unit_price_nneg_chk",
      sql`${t.oilUnitPrice} >= 0`,
    ),
    check(
      "order_bottle_ingredients_subtotal_nneg_chk",
      sql`${t.subtotal} >= 0`,
    ),
    check("order_bottle_ingredients_total_nneg_chk", sql`${t.total} >= 0`),
    check("order_bottle_ingredients_amount_pos_chk", sql`${t.amount} > 0`),

    // ─── discount rules ──────────────────────────────────────────────────
    check(
      "order_bottle_ingredients_discount_lte_subtotal_chk",
      sql`${t.discountAmount} <= ${t.subtotal}`,
    ),
  ],
);

export const orderBottleIngredientsRelations = relations(
  orderBottleIngredientsTable,
  ({ one, many }) => ({
    bottle: one(orderBottlesTable, {
      fields: [orderBottleIngredientsTable.orderBottleId],
      references: [orderBottlesTable.id],
    }),
  }),
);
