import { foreignKey, integer, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { perfumeCompoundsTable } from "./perfumesCompounds";
import { shopsTable } from "./shops";
import { timestamps } from "../columns.helpers";
import { relations } from "drizzle-orm";
import { SC_COMPOUND_FK, SC_SHOP_FK, SC_UQ } from "../../utils/errorMap";

export const shopCompsTable = pgTable(
  "shop_compounds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    compoundId: integer("compound_id").notNull(),
    shopId: integer("shop_id").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    ...timestamps,
  },
  (shopComp) => [
    uniqueIndex(SC_UQ).on(shopComp.compoundId, shopComp.shopId),
    foreignKey({
      name: SC_COMPOUND_FK,
      columns: [shopComp.compoundId],
      foreignColumns: [perfumeCompoundsTable.id],
    }).onDelete("restrict"),
    foreignKey({
      name: SC_SHOP_FK,
      columns: [shopComp.shopId],
      foreignColumns: [shopsTable.id],
    }).onDelete("cascade"),
  ],
);

export const shopCompsRelations = relations(shopCompsTable, ({ many }) => ({
  shops: many(shopsTable),
  compounds: many(perfumeCompoundsTable),
}));
