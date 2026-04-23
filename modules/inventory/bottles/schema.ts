import { createInsertSchema } from "drizzle-typebox";
import { bottlesTable } from "../../../db/schema";
import { t, type Static } from "elysia";
import {
  ID,
  QueriesMeta,
  ShopParams,
  type Ctx,
} from "../../../utils/globalSchema";

const BottlesSchema = createInsertSchema(bottlesTable, {
  size: t.Number({ minimum: 1 }),
  sellPrice: t.Number({ minimum: 0 }),
  buyPrice: t.Number({ minimum: 0 }),
});

// ------------- Create -------------
const CreateBottleBody = t.Omit(BottlesSchema, [
  "shopId",
  "createdAt",
  "updatedAt",
]);
export type CreateBottleBody = Static<typeof CreateBottleBody>;

// ------------- Update -------------
const UpdateBottleBody = t.Partial(CreateBottleBody);
export type UpdateBottleBody = Static<typeof UpdateBottleBody>;

// ------------- Context Query -------------
const BottlesQueryFilters = t.Partial(
  t.Object({
    search: t.String(),
    sku: t.String(),
    type: t.Union([t.Literal("oil"), t.Literal("spray"), t.Literal("test")]),
    catg: t.Union([t.Literal("normal"), t.Literal("elegent")]),
    minStock: t.Number({ minimum: 0, default: 0 }),
    maxStock: t.Number({ minimum: 1 }),
    minPrice: t.Number({ minimum: 0 }),
    maxPrice: t.Number({ minimum: 0 }),
    ...QueriesMeta,
  }),
);
export type BottlesQueryFilters = Static<typeof BottlesQueryFilters>;

// ------------- URL Params -------------
const BtlInvParams = t.Object({
  shopId: ID,
  bottleId: ID,
});
type BtlInvParams = Static<typeof BtlInvParams>;

// ------------- Alco CTXs -------------
export interface AlcoCTXs {
  create: Ctx<CreateBottleBody, ShopParams>;
  update: Ctx<UpdateBottleBody, BtlInvParams>;
  del: Ctx<unknown, BtlInvParams>;
  qAll: Ctx<unknown, ShopParams>;
  qOne: Ctx<unknown, BtlInvParams>;
}

export const AlcoSchema = {
  qAll: { params: ShopParams, query: BottlesQueryFilters },
  create: { params: ShopParams, body: CreateBottleBody },
  qOne: { params: BtlInvParams },
  update: { params: BtlInvParams, body: UpdateBottleBody },
  del: { params: BtlInvParams },
};
