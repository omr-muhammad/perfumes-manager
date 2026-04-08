import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type {
  BtlInvParams,
  CreateBottleBody,
  UpdateBottleBody,
} from "./schema";
import * as btlService from "./service";

export async function createBtl(context: Ctx<CreateBottleBody, ShopParams>) {
  const { body, params, authPayload } = context;

  const bottle = await btlService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  if (!bottle) return res.fail("Failed to create bottle.", { code: "FAILED" });

  return res.ok("Bottle created.", { bottle });
}

export async function updateBtl(context: Ctx<UpdateBottleBody, BtlInvParams>) {
  const { authPayload, body, params } = context;

  const bottle = await btlService.update(
    authPayload.userId,
    params.shopId,
    params.btlId,
    body,
  );

  if (!bottle) return res.fail("Failed to update.", { code: "FAILED" });

  return res.ok("Bottle updated.", { bottle });
}

export async function deleteBtl(context: Ctx<unknown, BtlInvParams>) {
  const { params, authPayload } = context;

  const bottle = await btlService.remove(
    authPayload.userId,
    params.shopId,
    params.btlId,
  );

  if (!bottle)
    return res.fail("Failed to delete, bottle may not exist", {
      code: "FAILED",
    });

  return res.ok("Bottle deleted.", { bottle });
}
