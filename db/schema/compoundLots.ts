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
import { alcoholsTable, perfumesCompoundsTable } from ".";
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
      .references(() => perfumesCompoundsTable.id)
      .notNull(),
    alcoholId: integer("alcohol_id").references(() => alcoholsTable.id, {
      onDelete: "restrict",
    }),
    ...timestamps,
  },
  (lot) => [
    unique("perfume_compound_lot_must_be_unique").on(
      lot.receivedAt,
      lot.compoundId,
    ),
    check(
      "oil_or_spray_amount_must_be_available",
      sql`
    ${lot.oilAmountGm} > 0 OR ${lot.sprayAmountMl} > 0  
  `,
    ),
    check(
      "concentration_required_when_spray_amount_more_than_0",
      sql`${lot.sprayAmountMl} = 0 OR ${lot.concentration} BETWEEN 1 AND 100`,
    ),
    check(
      "alcohol_id_is_required_when_spray_amount_greater_than_0",
      sql`
        ${lot.sprayAmountMl} = 0
        OR
        ${lot.alcoholId} IS NOT NULL
      `,
    ),
    check(
      "remaining_amount_cannot_go_over_base_amount",
      sql`
        ${lot.remainingOilAmount} <= ${lot.oilAmountGm} 
        AND
        ${lot.remainingSprayAmount} <= ${lot.sprayAmountMl}
      `,
    ),
  ],
);
