import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

export const perfumesTable = pgTable("perfumes", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 100 }).notNull().unique(),
});
