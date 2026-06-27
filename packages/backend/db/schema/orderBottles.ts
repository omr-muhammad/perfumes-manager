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
import {
  OB_COST_NNEG_CHK,
  OB_ORDER_FK,
  OB_PRICE_NNEG_CHK,
  OB_QTY_MIN_CHK,
  OB_SIZE_POS_CHK,
  OB_TOTAL_NNEG_CHK,
  OB_TYPE_ALCOHOL_CONS_CHK,
} from "../../utils/errorMap";

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
      name: OB_ORDER_FK,
      columns: [t.orderId],
      foreignColumns: [ordersTable.id],
    }).onDelete("restrict"),

    // ─── non-negative / positive ─────────────────────────────────────────
    check(OB_PRICE_NNEG_CHK, sql`${t.bottlePriceAtPurchase} >= 0`),
    check(OB_COST_NNEG_CHK, sql`${t.bottleCostAtPurchase} >= 0`),
    check(OB_TOTAL_NNEG_CHK, sql`${t.total} >= 0`),
    check(OB_SIZE_POS_CHK, sql`${t.bottleSize} > 0`),
    check(OB_QTY_MIN_CHK, sql`${t.qty} >= 1`),

    // ─── alcohol rules ───────────────────────────────────────────────────
    // oil   → both must be exactly 0
    check(
      OB_TYPE_ALCOHOL_CONS_CHK,
      sql`${t.bottleType} != 'oil' OR (
        ${t.alcoholAmount} IS NULL AND
        ${t.mlPriceAtPurchase} IS NULL AND
        ${t.mlCostAtPurchase} IS NULL
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
