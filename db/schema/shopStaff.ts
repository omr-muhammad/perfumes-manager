import { check, integer, pgTable, unique } from "drizzle-orm/pg-core";
import { shops } from "./shops";
import { users } from "./users";
import { staffEn } from "./enums";
import { timestamps } from "../columns.helpers";

export const shopStaff = pgTable(
  "shop_staff",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    shopId: integer()
      .references(() => shops.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: staffEn().notNull(),
    ...timestamps,
  },
  (table) => [unique().on(table.shopId, table.userId)],
);
