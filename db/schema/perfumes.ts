import {
  pgTable,
  integer,
  varchar,
  boolean,
  text,
  check,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { relations, sql } from "drizzle-orm";
import { seasonsEn, sexEn } from "./enums";
import { perfumeCompoundsTable } from "./perfumesCompounds";

// later for better structure
// export const familiesEn = pgEnum("families", ["fresh", "aromatic", "citrus", "water", "green", "fruity", "floral", "soft floral", "oriental(Amber)", "floral oriental", "soft oriental", "woody oriental", "woody", "woods", "mossy woods", "dry woods"])

export const perfumesTable = pgTable(
  "perfumes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).unique("perfumes_uq").notNull(),
    seasons: seasonsEn("seasons").array(),
    sex: sexEn("sex"),
    description: text("description").default(""),
    approved: boolean("approved").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    check(
      "perfumes_approved_chk",
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
    check(
      "perfumes_seasons_limit_chk",
      sql`
        NOT ${table.approved}
        OR
        array_length(${table.seasons}, 1) <= 4
      `,
    ),
  ],
);

export const perfumesRelations = relations(perfumesTable, ({ many }) => ({
  compounds: many(perfumeCompoundsTable),
}));
