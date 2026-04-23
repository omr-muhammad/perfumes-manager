import { createInsertSchema } from "drizzle-typebox";
import { alcoholsTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
} from "../../../utils/globalSchema";

const AlcoholDrivedSchema = createInsertSchema(alcoholsTable, {
  ltBuyPrice: t.Number({ minimum: 0 }),
  ltSellPrice: t.Number({ minimum: 0 }),
  amountInMl: t.Number({ minimum: 0 }),
  concentration: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  expiryDate: t.String(),
});

// -------------- Create --------------
const CreateAlcoBody = t.Omit(AlcoholDrivedSchema, ["shopId", "unitSellPrice"]);
export type CreateAlcoBody = Static<typeof CreateAlcoBody>;

// -------------- Update --------------
const UpdateAlcoBody = t.Partial(CreateAlcoBody);
export type UpdateAlcoBody = Static<typeof UpdateAlcoBody>;

// -------------- Query --------------
const AlcoholsQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    type: t.String(),
    minAmount: t.Number({ minimum: 0 }),
    maxAmount: t.Number({ minimum: 0 }),
    amountUnit: t.Union([t.Literal("ml"), t.Literal("l")]),
    minLtPrice: t.Number({ minimum: 0 }),
    maxLtPrice: t.Number({ minimum: 0 }),
    minConcentration: t.Number({ maximum: 100, minimum: 1 }),
    maxConcentration: t.Number({ maximum: 100, minimum: 1 }),
    expiresBefore: t.String(),
    expiresAfter: t.String(),
    ...QueriesMeta,
  }),
);
export type AlcoholQueryFilters = Static<typeof AlcoholsQueryFilters>;

// -------------- URL Params --------------
const AlcoInvParams = t.Object({
  shopId: ID,
  alcoholId: ID,
});
type AlcoInvParams = Static<typeof AlcoInvParams>;

// -------------- Alco Ctxs --------------
export interface AlcoCTXs {
  createAlco: Ctx<CreateAlcoBody, ShopParams>;
  updateAlco: Ctx<UpdateAlcoBody, AlcoInvParams>;
  delAlco: Ctx<unknown, AlcoInvParams>;
  queryAll: Ctx<unknown, ShopParams>;
  queryOne: Ctx<unknown, AlcoInvParams>;
}

// -------------- Alco Schema --------------
export const AlcoSchema = {
  create: { params: ShopParams, body: CreateAlcoBody },
  queryAll: { params: ShopParams, query: AlcoholsQueryFilters },
  update: { params: AlcoInvParams, body: UpdateAlcoBody },
  del: { params: AlcoInvParams },
  queryOne: { params: AlcoInvParams },
};
