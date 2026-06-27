import {
  check,
  integer,
  pgTable,
  smallint,
  text,
  varchar,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { bottleCatgeroyEn, bottleTypeEn } from "./enums";
import { bottlesLotsTable, shopsTable } from ".";
import { timestamps } from "../columns.helpers";
import { relations, sql } from "drizzle-orm";
import { BT_SHOP_FK, BT_SIZE_POS_CHK, BT_UQ } from "../../utils/errorMap";

export const bottlesTable = pgTable(
  "bottles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 }),
    type: bottleTypeEn("type").notNull(),
    size: smallint("size").notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    category: bottleCatgeroyEn("category").notNull(),
    img: text("img"),
    shopId: integer("shop_id").notNull(),
    ...timestamps,
  },
  (bottle) => [
    unique(BT_UQ).on(bottle.shopId, bottle.sku),
    foreignKey({
      name: BT_SHOP_FK,
      columns: [bottle.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
    check(
      BT_SIZE_POS_CHK,
      sql`
      ${bottle.size} > 0
    `,
    ),
  ],
);

export const bottlesRelations = relations(bottlesTable, ({ one, many }) => ({
  shop: one(shopsTable, {
    fields: [bottlesTable.shopId],
    references: [shopsTable.id],
  }),
  lots: many(bottlesLotsTable),
}));
