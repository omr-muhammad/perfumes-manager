import { check, integer, numeric, pgTable } from "drizzle-orm/pg-core";
import { perfumesCompoundsTable, shopsTable } from ".";
import { int4range, timestamps } from "../columns.helpers";
import { discountTypeEn, pricingTypeEn } from "./enums";
import { sql } from "drizzle-orm";

export const amountTiersTable = pgTable(
  "amount_tiers",
  {
    id: integer("id").notNull().generatedAlwaysAsIdentity(),
    shopId: integer("shop_id")
      .references(() => shopsTable.id, { onDelete: "cascade" })
      .notNull(),
    compoundId: integer("compound_id")
      .references(() => perfumesCompoundsTable.id, { onDelete: "cascade" })
      .notNull(),
    amountRange: int4range("amount_range").notNull(),
    pricingType: pricingTypeEn("pricing_type").notNull(),
    value: numeric("value", { precision: 10, scale: 4 }).notNull(),
    discountType: discountTypeEn("discount_type"),
    maxDiscountAmount: integer("max_discount_amount"),
    ...timestamps,
  },
  (tier) => [
    check(
      "value_cannot_be_negative",
      sql`
      ${tier.value} >= 0
    `,
    ),
    check(
      "discount_type_cannot_be_null_when_pricing_type_discount",
      sql`
    ${tier.pricingType} = 'fixed'
    OR
    ${tier.discountType} IS NOT NULL
  `,
    ),
    check(
      "discount_percentage_cannot_go_over_100",
      sql`
      ${tier.pricingType} != 'discount'
      OR
      ${tier.discountType} = 'fixed'
      OR
      ${tier.discountType} = 'percentage' AND ${tier.value} <= 100
    `,
    ),
  ],
);
