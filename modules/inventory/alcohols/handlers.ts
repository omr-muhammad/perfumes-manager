import { response as res } from "../../../utils/response";
import type { AlcoCTXs } from "./schema";
import * as alcoService from "./service";
import * as amountTierService from "../amountTiers/service";

export async function createAlco(context: AlcoCTXs["createAlco"]) {
  const {
    body,
    params: { shopId },
    authPayload: { userId: ownerId },
  } = context;

  const alcohol = await alcoService.createAlco({ shopId, ownerId }, body);

  return res.ok("Alcohol added to inventory.", { alcohol });
}

export async function updateAlco(context: AlcoCTXs["updateAlco"]) {
  const {
    body,
    params,
    authPayload: { userId: ownerId },
  } = context;

  const alcohol = await alcoService.updateAlco({ ...params, ownerId }, body);

  return res.ok("Alcohol Inventory Updates.", { alcohol });
}

export async function deleteAlco(context: AlcoCTXs["delAlco"]) {
  const {
    authPayload: { userId: ownerId },
    params,
  } = context;

  const alcohol = await alcoService.deleteAlco({ ...params, ownerId });

  return res.ok("Alcohol inventory deleted.", { id: alcohol.id });
}

export async function getAllAlcoInv(context: AlcoCTXs["queryAll"]) {
  const {
    authPayload: { userId: ownerId },
    params,
    query,
  } = context;

  const alcohols = await alcoService.queryAll({ ...params, ownerId }, query);

  return res.ok("Alcohols fetched.", { alcohols });
}

export async function getAlcoById(context: AlcoCTXs["queryOne"]) {
  const {
    params,
    authPayload: { userId: ownerId },
  } = context;

  const alcohol = await alcoService.queryById({ ...params, ownerId });

  return res.ok("Alcohol fetched.", { alcohol });
}

export async function createAlcoLot(context: AlcoCTXs["createAlcoLot"]) {
  const {
    params,
    body,
    authPayload: { userId: ownerId },
  } = context;

  const alcoLot = await alcoService.createLot({ ...params, ownerId }, body);

  return res.ok("Alcohol Lot created.", { alcoLot });
}

export async function updateAlcoLot(context: AlcoCTXs["updateAlcoLot"]) {
  const {
    params,
    body,
    authPayload: { userId: ownerId },
  } = context;

  const alcoLot = await alcoService.updateLot({ ...params, ownerId }, body);

  return res.ok("Lot updated.", { alcoLot });
}

export async function deleteAlcoLot(context: AlcoCTXs["delAlcoLot"]) {
  const {
    params,
    authPayload: { userId: ownerId },
  } = context;

  const alcoLot = await alcoService.deleteLot({ ...params, ownerId });

  return res.ok("Deleted success.", { id: alcoLot.id });
}

// Amount Tiers
export async function addAmountTier(context: AlcoCTXs["addAmountTier"]) {
  const {
    params: { alcoholId: entityId, ...rest },
    body,
    authPayload,
  } = context;

  const tier = await amountTierService.create(
    { ...rest, ownerId: authPayload.userId },
    { entityId, entityType: "alcohol" },
    body,
  );

  return res.ok("Amount Tier created.", { amountTier: tier });
}

export async function updateAmountTier(context: AlcoCTXs["updateAmountTier"]) {
  const {
    params: { alcoholId: entityId, ...rest },
    body,
    authPayload,
  } = context;

  const tier = await amountTierService.update(
    { ...rest, ownerId: authPayload.userId },
    { entityId, entityType: "alcohol" },
    body,
  );

  return res.ok("Amount Tier updated.", { amountTier: tier });
}

export async function deleteAmountTier(context: AlcoCTXs["deleteAmountTier"]) {
  const {
    params: { alcoholId: entityId, ...rest },
    authPayload,
  } = context;

  const tier = await amountTierService.remove(
    {
      ...rest,
      ownerId: authPayload.userId,
    },
    {
      entityId,
      entityType: "alcohol",
    },
  );

  return res.ok("Amount Tier created.", { amountTier: tier });
}
