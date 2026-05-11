import { createInsertSchema } from "drizzle-typebox";
import { bottlesLotsTable, bottlesTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
  type InvAuth,
} from "../../../utils/globalSchema";
import { enumToUnion } from "../../../utils/unionToLiteral";
import { bottleCatgeroyEn, bottleTypeEn } from "../../../db/schema/enums";
import { UpdateTier, CreateTier } from "../amountTiers/schema";

const BottleInsertSchema = createInsertSchema(bottlesTable, {
  size: t.Number({ minimum: 1 }),
});
const LotInsertSchema = createInsertSchema(bottlesLotsTable, {
  costPrice: t.Number({ minimum: 0 }),
  baseSellPrice: t.Number({ minimum: 0 }),
  receivedAt: t.String(),
});

const BottleTypeUnion = enumToUnion(bottleTypeEn);
export type BottleType = Static<typeof BottleTypeUnion>;

const BottleCatgUnion = enumToUnion(bottleCatgeroyEn);
export type BottleCatg = Static<typeof BottleCatgUnion>;

// ------------- Create -------------
const CreateBottle = t.Omit(BottleInsertSchema, [
  "shopId",
  "createdAt",
  "updatedAt",
]);
const CreateBottleLot = t.Omit(LotInsertSchema, [
  "bottleId",
  "createdAt",
  "updatedAt",
  "remainingStock",
]);
export type CreateBottleLot = Static<typeof CreateBottleLot>;

//
const CreateBottleBody = t.Object({
  bottleBody: CreateBottle,
  lotBody: CreateBottleLot,
});

export type CreateBottleBody = Static<typeof CreateBottleBody>;

// ------------- Update -------------
const UpdateBottleBody = t.Partial(CreateBottle);
export type UpdateBottleBody = Static<typeof UpdateBottleBody>;

const UpdateBottleLotBody = t.Partial(CreateBottleLot);
export type UpdateBottleLotBody = Static<typeof UpdateBottleLotBody>;

// ------------- Context Query -------------
const BottlesQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    sku: t.String(),
    type: BottleTypeUnion,
    catg: BottleCatgUnion,
    minStock: t.Number({ minimum: 0, default: 0 }),
    maxStock: t.Number({ minimum: 1 }),
    minPrice: t.Number({ minimum: 0 }),
    maxPrice: t.Number({ minimum: 0 }),
    ...QueriesMeta,
  }),
);
export type BottlesQueryFilters = Static<typeof BottlesQueryFilters>;

// ------------- URL Params -------------
const baseParams = {
  shopId: ID,
  bottleId: ID,
};
const BottleParams = t.Object(baseParams);
type BottleParams = Static<typeof BottleParams>;

const BottleLotParams = t.Object({
  ...baseParams,
  lotId: ID,
});
type BottleLotParams = Static<typeof BottleLotParams>;

const BottleLotAmountParams = t.Object({
  ...baseParams,
  lotId: ID,
  tierId: ID,
});
type BottleLotAmountParams = Static<typeof BottleLotAmountParams>;
// ------------- Service IDs -------------
export interface ServiceIDs {
  base: InvAuth;
  extended: InvAuth & { bottleId: number };
  extendedLot: ServiceIDs["extended"] & { lotId: number };
}

// ------------- Bottle CTXs -------------
export interface BottleCTXs {
  create: Ctx<CreateBottleBody, ShopParams>;
  update: Ctx<UpdateBottleBody, BottleParams>;
  del: Ctx<unknown, BottleParams>;
  qAll: Ctx<unknown, ShopParams>;
  qOne: Ctx<unknown, BottleParams>;

  // lots
  createLot: Ctx<CreateBottleLot, BottleParams>;
  updateLot: Ctx<UpdateBottleLotBody, BottleLotParams>;
  deleteLot: Ctx<unknown, BottleLotParams>;

  // amount tier
  addAmountTier: Ctx<CreateTier, BottleLotParams>;
  updateAmountTier: Ctx<UpdateTier, BottleLotAmountParams>;
  deleteAmountTier: Ctx<unknown, BottleLotAmountParams>;
}

export const BottleSchema = {
  qAll: { params: ShopParams, query: BottlesQueryFilters },
  create: { params: ShopParams, body: CreateBottleBody },
  qOne: { params: BottleParams },
  update: { params: BottleParams, body: UpdateBottleBody },
  del: { params: BottleParams },

  // lots
  createLot: { params: BottleParams, body: CreateBottleLot },
  updateLot: { params: BottleLotParams, body: UpdateBottleLotBody },
  deleteLot: { params: BottleLotParams },

  // Amount Tiers
  addAmountTier: { params: BottleLotParams, body: CreateTier },
  updateAmountTier: { params: BottleLotAmountParams, body: UpdateTier },
  delAmountTier: { params: BottleLotAmountParams },
};
