import { sql } from "drizzle-orm";
import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { alcoholsTable, perfumeCompoundsTable } from ".";
import { lotStatusEn } from "./enums";
import { timestamps } from "../columns.helpers";

export const compoundLotsTable = pgTable(
  "compound_lots",
  {
    id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
    receivedAt: timestamp("received_at").notNull().defaultNow(),
    densitySnapshot: numeric("density_snapshot", {
      precision: 4,
      scale: 3,
    }).notNull(),
    status: lotStatusEn("status").notNull(),
    costPerKilo: numeric("cost_per_kilo", {
      precision: 10,
      scale: 4,
    }).notNull(),
    baseSellPerKilo: numeric("base_sell_per_kilo", {
      precision: 10,
      scale: 4,
    }).notNull(),
    baseGmSell: numeric("base_gm_sell", { precision: 10, scale: 4 })
      .notNull()
      .generatedAlwaysAs(sql`base_sell_per_kilo / 1000`),
    oilAmountGm: integer("oil_amount_gm").default(0),
    sprayAmountMl: integer("spray_amount_ml").default(0),
    concentration: smallint("concentration"),
    remainingOilAmount: integer("remaining_oil_amount").default(0),
    remainingSprayAmount: integer("remaining_spray_amount").default(0),
    compoundId: integer("compound_id")
      .references(() => perfumeCompoundsTable.id, { onDelete: "cascade" })
      .notNull(),
    alcoholId: integer("alcohol_id").references(() => alcoholsTable.id, {
      onDelete: "restrict",
    }),
    ...timestamps,
  },
  (lot) => [
    unique("comp_lots_uq").on(lot.compoundId, lot.receivedAt, lot.costPerKilo),
    check(
      "comp_lots_oil_spray_amount_pos_chk",
      sql`
    ${lot.oilAmountGm} > 0 OR ${lot.sprayAmountMl} > 0  
  `,
    ),
    check(
      "comp_lots_concentration_chk",
      sql`${lot.sprayAmountMl} = 0 OR ${lot.concentration} BETWEEN 1 AND 100`,
    ),
    check(
      "comp_lots_alcohol_chk",
      sql`
        ${lot.sprayAmountMl} = 0
        OR
        ${lot.alcoholId} IS NOT NULL
      `,
    ),
    check(
      "comp_lots_remaining_lte_amount_chk",
      sql`
        ${lot.remainingOilAmount} <= ${lot.oilAmountGm} 
        AND
        ${lot.remainingSprayAmount} <= ${lot.sprayAmountMl}
      `,
    ),
    check(
      "comp_lots_stock_gte_0_chk",
      sql`
        ${lot.oilAmountGm} >= 0 AND 
        ${lot.remainingOilAmount} >= 0 AND
        ${lot.sprayAmountMl} >= 0 AND
        ${lot.remainingSprayAmount} >= 0
      `,
    ),
  ],
);
