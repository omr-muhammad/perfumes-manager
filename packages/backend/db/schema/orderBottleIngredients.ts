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
import {
  OBI_AMOUNT_POS_CHK,
  OBI_DISCOUNT_LTE_SUBTOTAL_CHK,
  OBI_DISCOUNT_NNEG_CHK,
  OBI_OIL_UNIT_PRICE_NNEG_CHK,
  OBI_ORDER_BOTTLE_FK,
  OBI_SUBTOTAL_NNEG_CHK,
  OBI_TOTAL_NNEG_CHK,
} from "../../utils/errorMap";

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
    unitPrice: numeric("unit_price", {
      precision: 5,
      scale: 2,
    }).notNull(),
    unitCost: numeric("unit_cost", {
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
      name: OBI_ORDER_BOTTLE_FK,
      columns: [t.orderBottleId],
      foreignColumns: [orderBottlesTable.id],
    }).onDelete("restrict"),

    // ─── non-negative / positive ─────────────────────────────────────────
    check(OBI_DISCOUNT_NNEG_CHK, sql`${t.discountAmount} >= 0`),
    check(OBI_OIL_UNIT_PRICE_NNEG_CHK, sql`${t.unitPrice} >= 0`),
    check(OBI_SUBTOTAL_NNEG_CHK, sql`${t.subtotal} >= 0`),
    check(OBI_TOTAL_NNEG_CHK, sql`${t.total} >= 0`),
    check(OBI_AMOUNT_POS_CHK, sql`${t.amount} > 0`),

    // ─── discount rules ──────────────────────────────────────────────────
    check(
      OBI_DISCOUNT_LTE_SUBTOTAL_CHK,
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
