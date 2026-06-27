import {
  check,
  foreignKey,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import {
  fulfillmentMethodEn,
  occasionEn,
  orderStatusEn,
  orderTypeEn,
  paymentMethodEn,
  paymentStatusEn,
} from "./enums";
import { timestamps } from "../columns.helpers";
import { orderBottlesTable, shopsTable } from ".";
import {
  OR_DISCOUNT_AMOUNT_NNEG_CHK,
  OR_DISCOUNT_LTE_SUBTOTAL_CHK,
  OR_DISCOUNT_REASON_REQ_CHK,
  OR_OCCASION_NOTE_REQ_CHK,
  OR_PAYMENT_REFUND_CHK,
  OR_SHIPPING_COST_NNEG_CHK,
  OR_SHIPPING_REQ_CHK,
  OR_SHOP_FK,
  OR_STATUS_FULFILLMENT_CONS_CHK,
  OR_SUBTOTAL_NNEG_CHK,
  OR_TOTAL_NNEG_CHK,
} from "../../utils/errorMap";

export const ordersTable = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orderType: orderTypeEn("order_type").notNull(),
    orderStatus: orderStatusEn("order_status").notNull().default("pending"),
    fulfillmentMethod: fulfillmentMethodEn("fulfillment_method").notNull(),
    paymentStatus: paymentStatusEn("payment_status").default("pending"),
    paymentMethod: paymentMethodEn("payment_method"),
    customerName: varchar("customer_name", { length: 50 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    shippingCountry: varchar("shipping_country", { length: 50 }),
    shippingCity: varchar("shipping_city", { length: 50 }),
    shippingStreet: varchar("shipping_street", { length: 50 }),
    shippingCost: numeric("shipping_cost", { precision: 6, scale: 3 }),
    occasion: occasionEn("occasion").notNull().default("none"),
    occasionNote: text("occasion_note"),
    subtotal: numeric("subtotal", { precision: 8, scale: 2 }).notNull(),
    discountAmount: numeric("discount_amount", {
      precision: 5,
      scale: 2,
    }).default("0"),
    discountReason: text("discount_reason"),
    total: numeric("total", { precision: 8, scale: 2 }).notNull(),
    // ⚑ added notNull — an order must always belong to a shop
    shopId: integer("shop_id").notNull(),
    deletedAt: timestamp("deleted_at"),
    ...timestamps,
  },
  (order) => [
    // ─── foreign keys ────────────────────────────────────────────────────
    foreignKey({
      name: OR_SHOP_FK,
      columns: [order.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("restrict"),

    // ─── non-negative / positive ─────────────────────────────────────────
    check(OR_SUBTOTAL_NNEG_CHK, sql`${order.subtotal} >= 0`),
    check(OR_TOTAL_NNEG_CHK, sql`${order.total} >= 0`),
    check(OR_DISCOUNT_AMOUNT_NNEG_CHK, sql`${order.discountAmount} >= 0`),
    check(OR_SHIPPING_COST_NNEG_CHK, sql`${order.shippingCost} >= 0`),

    // ─── discount rules ──────────────────────────────────────────────────
    check(
      OR_DISCOUNT_LTE_SUBTOTAL_CHK,
      sql`${order.discountAmount} <= ${order.subtotal}`,
    ),
    check(
      OR_DISCOUNT_REASON_REQ_CHK,
      sql`${order.discountAmount} = 0 OR ${order.discountReason} IS NOT NULL`,
    ),

    // ─── occasion ────────────────────────────────────────────────────────
    check(
      OR_OCCASION_NOTE_REQ_CHK,
      sql`${order.occasion} != 'others' OR ${order.occasionNote} IS NOT NULL`,
    ),

    // ─── shipping required for delivery ──────────────────────────────────
    check(
      OR_SHIPPING_REQ_CHK,
      sql`${order.fulfillmentMethod} != 'delivery' OR (
        ${order.shippingCountry} IS NOT NULL AND
        ${order.shippingCity}    IS NOT NULL AND
        ${order.shippingStreet}  IS NOT NULL
      )`,
    ),

    // ─── payment: refund only when delivered ─────────────────────────────
    check(
      OR_PAYMENT_REFUND_CHK,
      sql`${order.paymentStatus} != 'refunded' OR ${order.orderStatus} = 'delivered'`,
    ),

    // ─── onhand can never reach "shipped" ────────────────────────────────
    // trigger that compares OLD vs NEW values.
    check(
      OR_STATUS_FULFILLMENT_CONS_CHK,
      sql`${order.orderStatus} != 'shipped' OR ${order.fulfillmentMethod} = 'delivery'`,
    ),
  ],
);

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  shop: one(shopsTable, {
    fields: [ordersTable.shopId],
    references: [shopsTable.id],
  }),
  orderBottles: many(orderBottlesTable),
}));
