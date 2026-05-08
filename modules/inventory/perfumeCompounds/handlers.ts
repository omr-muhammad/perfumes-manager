import { response as res } from "../../../utils/response";
import type { CompCTXs } from "./schema";
import * as compService from "./service";

export async function createComp(context: CompCTXs["createComp"]) {
  const { authPayload, params, body } = context;

  const compound = await compService.createComp(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Compound create.", { compound });
}

export async function updateComp(context: CompCTXs["updateComp"]) {
  const { body, params, authPayload } = context;

  const compound = await compService.updateComp(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Perfume Compound updated.", { compound });
}

export async function deleteComp(context: CompCTXs["delComp"]) {
  const { authPayload, params } = context;

  const compound = await compService.removeComp({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Perfume Compound deleted.", { id: compound.id });
}

export async function getShopCompounds(context: CompCTXs["queryAllComps"]) {
  const { params, authPayload, query } = context;

  const compounds = await compService.queryAll(
    { ...params, ownerId: authPayload.userId },
    query,
  );

  return res.ok("Perfumes Compounds fetched.", { compounds });
}

export async function getCompById(context: CompCTXs["queryCompById"]) {
  const { authPayload, params } = context;

  const compound = await compService.queryById({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Compound fetched.", { compound });
}

export async function createCompLot(context: CompCTXs["createCompLot"]) {
  const { params, body, authPayload } = context;

  const compLot = await compService.createLot(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Lot created.", { lot: compLot });
}

export async function updateCompLot(context: CompCTXs["updateCompoundLot"]) {
  const { params, body, authPayload } = context;

  const compLot = await compService.updateLot(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Lot updated.", { lot: compLot });
}

export async function delCompLot(context: CompCTXs["delCompoundLot"]) {
  const { params, authPayload } = context;

  const compLot = await compService.deleteLot({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Lot deleted.", { id: compLot.id });
}

// AGING
export async function addAgingToLot(context: CompCTXs["createLotAging"]) {
  const { params, body, authPayload } = context;

  const aging = await compService.addAging(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Aging Added to perfume compound.", { aging });
}

export async function updateLotAging(context: CompCTXs["updateLotAging"]) {
  const { authPayload, body, params } = context;

  const aging = await compService.updateAging(
    { ...params, ownerId: authPayload.userId },
    body,
  );

  return res.ok("Perfume Compound Aging updated.", { aging });
}

export async function deleteLotAging(context: CompCTXs["delLotAging"]) {
  const { params, authPayload, body } = context;

  const aging = await compService.deleteAging(
    { ...params, ownerId: authPayload.userId },
    body.syncAlcohol,
  );

  return res.ok("Aging deleted.", { id: aging.id, lotId: params.lotId });
}

export async function getLotAgings(context: CompCTXs["queryLotAgings"]) {
  const { authPayload, params } = context;

  const compAgings = await compService.queryCompAgings({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Perfume Compound Agings fetched.", { agings: compAgings });
}

export async function getLotAgingById(context: CompCTXs["queryOneAging"]) {
  const { authPayload, params } = context;

  const compAging = await compService.queryCompAgingById({
    ...params,
    ownerId: authPayload.userId,
  });

  return res.ok("Perfume Compound Agings fetched.", { agings: compAging });
}
