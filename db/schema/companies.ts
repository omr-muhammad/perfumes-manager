import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  unique,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { companyTypeEn } from "./enums";
import { perfumeCompoundsTable } from "./perfumesCompounds";

export const companiesTable = pgTable(
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
    unique("companies_uq").on(table.name, table.country),
    check(
      "companies_approved_chk",
      sql`
      NOT ${table.approved}
        OR
      ${table.country} IS NOT NULL
    `,
    ),
  ],
);

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  compounds: many(perfumeCompoundsTable),
}));
