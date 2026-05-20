import { t, type Static } from "elysia";
import {
  discountTypeEn,
  entityTypeEn,
  pricingTypeEn,
} from "../../../db/schema/enums";
import { ID, type Ctx } from "../../../utils/globalSchema";

// -------------- Create --------------
export const CreateTier = t.Object({
  minAmount: t.Number({ minimum: 1 }),
  maxAmount: t.Optional(t.Number({ minimum: 1 })),
  pricingType: t.Union([t.Literal("discount"), t.Literal("fixed")], {
    error: `pricing type can only be one of (${pricingTypeEn.enumValues.join(", ")})`,
  }),
  value: t.Number({ minimum: 0 }),
  discountType: t.Optional(
    t.Union([t.Literal("percentage"), t.Literal("fixed")], {
      error: `discount type can only be one of (${discountTypeEn.enumValues.join(", ")})`,
    }),
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
  entityType: t.Union(
    [t.Literal("alcohol"), t.Literal("bottle"), t.Literal("compound")],
    {
      error: `Entity type can only be one of (${entityTypeEn.enumValues.join(", ")})`,
    },
  ),
});
export type AmountTierMeta = Static<typeof MetaSchema>;
type CtxMeta = { meta: AmountTierMeta };

const TierID = t.Numeric({
  minimum: 1,
  error: "Invalid id, expected a positive number",
});
const TierParams = t.Union([
  t.Object({
    shopId: TierID,
    alcoholId: TierID,
    lotId: TierID,
    tierId: TierID,
  }),
  t.Object({ shopId: TierID, bottleId: TierID, lotId: TierID, tierId: TierID }),
  t.Object({ shopId: TierID, compId: TierID, lotId: TierID, tierId: TierID }),
]);
type TierParams = Static<typeof TierParams>;

// -------------- CTXs Schema --------------
export const TierSchema = {
  create: { body: CreateTier },
  update: { body: UpdateTier, params: TierParams },
  delete: { params: TierParams },
};

// -------------- CTXs --------------
export interface TierCTXs {
  create: Ctx<CreateTier> & CtxMeta;
  update: Ctx<UpdateTier, TierParams> & CtxMeta;
  delete: Ctx<unknown, TierParams> & CtxMeta;
}
