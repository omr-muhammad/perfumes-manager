import {
  integer,
  numeric,
  pgTable,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { perfumesTable, companiesTable, shopsTable, alcoholsTable } from ".";
import { timestamps } from "../columns.helpers";

export const perfumesCompounds = pgTable(
  "perfumes_compounds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    density: numeric("density", { precision: 4, scale: 3 })
      .notNull()
      .default("0.9"),
    code: varchar("code", { length: 50 }).notNull(),
    perfumeId: integer("perfume_id")
      .notNull()
      .references(() => perfumesTable.id, { onDelete: "restrict" }),
    companyId: integer("company_id")
      .notNull()
      .references(() => companiesTable.id, { onDelete: "restrict" }),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shopsTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique("duplicate_compound").on(
      table.perfumeId,
      table.companyId,
      table.shopId,
      table.code,
    ),
  ],
);
