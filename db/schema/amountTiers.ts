import { check, integer, pgTable } from "drizzle-orm/pg-core";
import { perfumesCompoundsTable } from ".";
import { int4range } from "../columns.helpers";
import { discountTypeEn, pricingTypeEn } from "./enums";
import { sql } from "drizzle-orm";

export const amountTiersTable = pgTable(
  "amount_tiers",
  {
    id: integer("id").notNull().generatedAlwaysAsIdentity(),
    compoundId: integer("compound_id")
      .references(() => perfumesCompoundsTable.id, { onDelete: "cascade" })
      .notNull(),
    amountRange: int4range("amount_range").notNull(),
    pricingType: pricingTypeEn("pricing_type").notNull(),
    value: integer("value").notNull(),
    discountType: discountTypeEn("discount_type"),
    maxDiscountAmount: integer("max_discount_amount"),
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
