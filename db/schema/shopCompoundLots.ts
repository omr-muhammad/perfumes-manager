import { relations, sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  integer,
  numeric,
  pgTable,
  smallint,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { alcoholsTable, shopCompsTable } from ".";
import { lotStatusEn } from "./enums";
import { timestamps } from "../columns.helpers";
import {
  CL_ALCOHOL_CHK,
  CL_ALCOHOL_FK,
  CL_CONCENTRATION_RANGE_CHK,
  CL_OIL_SPRAY_AMOUNT_POS_CHK,
  CL_REMAINING_LTE_AMOUNT_CHK,
  CL_SHOP_COMP_FK,
  CL_STOCK_GTE_0_CHK,
  CL_UQ,
} from "../../utils/errorMap";

export const shopCompLotsTable = pgTable(
  "shop_compound_lots",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    densitySnapshot: numeric("density_snapshot", {
      precision: 4,
      scale: 3,
    }).notNull(),
    status: lotStatusEn("status").notNull(),
    kiloCost: numeric("kilo_cost", {
      precision: 10,
      scale: 4,
    }).notNull(),
    kiloPrice: numeric("kilo_price", {
      precision: 10,
      scale: 4,
    }).notNull(),
    gmCost: numeric("gm_cost", { precision: 10, scale: 4 })
      .notNull()
      .generatedAlwaysAs(sql`kilo_cost / 1000.0`),
    gmPrice: numeric("gm_price", { precision: 10, scale: 4 })
      .notNull()
      .generatedAlwaysAs(sql`kilo_price / 1000.0`),
    mlCost: numeric("ml_cost", { precision: 10, scale: 4 })
      .notNull()
      .generatedAlwaysAs(
        sql`concentration / 100.0 * density_snapshot * (kilo_cost / 1000)`,
      ),
    mlPrice: numeric("ml_price", { precision: 10, scale: 4 })
      .notNull()
      .generatedAlwaysAs(
        sql`concentration / 100.0 * density_snapshot * (kilo_price / 1000)`,
      ),
    oilAmountGm: numeric("oil_amount_gm", { precision: 10, scale: 4 }).default(
      "0",
    ),
    sprayAmountMl: numeric("spray_amount_ml", {
      precision: 10,
      scale: 4,
    }).default("0"),
    concentration: smallint("concentration"),
    remainingOilAmount: numeric("remaining_oil_amount", {
      precision: 10,
      scale: 4,
    }).default("0"),
    remainingSprayAmount: numeric("remaining_spray_amount", {
      precision: 10,
      scale: 4,
    }).default("0"),
    shopCompoundId: integer("shop_compound_id").notNull(),
    alcoholId: integer("alcohol_id"),
    ...timestamps,
  },
  (lot) => [
    unique(CL_UQ).on(lot.shopCompoundId, lot.receivedAt, lot.kiloCost),
    foreignKey({
      name: CL_SHOP_COMP_FK,
      columns: [lot.shopCompoundId],
      foreignColumns: [shopCompsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: CL_ALCOHOL_FK,
      columns: [lot.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("cascade"),
    check(
      CL_OIL_SPRAY_AMOUNT_POS_CHK,
      sql`
    ${lot.oilAmountGm} > 0 OR ${lot.sprayAmountMl} > 0  
  `,
    ),
    check(
      CL_CONCENTRATION_RANGE_CHK,
      sql`${lot.sprayAmountMl} = 0 OR ${lot.concentration} BETWEEN 1 AND 100`,
    ),
    check(
      CL_ALCOHOL_CHK,
      sql`
        ${lot.sprayAmountMl} = 0
        OR
        ${lot.alcoholId} IS NOT NULL
      `,
    ),
    check(
      CL_REMAINING_LTE_AMOUNT_CHK,
      sql`
        ${lot.remainingOilAmount} <= ${lot.oilAmountGm} 
        AND
        ${lot.remainingSprayAmount} <= ${lot.sprayAmountMl}
      `,
    ),
    check(
      CL_STOCK_GTE_0_CHK,
      sql`
        ${lot.oilAmountGm} >= 0 AND 
        ${lot.remainingOilAmount} >= 0 AND
        ${lot.sprayAmountMl} >= 0 AND
        ${lot.remainingSprayAmount} >= 0
      `,
    ),
  ],
);

export const shopCompLotRelations = relations(shopCompLotsTable, ({ one }) => ({
  shopCompound: one(shopCompsTable, {
    fields: [shopCompLotsTable.shopCompoundId],
    references: [shopCompsTable.id],
  }),
}));
