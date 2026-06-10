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
    amountInMl: numeric("amountInMl", { precision: 15, scale: 4 })
      .notNull()
      .default("0"),
    remainingAmount: numeric("remaining_amount", { precision: 15, scale: 4 })
      .notNull()
      .default("0"),
    expiryDate: timestamp("expiry_date").notNull(),
    literCost: numeric("liter_cost", {
      precision: 10,
      scale: 3,
    }).notNull(),
    literPrice: numeric("liter_price", {
      precision: 10,
      scale: 3,
    }).notNull(),
    mlCost: numeric("ml_cost", { precision: 5, scale: 2 })
      .generatedAlwaysAs(sql`liter_cost / 1000`)
      .notNull(),
    mlPrice: numeric("ml_price", { precision: 5, scale: 2 })
      .generatedAlwaysAs(sql`liter_price / 1000`)
      .notNull(),
    alcoholId: integer("alcohol_id").notNull(),
    ...timestamps,
  },
  (lot) => [
    unique("alcohol_lots_uq").on(lot.amountInMl, lot.receivedAt, lot.literCost),
    foreignKey({
      name: "alcohol_lots_fk",
      columns: [lot.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("cascade"),
    check(
      "alcohol_lots_cost_lte_base_chk",
      sql`
    ${lot.literCost} <=   ${lot.literPrice}
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
