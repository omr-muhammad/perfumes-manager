import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "./config";
import { alcoholFuncs, alcoholTrigs } from "./utils/syncAlcohol";
import {
  decreaseBottlesStock,
  decreaseCompoundsStock,
} from "./utils/handleStock";
import { addAmountRangeConstraints } from "./utils/validateOverlapping";

async function main() {
  await migrate(db, { migrationsFolder: "./db/migrations" });

  // Add functions & constraints
  await Promise.all([
    // functions
    db.execute(alcoholFuncs),
    db.execute(decreaseBottlesStock),
    db.execute(decreaseCompoundsStock),

    // constraints
    db.execute(addAmountRangeConstraints),
  ]);

  // Add triggers
  await Promise.all([db.execute(alcoholTrigs)]);

  console.log("Migration Done 🥳");
  process.exit(0);
}

main().catch((err) => {
  console.log("Main Error: ", err);
  process.exit(1);
});
