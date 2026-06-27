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
import {
  ALL_AMOUNTS_NNEG_CHK,
  ALL_COST_LTE_BASE_CHK,
  ALL_EXPIRY_DATE_FUTURE_CHK,
  ALL_FK,
  ALL_REMAINING_LTE_AMOUNT_CHK,
  ALL_UQ,
} from "../../utils/errorMap";

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
    unique(ALL_UQ).on(lot.amountInMl, lot.receivedAt, lot.literCost),
    foreignKey({
      name: ALL_FK,
      columns: [lot.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("cascade"),
    check(
      ALL_COST_LTE_BASE_CHK,
      sql`
    ${lot.literCost} <=   ${lot.literPrice}
  `,
    ),
    check(
      ALL_AMOUNTS_NNEG_CHK,
      sql`
      ${lot.remainingAmount} >= 0 AND ${lot.amountInMl} >= 0 
    `,
    ),
    check(
      ALL_REMAINING_LTE_AMOUNT_CHK,
      sql`
      ${lot.remainingAmount} <= ${lot.amountInMl}  
    `,
    ),
    check(
      ALL_EXPIRY_DATE_FUTURE_CHK,
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
