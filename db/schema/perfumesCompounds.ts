// prettier-ignore
import { foreignKey, integer, numeric, pgTable, unique, varchar } from "drizzle-orm/pg-core";
import { perfumesTable, companiesTable, shopsTable } from ".";
import { timestamps } from "../columns.helpers";
import { relations } from "drizzle-orm";

export const perfumeCompoundsTable = pgTable(
  "perfumes_compounds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    density: numeric("density", { precision: 4, scale: 3 })
      .notNull()
      .default("0.9"),
    code: varchar("code", { length: 50 }).notNull(),
    perfumeId: integer("perfume_id").notNull(),
    companyId: integer("company_id").notNull(),
    shopId: integer("shop_id").notNull(),
    ...timestamps,
  },
  (pfComp) => [
    unique("pc_uq").on(
      pfComp.perfumeId,
      pfComp.companyId,
      pfComp.shopId,
      pfComp.code,
    ),
    foreignKey({
      name: "pc_perfume_fk",
      columns: [pfComp.perfumeId],
      foreignColumns: [perfumesTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "pc_company_fk",
      columns: [pfComp.companyId],
      foreignColumns: [companiesTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "pc_shop_fk",
      columns: [pfComp.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
  ],
);

export const pfCompRelations = relations(perfumeCompoundsTable, ({ one }) => ({
  perfume: one(perfumesTable, {
    fields: [perfumeCompoundsTable.perfumeId],
    references: [perfumesTable.id],
  }),
  company: one(companiesTable, {
    fields: [perfumeCompoundsTable.companyId],
    references: [companiesTable.id],
  }),
}));
