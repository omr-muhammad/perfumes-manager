import {
  pgTable,
  integer,
  varchar,
  pgEnum,
  boolean,
  text,
  check,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";
import { seasonsEn, sexEn } from "./enums";

// later for better structure
// export const familiesEn = pgEnum("families", ["fresh", "aromatic", "citrus", "water", "green", "fruity", "floral", "soft floral", "oriental(Amber)", "floral oriental", "soft oriental", "woody oriental", "woody", "woods", "mossy woods", "dry woods"])

export const perfumesTable = pgTable(
  "perfumes",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 100 }).unique().notNull(),
    seasons: seasonsEn().array(),
    sex: sexEn(),
    description: text().default(""),
    approved: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    check(
      "approved_requires_completed_info",
      sql`
      NOT ${table.approved}
      OR (
        ${table.seasons} IS NOT NULL
        AND array_length(${table.seasons}, 1) > 0
        AND ${table.sex} IS NOT NULL
        AND ${table.description} != ''
      )
    `,
    ),
  ],
);
