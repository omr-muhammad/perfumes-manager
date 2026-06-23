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
import { alcoholsTable, shopCompLotsTable } from ".";
import {
  AG_ALCOHOL_FK,
  AG_AMOUNT_POS_CHK,
  AG_CONCENTRATION_RANGE_CHK,
  AG_LOT_FK,
  AG_UQ,
} from "../../utils/errorMap";

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
      .references(() => shopCompLotsTable.id, { onDelete: "cascade" }),
    alcoholId: integer("alcohol_id")
      .notNull()
      .references(() => alcoholsTable.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (aging) => [
    unique(AG_UQ).on(aging.amount, aging.startDate, aging.endDate, aging.lotId),
    foreignKey({
      name: AG_LOT_FK,
      columns: [aging.lotId],
      foreignColumns: [shopCompLotsTable.id],
    }).onDelete("cascade"),

    foreignKey({
      name: AG_ALCOHOL_FK,
      columns: [aging.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("restrict"),

    check(
      AG_AMOUNT_POS_CHK,
      sql`
        ${aging.amount} > 0
      `,
    ),
    check(
      AG_CONCENTRATION_RANGE_CHK,
      sql`
        ${aging.concentration} BETWEEN 1 AND 100
      `,
    ),
  ],
);

export const agingRelations = relations(agingsTable, ({ one }) => ({
  compoundLot: one(shopCompLotsTable, {
    fields: [agingsTable.lotId],
    references: [shopCompLotsTable.id],
  }),
  alcohol: one(alcoholsTable, {
    fields: [agingsTable.alcoholId],
    references: [alcoholsTable.id],
  }),
}));
