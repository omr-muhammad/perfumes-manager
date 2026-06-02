import {
  check,
  integer,
  pgTable,
  smallint,
  varchar,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { timestamps } from "../columns.helpers";
import { agingsTable, alcoholLotsTable, shopsTable } from ".";

export const alcoholsTable = pgTable(
  "alcohols",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    concentration: smallint("concentration").default(96),
    shopId: integer("shop_id").notNull(),
    ...timestamps,
  },
  (alco) => [
    unique("alcohols_uq").on(
      alco.name,
      alco.type,
      alco.concentration,
      alco.shopId,
    ),
    foreignKey({
      name: "alcohols_shop_id_fk",
      columns: [alco.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
    check(
      "alcohols_concentration_range_chk",
      sql`${alco.concentration} > 0 AND ${alco.concentration} <= 100`,
    ),
  ],
);

export const alcoRelations = relations(alcoholsTable, ({ one, many }) => ({
  shop: one(shopsTable, {
    fields: [alcoholsTable.shopId],
    references: [shopsTable.id],
  }),
  agings: many(agingsTable),
  lots: many(alcoholLotsTable),
}));
