import { pgEnum } from "drizzle-orm/pg-core";

export const seasonsEn = pgEnum("seasons", [
  "winter",
  "spring",
  "summer",
  "fall",
]);
export const sexEn = pgEnum("sex", ["men", "women", "unisex"]);
export const roleEn = pgEnum("role", ["admin", "owner", "staff", "customer"]);
export const langEn = pgEnum("language", ["ar", "en"]);
export const staffEn = pgEnum("staff_role", ["manager", "cashier"]);
export const bottleTypeEn = pgEnum("bottle_type", ["spray", "oil", "tester"]);
export const bottleCatgeroyEn = pgEnum("bottle_category", [
  "normal",
  "elegant",
]);
