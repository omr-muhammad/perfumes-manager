import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { bottleCatgeroyEn, bottleTypeEn } from "./enums";
import { shopsTable } from ".";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";

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
    shopId: integer("shop_id")
      .references(() => shopsTable.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  (bottle) => [
    unique("duplicate_bottle").on(bottle.shopId, bottle.sku),
    check(
      "bottle_size_must_be_positive",
      sql`
      ${bottle.size} > 0
    `,
    ),
  ],
);
