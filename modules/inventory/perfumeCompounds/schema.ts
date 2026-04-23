import { createInsertSchema } from "drizzle-typebox";
import { agingTable, perfumesCompoundsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
} from "../../../utils/globalSchema";

const PerfumeCompoundSchema = createInsertSchema(perfumesCompoundsTable, {
  kiloBuyPrice: t.Number({ minimum: 0 }),
  kiloSellPrice: t.Number({ minimum: 0 }),
});
const AgingSchema = createInsertSchema(agingTable, {
  amount: t.Number({ minimum: 1 }),
  startDate: t.String(),
  endDate: t.String(),
});

// ---------------- Create Aging ----------------
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

// ---------------- Update Aging ----------------
export const UpdateAgingBody = t.Object({
  updates: t.Partial(
    t.Omit(AgingSchema, ["updatedAt", "createdAt", "compoundId"]),
  ),
  retrieveAcohol: t.Boolean({ default: false }),
});
export type UpdateAgingBody = Static<typeof UpdateAgingBody>;

// ---------------- Delete Aging ----------------
export const RemoveAgingBody = t.Object({
  retrieveAcohol: t.Boolean({ default: false }),
});
export type RemoveAgingBody = Static<typeof RemoveAgingBody>;

// ---------------- Create Compound ----------------
export const CreateCompound = t.Omit(PerfumeCompoundSchema, [
  "shopId",
  "mlPrice",
  "createdAt",
  "updatedAt",
]);
export type CreateCompound = Static<typeof CreateCompound>;
export const CreateCompBody = t.Object({
  compound: CreateCompound,
  aging: t.Optional(CreateAging),
  useAlcohol: t.Boolean({ default: false }),
});
export type CreateCompBody = Static<typeof CreateCompBody>;

// ---------------- Update Compound ----------------
export const UpdateCompoundBody = t.Partial(CreateCompound);
export type UpdateCompoundBody = Static<typeof UpdateCompoundBody>;

// ------------- Query -------------
export const CompoundsQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    companyName: t.String(),
    code: t.String(),
    minOilAmount: t.Number({ minimum: 0 }),
    maxOilAmount: t.Number({ minimum: 0 }),
    minSprayAmount: t.Number({ minimum: 0 }),
    maxSprayAmount: t.Number({ minimum: 0 }),
    minOilSellPrice: t.Number({ minimum: 0 }),
    maxOilSellPrice: t.Number({ minimum: 0 }),
    minSpraySellPrice: t.Number({ minimum: 0 }),
    maxSpraySellPrice: t.Number({ minimum: 0 }),
    minConcentration: t.Number({ minimum: 0 }),
    maxConcentration: t.Number({ minimum: 0 }),
    agingEndsBefore: t.String({ pattern: "^\d+[dmy]$" }),
    ...QueriesMeta,
  }),
);

export type CompoundsQueryFilters = Static<typeof CompoundsQueryFilters>;

// ---------------- URL Params ----------------
const CompoundParams = {
  shopId: ID,
  compId: ID,
};
export const CompParams = t.Object(CompoundParams);
export type CompParams = Static<typeof CompParams>;

export const AgingParams = t.Object({
  ...CompoundParams,
  agingId: ID,
});
export type AgingParams = Static<typeof AgingParams>;

// ---------------- Compounds CTXs ----------------
export interface CompCTXs {
  create: Ctx<CreateCompBody, ShopParams>;
  update: Ctx<UpdateCompoundBody, CompParams>;
  del: Ctx<unknown, CompParams>;
  queryAll: Ctx<unknown, ShopParams>;
  queryOne: Ctx<unknown, CompParams>;
  addAging: Ctx<CreateAgingBody, CompParams>;
  updateAging: Ctx<UpdateAgingBody, AgingParams>;
  delAging: Ctx<RemoveAgingBody, AgingParams>;
  queryCompAgings: Ctx<unknown, CompParams>;
  queryOneAging: Ctx<unknown, AgingParams>;
}

// ---------------- Compounds Schema ----------------
export const CompSchema = {
  create: { params: ShopParams, body: CreateCompBody },
  queryAll: { params: ShopParams, query: CompoundsQueryFilters },
  queryOne: { params: CompParams },
  update: { params: CompParams, body: UpdateCompoundBody },
  del: { params: CompParams },
  queryCompAgings: { params: CompParams },
  queryOneAging: { params: AgingParams },
  addAging: { body: CreateAgingBody, params: CompParams },
  updateAging: { params: AgingParams, body: UpdateAgingBody },
  delAging: { params: AgingParams, body: RemoveAgingBody },
};
