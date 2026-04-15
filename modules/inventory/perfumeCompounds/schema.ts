import { createInsertSchema } from "drizzle-typebox";
import { agingTable, perfumesCompoundsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import { ID } from "../../../utils/globalSchema";

const PerfumeCompoundSchema = createInsertSchema(perfumesCompoundsTable, {
  kiloBuyPrice: t.Number({ minimum: 0 }),
  kiloSellPrice: t.Number({ minimum: 0 }),
});
const AgingSchema = createInsertSchema(agingTable, {
  amount: t.Number({ minimum: 1 }),
  startDate: t.String(),
  endDate: t.String(),
});

export const CreateCompound = t.Omit(PerfumeCompoundSchema, [
  "shopId",
  "mlPrice",
  "createdAt",
  "updatedAt",
]);
export type CreateCompound = Static<typeof CreateCompound>;

export const CreateAging = t.Omit(AgingSchema, [
  "updatedAt",
  "createdAt",
  "compoundId",
]);
export type CreateAging = Static<typeof CreateAging>;

export const CreateAgingBody = t.Object({
  newAging: CreateAging,
  useAlcohol: t.Boolean({ default: false }),
});
export type CreateAgingBody = Static<typeof CreateAgingBody>;

export const UpdateAgingBody = t.Object({
  updates: t.Partial(
    t.Omit(AgingSchema, ["updatedAt", "createdAt", "compoundId"]),
  ),
  retrieveAcohol: t.Boolean({ default: false }),
});
export type UpdateAgingBody = Static<typeof UpdateAgingBody>;

export const RemoveAgingBody = t.Object({
  retrieveAcohol: t.Boolean({ default: false }),
});
export type RemoveAgingBody = Static<typeof RemoveAgingBody>;

export const CreateCompBody = t.Object({
  compound: CreateCompound,
  aging: t.Optional(CreateAging),
  useAlcohol: t.Boolean({ default: false }),
});
export type CreateCompBody = Static<typeof CreateCompBody>;

export const UpdateCompoundBody = t.Partial(CreateCompound);
export type UpdateCompoundBody = Static<typeof UpdateCompoundBody>;

export const CompParams = t.Object({
  shopId: ID,
  compId: ID,
});
export type CompParams = Static<typeof CompParams>;

export const AgingParams = t.Object({
  shopId: ID,
  compId: ID,
  agingId: ID,
});
export type AgingParams = Static<typeof AgingParams>;
