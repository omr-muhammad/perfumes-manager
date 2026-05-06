import {
  check,
  integer,
  pgTable,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { staffEn } from "./enums";
import { timestamps } from "../columns.helpers";
import { shopsTable, usersTable } from ".";

export const shopsStaffTable = pgTable(
  "shop_staff",
  {
    shopId: integer("shop_id")
      .references(() => shopsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    role: staffEn("role").notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ name: "id", columns: [table.shopId, table.userId] }),
  ],
);
