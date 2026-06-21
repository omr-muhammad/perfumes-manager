import {
  check,
  foreignKey,
  integer,
  numeric,
  pgTable,
  smallint,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { bottleCatgeroyEn, bottleTypeEn } from "./enums";
import { timestamps } from "../columns.helpers";
import { ordersTable } from ".";
import { orderBottleIngredientsTable } from "./orderBottleIngredients";

export const orderBottlesTable = pgTable(
  "order_bottles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderId: integer("order_id").notNull(),
    alcoholAmount: numeric("alcohol_amount", {
      precision: 5,
      scale: 2,
    }).default("0"),
    mlPriceAtPurchase: numeric("ml_price_at_purchase", {
      precision: 5,
      scale: 2,
    }),
    mlCostAtPurchase: numeric("ml_cost_at_purchase", {
      precision: 5,
      scale: 2,
    }),
    bottleType: bottleTypeEn("bottle_type").notNull(),
    bottleCatg: bottleCatgeroyEn("bottle_catg").notNull().default("normal"),
    bottleSize: smallint("bottle_size").notNull(),
    bottlePriceAtPurchase: numeric("bottle_price_at_purchase", {
      precision: 7,
      scale: 2,
    }).notNull(),
    bottleCostAtPurchase: numeric("bottle_cost_at_purchase", {
      precision: 7,
      scale: 2,
    }).notNull(),
    qty: integer("qty").notNull().default(1),
    total: numeric("total", { precision: 9, scale: 3 }).notNull(),
    ...timestamps,
  },
  (t) => [
    // ─── foreign keys ────────────────────────────────────────────────────
    foreignKey({
      name: "order_bottles_order_id_fk",
      columns: [t.orderId],
      foreignColumns: [ordersTable.id],
    }).onDelete("restrict"),

    // ─── non-negative / positive ─────────────────────────────────────────
    check(
      "order_bottles_bottle_price_nneg_chk",
      sql`${t.bottlePriceAtPurchase} >= 0`,
    ),
    check(
      "order_bottles_bottle_cost_nneg_chk",
      sql`${t.bottleCostAtPurchase} >= 0`,
    ),
    check("order_bottles_total_nneg_chk", sql`${t.total} >= 0`),
    check("order_bottles_bottle_size_pos_chk", sql`${t.bottleSize} > 0`),
    check("order_bottles_qty_min_chk", sql`${t.qty} >= 1`),

    // ─── alcohol rules ───────────────────────────────────────────────────
    // oil   → both must be exactly 0
    check(
      "order_bottles_bottle_type_alcohol_cons_chk",
      sql`${t.bottleType} = 'oil' OR (
        ${t.alcoholAmount} IS NULL AND
        ${t.mlPriceAtPurchase} IS NULL AND
        ${t.mlCostAtPurchase} IS NULL
      )`,
    ),
    // spray / tester → both must be present and > 0
    check(
      "order_bottles_alcohol_nonoil_pos_chk",
      sql`${t.bottleType} = 'oil' OR (
        ${t.alcoholAmount} > 0
      )`,
    ),
  ],
);

export const orderBottlesRelations = relations(
  orderBottlesTable,
  ({ one, many }) => ({
    order: one(ordersTable, {
      fields: [orderBottlesTable.orderId],
      references: [ordersTable.id],
    }),
    ingredients: many(orderBottleIngredientsTable),
  }),
);
