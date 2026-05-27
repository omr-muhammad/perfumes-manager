import type { BottleCTXs } from "./schema";
import * as btlService from "./service";
import { response as res } from "../../../utils/response";
import * as amountTierService from "../amountTiers/service";

export async function createBtl(context: BottleCTXs["create"]) {
  const { body, params, authPayload } = context;

  const bottle = await btlService.createBottle(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Bottle created.", { bottle });
}

export async function updateBtl(context: BottleCTXs["update"]) {
  const { authPayload, body, params } = context;

  const bottle = await btlService.updateBottle(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Bottle updated.", { bottle });
}

export async function deleteBtl(context: BottleCTXs["del"]) {
  const { params, authPayload } = context;

  const bottle = await btlService.deleteBottle({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Bottle deleted.", { bottleId: bottle.id });
}

export async function getShopBottles(context: BottleCTXs["qAll"]) {
  const { params, authPayload, query } = context;

  const bottles = await btlService.queryAll(
    { ...params, ownerId: authPayload.userId },
    query,
  );

  return res.ok("Bottles Fetced.", { bottles });
}

export async function getBtlById(context: BottleCTXs["qOne"]) {
  const { authPayload, params } = context;

  const bottle = await btlService.queryById({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Bottle fetched.", {
    bottle,
  });
}

// ------------------- Bottle Lot -------------------
export async function createBtlLot(context: BottleCTXs["createLot"]) {
  const { params, body, authPayload } = context;

  const lot = await btlService.createBtlLot(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Lot created.", { lot });
}

export async function updateBtlLot(context: BottleCTXs["updateLot"]) {
  const { params, body, authPayload } = context;

  const lot = await btlService.updateBtlLot(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Lot updated.", { lot });
}

export async function updateLotStock(context: BottleCTXs["updateLotStock"]) {
  const { authPayload, params, body } = context;

  const lot = await btlService.updateLotStock(
    { ...params, ownerId: authPayload.userId },
    body.newStock,
  );

  return res.ok("Lot stock updated.", { newStock: lot.stock });
}

export async function deleteBtlLot(context: BottleCTXs["deleteLot"]) {
  const { params, authPayload } = context;

  const lot = await btlService.deleteBtlLot({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Lot deleted.", { id: lot.id });
}

// Amount Tiers
export async function addAmountTier(context: BottleCTXs["addAmountTier"]) {
  const {
    params: { bottleId: entityId, ...rest },
    body,
    authPayload,
  } = context;

  const tier = await amountTierService.create(
    { ...rest, ownerId: authPayload.userId },
    { entityId, entityType: "bottle" },
    body,
  );

  return res.ok("Amount Tier created.", { amountTier: tier });
}

export async function updateAmountTier(
  context: BottleCTXs["updateAmountTier"],
) {
  const {
    params: { bottleId: entityId, ...rest },
    body,
    authPayload,
  } = context;

  const tier = await amountTierService.update(
    { ...rest, ownerId: authPayload.userId },
    { entityId, entityType: "bottle" },
    body,
  );

  return res.ok("Amount Tier updated.", { amountTier: tier });
}

export async function deleteAmountTier(
  context: BottleCTXs["deleteAmountTier"],
) {
  const {
    params: { bottleId: entityId, ...rest },
    authPayload,
  } = context;

  const tier = await amountTierService.remove(
    {
      ...rest,
      ownerId: authPayload.userId,
    },
    {
      entityId,
      entityType: "bottle",
    },
  );

  return res.ok("Amount Tier deleted.", { amountTier: tier });
}
