import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../columns.helpers";
import { langEn, roleEn } from "./enums";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password: varchar({ length: 200 }).notNull(),
  role: roleEn().notNull().default("customer"),
  language: langEn().default("ar"),
  phone: varchar({ length: 50 }).unique(),
  ...timestamps,
});
