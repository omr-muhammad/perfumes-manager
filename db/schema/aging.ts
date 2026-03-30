import {
  check,
  integer,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { perfumesCompounds } from "./perfumesCompounds";
import { sql } from "drizzle-orm";

export const aging = pgTable(
  "aging",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    amount: integer().notNull(),
    startDate: timestamp().notNull(),
    endDate: timestamp().notNull(),
    compoundId: integer()
      .notNull()
      .references(() => perfumesCompounds.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique().on(table.amount, table.startDate, table.endDate, table.compoundId),
    check(
      "amount_must_be_positive",
      sql`
        ${table.amount} > 0
      `,
    ),
  ],
);
