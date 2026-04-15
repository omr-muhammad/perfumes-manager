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
import { shops } from "./shops";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";

export const bottles = pgTable(
  "bottles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 }),
    sku: varchar("sku", { length: 50 }).notNull(),
    type: bottleTypeEn("type").notNull(),
    size: smallint("size").notNull(),
    category: bottleCatgeroyEn("category").notNull(),
    buyPrice: numeric("buy_price", { precision: 5, scale: 2 }).notNull(),
    sellPrice: numeric("price", { precision: 5, scale: 2 }).notNull(),
    img: text("img"),
    shopId: integer("shop_id")
      .references(() => shops.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
    stock: integer("stock").notNull().default(0),
  },
  (bottle) => [
    unique("bottle_must_have_unique_sku").on(
      bottle.sku,
      bottle.shopId,
      bottle.size,
    ),
    check(
      "bottle_size_must_be_positive",
      sql`
      ${bottle.size} > 0
    `,
    ),
    check(
      "bottle_prices_cannot_be_negative",
      sql`
      ${bottle.sellPrice} >= 0 AND ${bottle.buyPrice} >= 0
    `,
    ),
    check(
      "bottle_sell_price_must_be_above_buy_price_or_equal",
      sql`
        ${bottle.sellPrice} >= ${bottle.buyPrice}
      `,
    ),
    check(
      "bottle_stock_must_be_positive",
      sql`
        ${bottle.stock} >= 0
      `,
    ),
  ],
);
