import {
  check,
  integer,
  pgTable,
  smallint,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { timestamps } from "../columns.helpers";
import { shops } from "./shops";

export const alcohols = pgTable(
  "alcohols",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    concentration: smallint("concentration").default(96),
    shopId: integer("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
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
    )
  ],
);
