import {
  check,
  integer,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";
import { alcoholsTable, compoundLotsTable } from ".";

export const aging = pgTable(
  "agings",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    amount: integer("amount").notNull(),
    concentration: integer("concentration").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    lotId: integer("lot_id")
      .notNull()
      .references(() => compoundLotsTable.id, { onDelete: "cascade" }),
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
      table.lotId,
    ),
    check(
      "amount_must_be_positive",
      sql`
        ${table.amount} > 0
      `,
    ),
    check(
      "invalid_concnetration_range",
      sql`
        ${table.concentration} BETWEEN 1 AND 100
      `,
    ),
  ],
);
