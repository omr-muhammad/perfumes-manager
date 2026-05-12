import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { agingsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
  type WithAuth,
} from "../../../utils/globalSchema";
import { compoundLotsTable } from "../../../db/schema/compoundLots";
import type { InferSelectModel } from "drizzle-orm";

export type CompoundLotSelect = InferSelectModel<typeof compoundLotsTable>;
const AgingSchema = createInsertSchema(agingsTable, {
  amount: t.Number({ minimum: 1 }),
  startDate: t.String(),
  endDate: t.String(),
});

// ---------------- Create Compound ----------------
const CreateCompoundLot = t.Object({
  receivedAt: t.Optional(t.String()),
  status: t.Union([
    t.Literal("inuse"),
    t.Literal("ready"),
    t.Literal("expired"),
  ]),
  costPerKilo: t.Number({ minimum: 0 }),
  baseSellPerKilo: t.Number({ minimum: 0 }),
  oilAmountGm: t.Optional(t.Number({ minimum: 0 })),
  sprayAmountMl: t.Optional(t.Number({ minimum: 0 })),
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  alcoholId: t.Optional(ID),
});
export type CreateCompoundLot = Static<typeof CreateCompoundLot>;

const CreateCompound = t.Object({
  perfumeId: ID,
  companyId: ID,
  code: t.String(),
  density: t.Optional(t.Number()),
});
// export type CreateCompound = Static<typeof CreateCompound>;

const CreateCompBody = t.Object({
  compound: CreateCompound,
  lot: CreateCompoundLot,
  syncAlcohol: t.Boolean({ default: false }),
});
export type CreateCompBody = Static<typeof CreateCompBody>;

// ---------------- Update Compound ----------------
export const UpdateCompoundBody = t.Partial(CreateCompound);
export type UpdateCompoundBody = Static<typeof UpdateCompoundBody>;

const UpdateCompoundLot = t.Partial(CreateCompoundLot);
export type UpdateCompoundLot = Static<typeof UpdateCompoundLot>;
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
    minKiloSellPrice: t.Number({ minimum: 0 }),
    maxKiloSellPrice: t.Number({ minimum: 0 }),
    minSpraySellPrice: t.Number({ minimum: 0 }),
    maxSpraySellPrice: t.Number({ minimum: 0 }),
    minConcentration: t.Number({ minimum: 0 }),
    maxConcentration: t.Number({ minimum: 0 }),
    agingEndsBefore: t.String({ pattern: "^\d+[dmy]$" }),
    ...QueriesMeta,
  }),
);
export type CompoundsQueryFilters = Static<typeof CompoundsQueryFilters>;

// ---------------- Create Aging ----------------
const CreateAging = t.Omit(AgingSchema, [
  "updatedAt",
  "createdAt",
  "compoundId",
]);
export type CreateAging = Static<typeof CreateAging>;

const CreateAgingBody = t.Object({
  newAging: CreateAging,
  syncAlcohol: t.Boolean({ default: false }),
});
export type CreateAgingBody = Static<typeof CreateAgingBody>;

// ---------------- Update Aging ----------------
const UpdateAgingBody = t.Object({
  updates: t.Partial(CreateAging),
  syncAlcohol: t.Boolean({ default: false }),
});
export type UpdateAgingBody = Static<typeof UpdateAgingBody>;

// ---------------- Delete Aging ----------------
const RemoveAgingBody = t.Object({
  syncAlcohol: t.Boolean({ default: false }),
});
export type RemoveAgingBody = Static<typeof RemoveAgingBody>;

// ---------------- URL Params ----------------
const baseParams = {
  shopId: ID,
  compId: ID,
};
const CompParams = t.Object(baseParams);
type CompParams = Static<typeof CompParams>;

// Lots
const compLotParams = {
  ...baseParams,
  lotId: ID,
};
const CompLotParams = t.Object(compLotParams);
export type CompLotParams = Static<typeof CompLotParams>;

// Agings
const AgingParams = t.Object({
  ...compLotParams,
  agingId: ID,
});
type AgingParams = Static<typeof AgingParams>;

// ---------------- Service IDs ----------------
export interface ServiceIDs {
  base: WithAuth<ShopParams>;
  extendsComp: WithAuth<CompParams>;
  extendsCompLot: WithAuth<CompLotParams>;
  extendsLotAging: WithAuth<AgingParams>;
}

// ---------------- Compounds CTXs ----------------
export interface CompCTXs {
  // Compounds
  createComp: Ctx<CreateCompBody, ShopParams>;
  updateComp: Ctx<UpdateCompoundBody, CompParams>;
  delComp: Ctx<unknown, CompParams>;
  queryAllComps: Ctx<unknown, ShopParams>;
  queryCompById: Ctx<unknown, CompParams>;

  // Lots
  createCompLot: Ctx<CreateCompoundLot, CompParams>;
  updateCompoundLot: Ctx<UpdateCompoundLot, CompLotParams>;
  delCompoundLot: Ctx<unknown, CompLotParams>;

  // Agings
  createLotAging: Ctx<CreateAgingBody, CompLotParams>;
  updateLotAging: Ctx<UpdateAgingBody, AgingParams>;
  delLotAging: Ctx<RemoveAgingBody, AgingParams>;
  queryLotAgings: Ctx<unknown, CompLotParams>;
  queryOneAging: Ctx<unknown, AgingParams>;
}

// ---------------- Compounds Schema ----------------
export const CompSchema = {
  // Compounds
  createComp: { params: ShopParams, body: CreateCompBody },
  queryAllComps: { params: ShopParams, query: CompoundsQueryFilters },
  queryCompById: { params: CompParams },
  updateComp: { params: CompParams, body: UpdateCompoundBody },
  delComp: { params: CompParams },

  // Lots
  createCompLot: { params: CompParams, body: CreateCompoundLot },
  updateCompLot: { params: CompLotParams, body: UpdateCompoundLot },
  delCompLot: { params: CompLotParams },

  // Agings
  queryLotAgings: { params: CompLotParams },
  queryOneAging: { params: AgingParams },
  createLotAging: { body: CreateAgingBody, params: AgingParams },
  updateLotAging: { params: AgingParams, body: UpdateAgingBody },
  delLotAging: { params: AgingParams, body: RemoveAgingBody },
};
