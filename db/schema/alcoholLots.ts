import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { lotStatusEn } from "./enums";
import { relations, sql } from "drizzle-orm";
import { timestamps } from "../columns.helpers";
import { alcoholsTable } from ".";

export const alcoholLotsTable = pgTable(
  "alcohol_lots",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    status: lotStatusEn("status").notNull(),
    amountInMl: integer("amountInMl").notNull().default(0),
    remainingAmount: integer("remaining_amount").notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    costPerLiter: numeric("cost_per_liter", {
      precision: 10,
      scale: 3,
    }).notNull(),
    baseSellPerLiter: numeric("base_sell_per_liter", {
      precision: 10,
      scale: 3,
    }).notNull(),
    baseMlSell: numeric("base_ml_sell", { precision: 5, scale: 2 })
      .generatedAlwaysAs(sql`base_sell_per_liter / 1000`)
      .notNull(),
    alcoholId: integer("alcohol_id")
      .references(() => alcoholsTable.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  (lot) => [
    unique("alcohol_lots_key").on(
      lot.amountInMl,
      lot.receivedAt,
      lot.costPerLiter,
    ),
    check(
      "alcohol_lots_cost_per_liter_base_sell_per_liter_chk",
      sql`
    ${lot.costPerLiter} <=   ${lot.baseSellPerLiter}
  `,
    ),
    check(
      `alcohol_lots_amount_remaining_amount_chk`,
      sql`
      ${lot.remainingAmount} <= ${lot.amountInMl}  
    `,
    ),
    check(
      `alcohol_lots_remaining_amount_chk`,
      sql`
      ${lot.remainingAmount} >= 0  
    `,
    ),
  ],
);

export const alcoLotRelations = relations(alcoholLotsTable, ({ one }) => ({
  alcohol: one(alcoholsTable, {
    fields: [alcoholLotsTable.alcoholId],
    references: [alcoholsTable.id],
  }),
}));
