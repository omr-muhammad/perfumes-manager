import { foreignKey, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { staffEn } from "./enums";
import { timestamps } from "../columns.helpers";
import { shopsTable, usersTable } from ".";
import { relations } from "drizzle-orm";

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
      name: "shops_staff_shop_user_pk",
      columns: [table.shopId, table.userId],
    }),
    foreignKey({
      name: "shops_staff_shop_id_fk",
      columns: [table.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "shops_staff_user_id_fk",
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ],
);

export const shopsStaffRelations = relations(shopsStaffTable, ({ many }) => ({
  shops: many(shopsTable),
  users: many(usersTable),
}));
