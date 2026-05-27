import { check, integer, numeric, pgTable } from "drizzle-orm/pg-core";
import { perfumeCompoundsTable, shopsTable } from ".";
import { int4range, timestamps } from "../columns.helpers";
import { discountTypeEn, entityTypeEn, pricingTypeEn } from "./enums";
import { sql } from "drizzle-orm";

export const amountTiersTable = pgTable(
  "amount_tiers",
  {
    id: integer("id").notNull().generatedAlwaysAsIdentity(),
    shopId: integer("shop_id")
      .references(() => shopsTable.id, { onDelete: "cascade" })
      .notNull(),
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
      "value_cannot_be_negative",
      sql`
      ${tier.value} >= 0
    `,
    ),
    check(
      "discount_fields_must_match_pricing_type",
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
      "discount_percentage_cannot_go_over_100",
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
