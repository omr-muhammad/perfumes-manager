import { t, type Static } from "elysia";
import { enumToUnion } from "../../../utils/unionToLiteral";
import { entityTypeEn, pricingTypeEn } from "../../../db/schema/enums";
import { ID, ShopParams, type Ctx } from "../../../utils/globalSchema";

const pricingtTypeUnion = enumToUnion(pricingTypeEn);
const EntityTypeUnion = enumToUnion(entityTypeEn);

// -------------- Create --------------
export const CreateTier = t.Object({
  minAmount: t.Number({ minimum: 1 }),
  maxAmount: t.Optional(t.Number({ minimum: 1 })),
  pricingType: pricingtTypeUnion,
  value: t.Number({ minimum: 0 }),
  discountType: t.Optional(
    t.Union([t.Literal("percentage"), t.Literal("fixed")]),
  ),
  maxDiscountAmount: t.Optional(t.Number({ minimum: 0 })),
});
export type CreateTier = Static<typeof CreateTier>;

// -------------- Update --------------
export const UpdateTier = t.Partial(CreateTier);
export type UpdateTier = Static<typeof UpdateTier>;

// -------------- Service IDs --------------
export type BaseIDs = { ownerId: number; shopId: number };
export type ExtendedIDs = { tierId: number } & BaseIDs;

// -------------- Meta --------------
const MetaSchema = t.Object({
  entityId: ID,
  entityType: EntityTypeUnion,
});
type AmountTierMeta = Static<typeof MetaSchema>;
type CtxMeta = { meta: AmountTierMeta };

const TierParams = t.Object({ shopId: ID, tierId: ID });
type TierParams = Static<typeof TierParams>;

// -------------- CTXs --------------
export interface TierCTXs {
  create: Ctx<CreateTier, ShopParams> & CtxMeta;
  update: Ctx<UpdateTier, TierParams> & CtxMeta;
  delete: Ctx<unknown, TierParams> & CtxMeta;
}

// -------------- CTXs Schema --------------
export const TierSchema = {
  create: { body: CreateTier, params: ShopParams },
  update: { body: UpdateTier, params: TierParams },
  delete: { params: TierParams },
};
