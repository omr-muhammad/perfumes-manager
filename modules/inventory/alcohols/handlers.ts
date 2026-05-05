import { response as res } from "../../../utils/response";
import type { AlcoCTXs } from "./schema";
import * as alcoService from "./service";

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
