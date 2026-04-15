import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  unique,
  varchar,
  text,
  union,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { companyTypeEn } from "./enums";

export const companies = pgTable(
  "companies",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    country: varchar("country", { length: 50 }),
    approved: boolean("approved").default(false),
    logo: text("logo").default(""),
    type: companyTypeEn("type").default("global").notNull(),
    ...timestamps,
  },
  (table) => [
    unique("company_name_and_country_must_be_unique").on(
      table.name,
      table.country,
    ),
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
