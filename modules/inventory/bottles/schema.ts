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

const BottleType = t.Union(enumToUnion(bottleTypeEn), {
  error: `Bottle Type must be one of (${bottleTypeEn.enumValues.join(", ")})`,
});
export type BottleType = Static<typeof BottleType>;

const BottleCatg = t.Union(enumToUnion(bottleCatgeroyEn), {
  error: `Bottle category must be one of (${bottleCatgeroyEn.enumValues.join(", ")})`,
});
export type BottleCatg = Static<typeof BottleCatg>;

const BottleInsertSchema = createInsertSchema(bottlesTable, {
  size: t.Number({ minimum: 1 }),
  type: BottleType,
  category: BottleCatg,
});
const LotInsertSchema = createInsertSchema(bottlesLotsTable, {
  costPrice: t.Number({ minimum: 0 }),
  baseSellPrice: t.Number({ minimum: 0 }),
  receivedAt: t.Optional(t.String()),
});

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

const UpdateBottleLotBody = t.Partial(t.Omit(CreateBottleLot, ["stock"]));
export type UpdateBottleLotBody = Static<typeof UpdateBottleLotBody>;

const UpdateLotStock = t.Object({ newStock: t.Number({ minimum: 0 }) });
export type UpdateLotStock = Static<typeof UpdateLotStock>;

// ------------- Context Query -------------
const BottlesQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    sku: t.String(),
    type: BottleType,
    catg: BottleCatg,
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
export type BottleLotParams = Static<typeof BottleLotParams>;

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
  updateLotStock: Ctx<UpdateLotStock, BottleLotParams>;
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
  updateLotStock: { params: BottleLotParams, body: UpdateLotStock },
  deleteLot: { params: BottleLotParams },

  // Amount Tiers
  addAmountTier: { params: BottleLotParams, body: CreateTier },
  updateAmountTier: { params: BottleLotAmountParams, body: UpdateTier },
  delAmountTier: { params: BottleLotAmountParams },
};
