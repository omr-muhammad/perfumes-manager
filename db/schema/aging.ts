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
import { alcoholsTable } from ".";

export const aging = pgTable(
  "aging",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    amount: integer("amount").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    compoundId: integer("compound_id")
      .notNull()
      .references(() => perfumesCompounds.id, { onDelete: "cascade" }),
    alcoholId: integer("alcohol_id")
      .notNull()
      .references(() => alcoholsTable.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    unique("duplicate_entry").on(
      table.amount,
      table.startDate,
      table.endDate,
      table.compoundId,
    ),
    check(
      "amount_must_be_positive",
      sql`
        ${table.amount} > 0
      `,
    ),
  ],
);
