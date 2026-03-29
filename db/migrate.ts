import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "./config";

async function main() {
  await migrate(db, { migrationsFolder: "./db/migrations" });
  console.log("Migration Done 🥳");
  process.exit(0);
}

main();
