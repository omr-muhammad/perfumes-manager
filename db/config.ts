import { drizzle } from "drizzle-orm/bun-sql";

export const db = drizzle({
  connection: process.env.DATABASE_URI!,
  casing: "snake_case",
});
