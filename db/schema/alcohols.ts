import {
  check,
  integer,
  pgTable,
  smallint,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { timestamps } from "../columns.helpers";
import { alcoholLotsTable, shopsTable } from ".";

export const alcoholsTable = pgTable(
  "alcohols",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    concentration: smallint("concentration").default(96),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shopsTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    unique("alcohol_must_be_unique").on(
      table.name,
      table.type,
      table.concentration,
      table.shopId,
    ),
    check(
      "concentration_must_be_between_1_and_100",
      sql`${table.concentration} > 0 AND ${table.concentration} <= 100`,
    ),
  ],
);

export const alcoRelations = relations(alcoholsTable, ({ one, many }) => ({
  shop: one(shopsTable, {
    fields: [alcoholsTable.shopId],
    references: [shopsTable.id],
  }),
  lots: many(alcoholLotsTable),
}));
