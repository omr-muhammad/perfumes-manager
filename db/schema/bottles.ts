import {
  check,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import { bottleCatgeroyEn, bottleTypeEn } from "./enums";
import { shops } from "./shops";
import { timestamps } from "../columns.helpers";
import { sql } from "drizzle-orm";

export const bottles = pgTable(
  "bottles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 50 })
      .notNull()
      .unique("name_must_be_unique"),
    type: bottleTypeEn("type").notNull(),
    size: smallint("size").notNull(),
    category: bottleCatgeroyEn("category").notNull(),
    price: numeric("price", { precision: 5, scale: 2 }).notNull(),
    img: text("img"),
    shopId: integer("shop_id")
      .references(() => shops.id, { onDelete: "cascade" })
      .notNull(),
    ...timestamps,
  },
  (bottle) => [
    check(
      "bottle_size_must_be_positive",
      sql`
      ${bottle.size} > 0
    `,
    ),
    check(
      "bottle_price_must_be_positive",
      sql`
      ${bottle.price} > 0
    `,
    ),
  ],
);
