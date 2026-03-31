import { drizzle } from "drizzle-orm/bun-sql";

export const db = drizzle({
  connection: process.env.DATABASE_URI!,
  casing: "snake_case",
  logger: true,
  // schema option to allow for `db.query.users` the original db.select().from(users)
});
