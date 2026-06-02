import {
  check,
  foreignKey,
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
    alcoholId: integer("alcohol_id").notNull(),
    ...timestamps,
  },
  (lot) => [
    unique("alcohol_lots_uq").on(
      lot.amountInMl,
      lot.receivedAt,
      lot.costPerLiter,
    ),
    foreignKey({
      name: "alcohol_lots_fk",
      columns: [lot.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("cascade"),
    check(
      "alcohol_lots_cost_lte_base_chk",
      sql`
    ${lot.costPerLiter} <=   ${lot.baseSellPerLiter}
  `,
    ),
    check(
      `alcohol_lots_amounts_nneg_chk`,
      sql`
      ${lot.remainingAmount} >= 0 AND ${lot.amountInMl} >= 0 
    `,
    ),
    check(
      `alcohol_lots_remaining_lte_amount_chk`,
      sql`
      ${lot.remainingAmount} <= ${lot.amountInMl}  
    `,
    ),
    check(
      `alcohol_lots_expiry_date_future_chk`,
      sql`
        ${lot.expiryDate} > NOW()
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
