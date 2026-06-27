import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { langEn, roleEn } from "./enums";
import { relations } from "drizzle-orm";
import { addressesTable } from "./addresses";
import { shopsTable } from "./shops";
import { US_EMAIL_UQ, US_PHONE_UQ, US_USERNAME_UQ } from "../../utils/errorMap";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(),
  username: varchar("username", { length: 50 })
    .notNull()
    .unique(US_USERNAME_UQ),
  email: varchar("email", { length: 100 }).notNull().unique(US_EMAIL_UQ),
  password: varchar("password", { length: 200 }).notNull(),
  role: roleEn("role").notNull().default("customer"),
  language: langEn("language").default("ar"),
  phone: varchar("phone", { length: 50 }).unique(US_PHONE_UQ),

  active: boolean().notNull().default(true),
  tokenVersion: integer("token_version").notNull().default(0),
  ...timestamps,
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  address: one(addressesTable),
  shops: many(shopsTable),
}));
