import { param } from "drizzle-orm";
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

  return res.ok("Bottle updated.", { bottle });
}

export async function deleteBtl(context: Ctx<unknown, BtlInvParams>) {
  const { params, authPayload } = context;

  const bottle = await btlService.remove(
    authPayload.userId,
    params.shopId,
    params.btlId,
  );

  return res.ok("Bottle deleted.", { bottle });
}

export async function getShopBottles(context: Ctx<unknown, ShopParams>) {
  const { params, authPayload, query } = context;

  const bottles = await btlService.queryAll(
    authPayload.userId,
    params.shopId,
    query,
  );

  return bottles;
}

export async function getBtlById(context: Ctx<unknown, BtlInvParams>) {
  const { authPayload, params } = context;

  const bottle = await btlService.queryById(
    authPayload.userId,
    params.shopId,
    params.btlId,
  );

  return res.ok("Bottle fetched.", {
    bottle,
  });
}
