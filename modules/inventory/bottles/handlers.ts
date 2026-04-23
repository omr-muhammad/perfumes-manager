import type { AlcoCTXs } from "./schema";
import * as btlService from "./service";
import { response as res } from "../../../utils/response";

export async function createBtl(context: AlcoCTXs["create"]) {
  const { body, params, authPayload } = context;

  const bottle = await btlService.create(
    authPayload.userId,
    params.shopId,
    body,
  );

  return res.ok("Bottle created.", { bottle });
}

export async function updateBtl(context: AlcoCTXs["update"]) {
  const { authPayload, body, params } = context;

  const bottle = await btlService.update(
    authPayload.userId,
    params.shopId,
    params.bottleId,
    body,
  );

  return res.ok("Bottle updated.", { bottle });
}

export async function deleteBtl(context: AlcoCTXs["del"]) {
  const { params, authPayload } = context;

  const bottle = await btlService.remove(
    authPayload.userId,
    params.shopId,
    params.bottleId,
  );

  return res.ok("Bottle deleted.", { bottle });
}

export async function getShopBottles(context: AlcoCTXs["qAll"]) {
  const { params, authPayload, query } = context;

  const bottles = await btlService.queryAll(
    authPayload.userId,
    params.shopId,
    query,
  );

  return bottles;
}

export async function getBtlById(context: AlcoCTXs["qOne"]) {
  const { authPayload, params } = context;

  const bottle = await btlService.queryById(
    authPayload.userId,
    params.shopId,
    params.bottleId,
  );

  return res.ok("Bottle fetched.", {
    bottle,
  });
}
