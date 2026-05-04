import { createInsertSchema } from "drizzle-typebox";
import { alcoholLotsTable, alcoholsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
} from "../../../utils/globalSchema";

const BaseAlco = createInsertSchema(alcoholsTable, {
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});
const AlcoLot = createInsertSchema(alcoholLotsTable, {
  receivedAt: t.String(),
  costPerLiter: t.Number({ minimum: 0 }),
  baseSellPerLiter: t.Number({ minimum: 0 }),
  expiryDate: t.String(),
});

// -------------- Create Alcohol --------------
const Alcohol = t.Omit(BaseAlco, [
  "shopId",
  "unitSellPrice",
  "createdAt",
  "updatedAt",
]);
const AlcoholLot = t.Omit(AlcoLot, [
  "createdAt",
  "updatedAt",
  "alcoholId",
  "remainingAmount",
]);
type AlcoholLot = Static<typeof AlcoholLot>;

const CreateAlcoBody = t.Object({
  alcohol: Alcohol,
  alcoholLot: AlcoholLot,
});
export type CreateAlcoBody = Static<typeof CreateAlcoBody>;

// -------------- Update Alcohol --------------
const UpdateAlcoBody = t.Partial(Alcohol);
export type UpdateAlcoBody = Static<typeof UpdateAlcoBody>;

// -- Update lot
const UpdateLotBody = t.Partial(AlcoholLot);
export type UpdateLotBody = Static<typeof UpdateLotBody>;

// -------------- Query --------------
const AlcoholsQueryFilters = t.Partial(
  t.Object({
    // alcohols filters
    search: t.String(),
    type: t.String(),
    minConcentration: t.Number({ maximum: 100, minimum: 1 }),
    maxConcentration: t.Number({ maximum: 100, minimum: 1 }),

    // lots filters
    minAmount: t.Number({ minimum: 0 }),
    maxAmount: t.Number({ minimum: 0 }),
    minLtPrice: t.Number({ minimum: 0 }),
    maxLtPrice: t.Number({ minimum: 0 }),
    expiresBefore: t.String(),
    expiresAfter: t.String(),
    ...QueriesMeta,
  }),
);
export type AlcoholQueryFilters = Static<typeof AlcoholsQueryFilters>;

// -------------- URL Params --------------
const AlcoParams = t.Object({
  shopId: ID,
  alcoholId: ID,
});
type AlcoParams = Static<typeof AlcoParams>;

const AlcoLotParams = t.Object({
  shopId: ID,
  alcoholId: ID,
  lotId: ID,
});
type AlcoLotParams = Static<typeof AlcoLotParams>;

// -------------- Alco Ctxs --------------
export interface AlcoCTXs {
  // alcohols
  createAlco: Ctx<CreateAlcoBody, ShopParams>;
  updateAlco: Ctx<UpdateAlcoBody, AlcoParams>;
  delAlco: Ctx<unknown, AlcoParams>;
  queryAll: Ctx<unknown, ShopParams>;
  queryOne: Ctx<unknown, AlcoParams>;

  // alco lots
  createAlcoLot: Ctx<AlcoholLot, AlcoParams>;
  updateAlcoLot: Ctx<UpdateLotBody, AlcoLotParams>;
  delAlcoLot: Ctx<unknown, AlcoLotParams>;
}

// -------------- Alco Schema --------------
export const AlcoSchema = {
  create: { params: ShopParams, body: CreateAlcoBody },
  queryAll: { params: ShopParams, query: AlcoholsQueryFilters },
  update: { params: AlcoParams, body: UpdateAlcoBody },
  del: { params: AlcoParams },
  queryOne: { params: AlcoParams },

  // Alco Lots
  createLot: { params: AlcoParams, body: AlcoLot },
  updateLot: { params: AlcoLotParams, body: UpdateLotBody },
  delLot: { params: AlcoLotParams },
};
