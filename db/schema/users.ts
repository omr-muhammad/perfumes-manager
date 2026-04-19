import { boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { langEn, roleEn } from "./enums";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(),
  username: varchar("username", { length: 50 })
    .notNull()
    .unique("username_must_be_unique"),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 200 }).notNull(),
  role: roleEn("role").notNull().default("customer"),
  language: langEn("language").default("ar"),
  phone: varchar("phone", { length: 50 }).unique(),
  active: boolean().notNull().default(true),
  tokenVersion: integer("token_version").notNull().default(0),
  ...timestamps,
});
