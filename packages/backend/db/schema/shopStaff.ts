import { foreignKey, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { staffEn } from "./enums";
import { timestamps } from "../columns.helpers";
import { shopsTable, usersTable } from ".";
import { relations } from "drizzle-orm";
import { SS_SHOP_FK, SS_SHOP_USER_PK, SS_USER_FK } from "../../utils/errorMap";

export const shopsStaffTable = pgTable(
  "shop_staff",
  {
    shopId: integer("shop_id").notNull(),
    userId: integer("user_id").notNull(),
    role: staffEn("role").notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({
      name: SS_SHOP_USER_PK,
      columns: [table.shopId, table.userId],
    }),
    foreignKey({
      name: SS_SHOP_FK,
      columns: [table.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: SS_USER_FK,
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ],
);

export const shopsStaffRelations = relations(shopsStaffTable, ({ many }) => ({
  shops: many(shopsTable),
  users: many(usersTable),
}));
