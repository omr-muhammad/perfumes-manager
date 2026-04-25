import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "./config";
import { sql } from "drizzle-orm";

async function main() {
  await migrate(db, { migrationsFolder: "./db/migrations" });

  // For custom int4range type in db/schema/amountTiers.ts
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS btree-gist`);

  // Add constraints to prevent amount ranges overlapping so no 1-50 and 30-100
  // Handled exception since no IF NOT EXISTS check for constraints
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE amount_tiers
      ADD CONSTRAINTS no_amount_ranges_overlapping
      EXCLUDE USING GIST (
        compound_id WITH =,
        amount_range WITH &&
      );
      EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `);

  console.log("Migration Done 🥳");
  process.exit(0);
}

main();
