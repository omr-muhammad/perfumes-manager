import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "./config";
import { sql } from "drizzle-orm";
import { setupAlcoholTriggers } from "./utils/syncAlcohol";

async function main() {
  await migrate(db, { migrationsFolder: "./db/migrations" });

  // For custom int4range type in db/schema/amountTiers.ts
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS btree_gist`);

  // Add constraints to prevent amount ranges overlapping so no 1-50 and 30-100
  // Handled exception since no IF NOT EXISTS check for constraints
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'no_amount_ranges_overlapping'
    ) THEN
      ALTER TABLE amount_tiers
      ADD CONSTRAINT no_amount_ranges_overlapping
      EXCLUDE USING GIST (
        shop_id WITH =,
        compound_id WITH =,
        amount_range WITH &&
      );
    END IF;
  END $$
`);

  await setupAlcoholTriggers();

  console.log("Migration Done 🥳");
  process.exit(0);
}

main().catch((err) => {
  console.log("Main Error: ", err);
  process.exit(1);
});
