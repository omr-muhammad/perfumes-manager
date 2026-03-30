import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const companies = pgTable(
  "companies",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 100 }).notNull(),
    country: varchar({ length: 50 }),
    approved: boolean().default(false),
  },
  (table) => [
    unique().on(table.name, table.country),
    check(
      "approved_required_completed_info",
      sql`
      NOT ${table.approved}
        OR
      ${table.country} IS NOT NULL
    `,
    ),
  ],
);
