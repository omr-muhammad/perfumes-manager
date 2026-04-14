import {
  check,
  integer,
  pgTable,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { shops } from "./shops";
import { users } from "./users";
import { staffEn } from "./enums";
import { timestamps } from "../columns.helpers";

export const shopStaff = pgTable(
  "shop_staff",
  {
    shopId: integer("shop_id")
      .references(() => shops.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: staffEn("role").notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.shopId, table.userId] }),
  ],
);
