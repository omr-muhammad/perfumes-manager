import {
  check,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { relations, sql } from "drizzle-orm";
import { alcoholsTable, compoundLotsTable } from ".";

export const agingsTable = pgTable(
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
  (aging) => [
    unique("agings_uq").on(
      aging.amount,
      aging.startDate,
      aging.endDate,
      aging.lotId,
    ),
    foreignKey({
      name: "agings_lot_fk",
      columns: [aging.lotId],
      foreignColumns: [compoundLotsTable.id],
    }).onDelete("cascade"),

    foreignKey({
      name: "agings_alcohol_fk",
      columns: [aging.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("restrict"),

    check(
      "agings_amount_pos_chk",
      sql`
        ${aging.amount} > 0
      `,
    ),
    check(
      "agings_concentration_range_chk",
      sql`
        ${aging.concentration} BETWEEN 1 AND 100
      `,
    ),
  ],
);

export const agingRelations = relations(agingsTable, ({ one }) => ({
  compoundLot: one(compoundLotsTable, {
    fields: [agingsTable.lotId],
    references: [compoundLotsTable.id],
  }),
  alcohol: one(alcoholsTable, {
    fields: [agingsTable.alcoholId],
    references: [alcoholsTable.id],
  }),
}));
