import { createInsertSchema } from "drizzle-typebox";
import { agingsTable, shopCompsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
  type WithAuth,
} from "../../../utils/globalSchema";
import { enumToUnion } from "../../../utils/unionToLiteral";
import { lotStatusEn } from "../../../db/schema/enums";

const ShopCompSchema = createInsertSchema(shopCompsTable);

const AgingSchema = createInsertSchema(agingsTable, {
  amount: t.Number({ minimum: 1 }),
  startDate: t.String(),
  endDate: t.String(),
});

const LotStatusUnion = t.Union(enumToUnion(lotStatusEn), {
  error: `Status must be one of (${lotStatusEn.enumValues.join(", ")})`,
});

// ---------------- Create Shop Compound ----------------
const ShopComp = t.Object({
  compoundId: ID,
  code: t.String(),
});

const ShopCompLot = t.Object({
  receivedAt: t.Optional(t.String()),
  status: LotStatusUnion,
  kiloCost: t.Number({ minimum: 0 }),
  kiloPrice: t.Number({ minimum: 0 }),
  oilAmountGm: t.Optional(t.Number({ minimum: 0 })),
  sprayAmountMl: t.Optional(t.Number({ minimum: 0 })),
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  alcoholId: t.Optional(ID),
});
export type ShopCompLot = Static<typeof ShopCompLot>;

const CreateShopComp = t.Object({
  shopComp: ShopComp,
  lot: ShopCompLot,
});
export type CreateShopComp = Static<typeof CreateShopComp>;

// ---------------- Update Compound ----------------
const UpdateShopComp = t.Partial(ShopComp);
export type UpdateShopComp = Static<typeof UpdateShopComp>;

const UpdateShopCompLot = t.Partial(
  t.Omit(ShopCompLot, ["sprayAmountMl", "oilAmountGm"]),
);
export type UpdateShopCompLot = Static<typeof UpdateShopCompLot>;

const UpdateStock = t.Partial(
  t.Object({
    newSprayAmountMl: t.Number({ minimum: 0 }),
    newOilAmountGm: t.Number({ minimum: 0 }),
    syncAlcohol: t.Optional(t.Boolean()),
  }),
);
export type UpdateStock = Static<typeof UpdateStock>;

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

// ---------------- Update Aging ----------------
const UpdateAging = t.Object({
  updates: t.Partial(t.Omit(CreateAging, ["lotId"])),
  syncAlcohol: t.Optional(t.Boolean()),
});
export type UpdateAging = Static<typeof UpdateAging>;

// ---------------- Delete Aging ----------------
const RemoveAging = t.Object({
  syncAlcohol: t.Boolean({ default: false }),
});
export type RemoveAging = Static<typeof RemoveAging>;

// ---------------- URL Params ----------------
const baseParams = {
  shopId: ID,
  shopCompId: ID,
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
  createComp: Ctx<CreateShopComp, ShopParams>;
  updateComp: Ctx<UpdateShopComp, CompParams>;
  delComp: Ctx<unknown, CompParams>;
  queryAllComps: Ctx<unknown, ShopParams>;
  queryCompById: Ctx<unknown, CompParams>;

  // Lots
  createCompLot: Ctx<ShopCompLot, CompParams>;
  updateCompoundLot: Ctx<UpdateShopCompLot, CompLotParams>;
  updateLotStock: Ctx<UpdateStock, CompLotParams>;
  delCompoundLot: Ctx<unknown, CompLotParams>;

  // Agings
  createLotAging: Ctx<CreateAging, CompLotParams>;
  updateLotAging: Ctx<UpdateAging, AgingParams>;
  delLotAging: Ctx<RemoveAging, AgingParams>;
  queryLotAgings: Ctx<unknown, CompLotParams>;
  queryOneAging: Ctx<unknown, AgingParams>;
}

// ---------------- Compounds Schema ----------------
export const CompSchema = {
  // Compounds
  createComp: { params: ShopParams, body: CreateShopComp },
  queryAllComps: { params: ShopParams, query: CompoundsQueryFilters },
  queryCompById: { params: CompParams },
  updateComp: { params: CompParams, body: UpdateShopComp },
  delComp: { params: CompParams },

  // Lots
  createCompLot: { params: CompParams, body: ShopCompLot },
  updateCompLot: { params: CompLotParams, body: UpdateShopCompLot },
  updateLotStock: { params: CompLotParams, body: UpdateStock },
  delCompLot: { params: CompLotParams },

  // Agings
  queryLotAgings: { params: CompLotParams },
  queryOneAging: { params: AgingParams },
  createLotAging: { body: CreateAging, params: AgingParams },
  updateLotAging: { params: AgingParams, body: UpdateAging },
  delLotAging: { params: AgingParams, body: RemoveAging },
};
