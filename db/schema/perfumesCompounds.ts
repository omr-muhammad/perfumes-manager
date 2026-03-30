import {
  check,
  integer,
  pgTable,
  smallint,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { perfumes } from "./perfumes";
import { companies } from "./companies";
import { shops } from "./shops";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";

export const perfumesCompounds = pgTable(
  "perfumes_compounds",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    oilAmountInMl: integer().notNull().default(0),
    sprayAmountInMl: integer().notNull().default(0),
    concentration: smallint(),
    code: varchar({ length: 50 }).notNull(),
    perfumeId: integer()
      .notNull()
      .references(() => perfumes.id, { onDelete: "restrict" }),
    companyId: integer()
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    shopId: integer()
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique().on(table.perfumeId, table.companyId, table.shopId, table.code),
    check(
      "oil_amount_cannot_be_negative",
      sql`
      ${table.oilAmountInMl} >= 0
    `,
    ),
    check(
      "oil_or_spray_amount_must_be_provided",
      sql`
        ${table.oilAmountInMl} + ${table.sprayAmountInMl} > 1
      `,
    ),
    check(
      "spray_amount_cannot_be_negative",
      sql`
      ${table.sprayAmountInMl} >= 0
    `,
    ),
    check(
      "concentration_required_for_spray",
      sql`
        ${table.sprayAmountInMl} = 0
        OR (
          ${table.concentration} > 0
          AND
          ${table.concentration} < 100
        )
      `,
    ),
  ],
);
