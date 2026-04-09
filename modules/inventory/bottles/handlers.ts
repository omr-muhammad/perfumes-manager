import { param } from "drizzle-orm";
import type { Ctx, ShopParams } from "../../../utils/globalSchema";
import { response as res } from "../../../utils/response";
import type {
  BtlInvParams,
  CreateBottleBody,
  UpdateBottleBody,
} from "./schema";
import * as btlService from "./service";
import { bottles } from "../../../db/schema/bottles";

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

export async function getShopBottles(context: Ctx<unknown, ShopParams>) {
  const { params, authPayload } = context;

  const bottles = await btlService.queryAll(authPayload.userId, params.shopId);

  return bottles;
}

export async function getBtlById(context: Ctx<unknown, BtlInvParams>) {
  const { authPayload, params } = context;

  const bottle = await btlService.queryById(
    authPayload.userId,
    params.shopId,
    params.btlId,
  );

  if (bottle)
    return res.fail(`Bottle with id ${params.btlId} does not exist.`, {
      code: "NOT_FOUND",
    });

  return res.ok("Bottle fetched.", {
    bottle,
  });
}
