import { pgEnum } from "drizzle-orm/pg-core";

export const seasonsEn = pgEnum("seasons", [
  "winter",
  "spring",
  "summer",
  "fall",
]);
export const sexEn = pgEnum("sex", ["male", "female", "unisex"]);
export const roleEn = pgEnum("role", ["admin", "owner", "staff", "customer"]);
export const langEn = pgEnum("language", ["ar", "en"]);
export const staffEn = pgEnum("staff_role", ["manager", "cashier"]);
export const bottleTypeEn = pgEnum("bottle_type", ["spray", "oil", "tester"]);
export const bottleCatgeroyEn = pgEnum("bottle_category", [
  "normal",
  "elegant",
]);
export const companyTypeEn = pgEnum("type", ["global", "local"]);
export const pricingTypeEn = pgEnum("pricing_type", ["discount", "fixed"]);
export const discountTypeEn = pgEnum("discount_type", ["percentage", "fixed"]);
export const lotStatusEn = pgEnum("lot_status", [
  "inuse",
  "ready",
  "depleted",
  "expired",
]);
export const entityTypeEn = pgEnum("entity_type", [
  "shop_compound",
  "bottle",
  "alcohol",
]);

// orders
export const orderTypeEn = pgEnum("order_type", ["onhand", "online"]);
export const fulfillmentMethodEn = pgEnum("fulfillment_method", [
  "pickup",
  "delivery",
]);
export const orderStatusEn = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const paymentStatusEn = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);
export const paymentMethodEn = pgEnum("payment_method", [
  "cash",
  "card",
  "wallet",
]);
export const occasionEn = pgEnum("occasion", [
  "none",
  "gift",
  "apology",
  "compensation",
  "others",
]);

// orderBottleIngredients
export const amountTypeEn = pgEnum("amount_type", ["spray", "oil"]);
