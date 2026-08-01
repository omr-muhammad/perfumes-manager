import { createInsertSchema } from "drizzle-typebox";
import { alcoholLotsTable, alcoholsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
  type InvAuth,
} from "../../../utils/globalSchema";
import { CreateTier, UpdateTier } from "../amountTiers/schema";

const BaseAlco = createInsertSchema(alcoholsTable, {
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});
const AlcoLot = createInsertSchema(alcoholLotsTable, {
  receivedAt: t.Optional(t.String()),
  literCost: t.Number({ minimum: 0 }),
  literPrice: t.Number({ minimum: 0 }),
  expiryDate: t.String(),
});

// -------------- Create Alcohol --------------
const Alcohol = t.Omit(BaseAlco, [
  "shopId",
  "unitSellPrice",
  "createdAt",
  "updatedAt",
]);

const AlcoholLot = t.Intersect([
  t.Omit(AlcoLot, [
    "createdAt",
    "updatedAt",
    "alcoholId",
    "amountInMl",
    "remainingAmount",
  ]),
  t.Object({ amountInLiter: t.Number({ minimum: 0 }) }),
]);
export type AlcoholLot = Static<typeof AlcoholLot>;
// const AlcoholLot = t.Omit(AlcoLot, [
//   "createdAt",
//   "updatedAt",
//   "alcoholId",
//   "amountInMl",
//   "remainingAmount",
// ]);
// export type AlcoholLot = Static<typeof AlcoholLot>;

const CreateAlcoBody = t.Object({
  alcohol: Alcohol,
  alcoholLot: AlcoholLot,
});
export type CreateAlcoBody = Static<typeof CreateAlcoBody>;

// -------------- Update Alcohol --------------
const UpdateAlcoBody = t.Partial(Alcohol);
export type UpdateAlcoBody = Static<typeof UpdateAlcoBody>;

// -- Update lot
const UpdateLotBody = t.Partial(t.Omit(AlcoholLot, ["amountInLiter"]));
export type UpdateLotBody = Static<typeof UpdateLotBody>;

const UpdateLotStock = t.Object({ amountInLiter: t.Number() });
export type UpdateLotStock = Static<typeof UpdateLotStock>;

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

export const AlcoLotParams = t.Object({
  shopId: ID,
  alcoholId: ID,
  lotId: ID,
});
export type AlcoLotParams = Static<typeof AlcoLotParams>;

const AlcoLotAmountParams = t.Object({
  shopId: ID,
  alcoholId: ID,
  lotId: ID,
  tierId: ID,
});
type AlcoLotAmountParams = Static<typeof AlcoLotAmountParams>;

// -------------- Service IDs --------------
export interface ServiceIDs {
  BaseAlcoIDs: InvAuth;
  ExtendedAlcoIDs: InvAuth & { alcoholId: number };
  ExtendedLotIDs: ServiceIDs["ExtendedAlcoIDs"] & { lotId: number };
}

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
  updateLotStock: Ctx<UpdateLotStock, AlcoLotParams>;
  delAlcoLot: Ctx<unknown, AlcoLotParams>;

  // amount tier
  addAmountTier: Ctx<CreateTier, AlcoLotParams>;
  updateAmountTier: Ctx<UpdateTier, AlcoLotAmountParams>;
  deleteAmountTier: Ctx<unknown, AlcoLotAmountParams>;
}

// -------------- Alco Schema --------------
export const AlcoSchema = {
  create: {
    params: ShopParams,
    body: CreateAlcoBody,
    detail: {
      summary: "Add an alcohol to shop inventory",
      tags: ["Inventory - Alcohols"],
    },
  },
  queryAll: {
    params: ShopParams,
    query: AlcoholsQueryFilters,
    detail: {
      summary: "List alcohols in shop inventory",
      tags: ["Inventory - Alcohols"],
    },
  },
  update: {
    params: AlcoParams,
    body: UpdateAlcoBody,
    detail: { summary: "Update an alcohol", tags: ["Inventory - Alcohols"] },
  },
  del: {
    params: AlcoParams,
    detail: { summary: "Delete an alcohol", tags: ["Inventory - Alcohols"] },
  },
  queryOne: {
    params: AlcoParams,
    detail: {
      summary: "Get an alcohol by id",
      tags: ["Inventory - Alcohols"],
    },
  },

  // Alco Lots
  createLot: {
    params: AlcoParams,
    body: AlcoholLot,
    detail: {
      summary: "Add a stock lot to an alcohol",
      tags: ["Inventory - Alcohols"],
    },
  },
  updateLot: {
    params: AlcoLotParams,
    body: UpdateLotBody,
    detail: {
      summary: "Update an alcohol lot",
      tags: ["Inventory - Alcohols"],
    },
  },
  updateLotStock: {
    params: AlcoLotParams,
    body: UpdateLotStock,
    detail: {
      summary: "Adjust stock quantity for an alcohol lot",
      tags: ["Inventory - Alcohols"],
    },
  },
  delLot: {
    params: AlcoLotParams,
    detail: {
      summary: "Delete an alcohol lot",
      tags: ["Inventory - Alcohols"],
    },
  },

  // Amount Tiers
  addAmountTier: {
    params: AlcoLotParams,
    body: CreateTier,
    detail: {
      summary: "Add a pricing amount tier to an alcohol lot",
      description:
        "For discount pricing, value must be a percentage between 1 and 100.",
      tags: ["Inventory - Alcohols"],
    },
  },
  updateAmountTier: {
    params: AlcoLotAmountParams,
    body: UpdateTier,
    detail: {
      summary: "Update an alcohol lot's amount tier",
      tags: ["Inventory - Alcohols"],
    },
  },
  delAmountTier: {
    params: AlcoLotAmountParams,
    detail: {
      summary: "Delete an alcohol lot's amount tier",
      tags: ["Inventory - Alcohols"],
    },
  },
};
