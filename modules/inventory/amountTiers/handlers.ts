import type { ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type { TierCTXs } from "./schema";
import * as amountTierService from "./service";

// Amount Tiers
export async function addAmountTier(context: TierCTXs["create"]) {
  const { params, body, authPayload, meta } = context;

  const tier = await amountTierService.create(
    { ...(params as ShopParams), ownerId: authPayload.userId },
    meta,
    body,
  );

  return res.ok("Amount Tier created.", { amountTier: tier });
}

export async function updateAmountTier(context: TierCTXs["update"]) {
  const { params, body, authPayload, meta } = context;

  const tier = await amountTierService.update(
    { ...params, ownerId: authPayload.userId },
    meta,
    body,
  );

  return res.ok("Amount Tier updated.", { amountTier: tier });
}

export async function deleteAmountTier(context: TierCTXs["delete"]) {
  const { params, authPayload, meta } = context;

  const tier = await amountTierService.remove(
    {
      ...params,
      ownerId: authPayload.userId,
    },
    meta,
  );

  return res.ok("Amount Tier deleted.", { amountTierId: tier.id });
}
