import { sql } from "drizzle-orm";

export const addAmountRangeConstraints = sql`
  -- For custom int4range type in db/schema/amountTiers.ts
  CREATE EXTENSION IF NOT EXISTS btree_gist;

  ALTER TABLE amount_tiers 
  DROP CONSTRAINT IF EXISTS no_amount_ranges_overlapping;

  -- 2. Create it fresh
  ALTER TABLE amount_tiers
    ADD CONSTRAINT no_amount_ranges_overlapping
    EXCLUDE USING GIST (
      shop_id WITH =,
      entity_id WITH =,
      entity_type WITH =,
      amount_range WITH &&
    );
`;
