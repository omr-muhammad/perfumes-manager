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
import { CO_APPROVED_CHK, CO_UQ } from "../../utils/errorMap";

export const companiesTable = pgTable(
  "companies",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    hqCountryCode: varchar("hq_country_code", { length: 5 }).notNull(),
    approved: boolean("approved").default(false),
    logo: text("logo").default(""),
    type: companyTypeEn("type").default("global").notNull(),
    ...timestamps,
  },
  (table) => [unique(CO_UQ).on(table.name, table.hqCountryCode)],
);

export const companiesRelations = relations(companiesTable, ({ many }) => ({
  compounds: many(perfumeCompoundsTable),
}));
