import { createInsertSchema } from "drizzle-typebox";
import { perfumesCompoundsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import { ID } from "../../../utils/globalSchema";

const PerfumeCompoundSchema = createInsertSchema(perfumesCompoundsTable, {
  kiloBuyPrice: t.Number({ minimum: 0 }),
  kiloSellPrice: t.Number({ minimum: 0 }),
});

export const CreateCompoundBody = t.Omit(PerfumeCompoundSchema, [
  "shopId",
  "mlPrice",
  "createdAt",
  "updatedAt",
]);
export type CreateCompoundBody = Static<typeof CreateCompoundBody>;

export const UpdateCompoundBody = t.Partial(CreateCompoundBody);
export type UpdateCompoundBody = Static<typeof UpdateCompoundBody>;

export const CompParams = t.Object({
  shopId: ID,
  compId: ID,
});
export type CompParams = Static<typeof CompParams>;
