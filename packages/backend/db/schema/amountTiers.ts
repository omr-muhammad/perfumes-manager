import { check, integer, numeric, pgTable } from "drizzle-orm/pg-core";
import { int4range, timestamps } from "../columns.helpers";
import { entityTypeEn, pricingTypeEn } from "./enums";
import { sql } from "drizzle-orm";
import {
  AT_DISCOUNT_PERCENTAGE_RANGE_CHK,
  AT_VALUE_POS_CHK,
} from "../../utils/errorMap";

export const amountTiersTable = pgTable(
  "amount_tiers",
  {
    id: integer("id").notNull().generatedAlwaysAsIdentity(),
    entityId: integer("entity_id"),
    entityType: entityTypeEn("entity_type").notNull(),
    amountRange: int4range("amount_range").notNull(),
    pricingType: pricingTypeEn("pricing_type").notNull(),
    value: numeric("value", { precision: 10, scale: 4 }).notNull(),
    maxAmount: integer("max_amount"),
    ...timestamps,
  },
  (tier) => [
    check(
      AT_VALUE_POS_CHK,
      sql`
      ${tier.value} >= 0
    `,
    ),
    check(
      AT_DISCOUNT_PERCENTAGE_RANGE_CHK,
      sql`
      ${tier.pricingType} != 'discount'
      OR
      ${tier.value} BETWEEN 0 AND 100 -- pricing type is discount and discount type is percentage
    `,
    ),
  ],
);
