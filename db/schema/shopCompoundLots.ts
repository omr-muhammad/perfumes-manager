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
    shopCompoundId: integer("shop_compound_id").notNull(),
    alcoholId: integer("alcohol_id"),
    ...timestamps,
  },
  (lot) => [
    unique("comp_lots_uq").on(
      lot.shopCompoundId,
      lot.receivedAt,
      lot.costPerKilo,
    ),
    foreignKey({
      name: "comp_lots_shop_comp_id_fk",
      columns: [lot.shopCompoundId],
      foreignColumns: [shopCompsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "comp_lots_alcohol_id_fk",
      columns: [lot.alcoholId],
      foreignColumns: [alcoholsTable.id],
    }).onDelete("cascade"),
    check(
      "comp_lots_oil_spray_amount_pos_chk",
      sql`
    ${lot.oilAmountGm} > 0 OR ${lot.sprayAmountMl} > 0  
  `,
    ),
    check(
      "comp_lots_concentration_range_chk",
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

export const shopCompLotRelations = relations(shopCompLotsTable, ({ one }) => ({
  shopCompound: one(shopCompsTable, {
    fields: [shopCompLotsTable.shopCompoundId],
    references: [shopCompsTable.id],
  }),
}));
