import { check, integer, numeric, pgTable } from "drizzle-orm/pg-core";
import { int4range, timestamps } from "../columns.helpers";
import { discountTypeEn, entityTypeEn, pricingTypeEn } from "./enums";
import { sql } from "drizzle-orm";

export const amountTiersTable = pgTable(
  "amount_tiers",
  {
    id: integer("id").notNull().generatedAlwaysAsIdentity(),
    entityId: integer("entity_id"),
    entityType: entityTypeEn("entity_type").notNull(),
    amountRange: int4range("amount_range").notNull(),
    pricingType: pricingTypeEn("pricing_type").notNull(),
    value: numeric("value", { precision: 10, scale: 4 }).notNull(),
    discountType: discountTypeEn("discount_type"),
    maxDiscountAmount: integer("max_discount_amount"),
    ...timestamps,
  },
  (tier) => [
    check(
      "amount_tiers_value_pos_chk",
      sql`
      ${tier.value} >= 0
    `,
    ),
    check(
      "amount_tiers_discount_price_type_cons_chk",
      sql`
        (
          ${tier.pricingType} = 'fixed' AND 
          ${tier.discountType} IS NULL AND 
          ${tier.maxDiscountAmount} IS NULL
        )
        OR
        (${tier.pricingType} = 'discount' AND ${tier.discountType} IS NOT NULL)
      `,
    ),
    check(
      "amount_tiers_discount_percentage_range_chk",
      sql`
      ${tier.pricingType} != 'discount'
      OR
      ${tier.discountType} = 'fixed'
      OR
      ${tier.value} BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    `,
    ),
  ],
);
